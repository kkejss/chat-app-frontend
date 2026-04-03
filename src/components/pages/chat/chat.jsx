import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router";
import { Sidebar }     from "@/components/sidebar/sidebar";
import { MessageArea } from "@/components/message/messageArea";
import { ChatInput }   from "@/components/message/chatInput";
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  deleteConversation,
} from "@/services/chat.service";
import { connectSocket, getSocket, joinConversation } from "@/services/socket.service";

// Komponenti kryesor i chat-it - menaxhon bisedat, mesazhet, socket-in dhe online status
export default function Chat() {
  const [conversations, setConversations]   = useState([]);
  const [activeConv,    setActiveConv]      = useState(null);
  const [messages,      setMessages]        = useState([]);
  const [loadingMsgs,   setLoadingMsgs]     = useState(false);
  const [onlineUsers,   setOnlineUsers]     = useState(new Set());
  const [typingUsers,   setTypingUsers]     = useState(new Set());
  const [searchParams, setSearchParams]     = useSearchParams();
  const currentUserId = localStorage.getItem("userId");

  // Ref-e per te pasur gjithnje vlerat aktuale brenda socket handler-ave
  const activeConvRef   = useRef(activeConv);
  const conversationsRef = useRef(conversations);

  useEffect(() => { activeConvRef.current = activeConv; }, [activeConv]);
  useEffect(() => { conversationsRef.current = conversations; }, [conversations]);

  // -- Ndihmes: shnderton biseden e paperpunuar nga API ne forme te perdorshem nga UI --

  function normalizeConv(conv) {
    const other = conv.participants?.find((p) => p._id !== currentUserId) || conv.participants?.[0];
    const firstName = other?.firstName || "User";
    const lastName  = other?.lastName  || "";
    return {
      id:       conv._id,
      _raw:     conv,
      name:     `${firstName} ${lastName}`.trim(),
      username: other?.username || "",
      initials: (firstName[0] + (lastName[0] || "")).toUpperCase(),
      lastMsg:  conv.lastMessage?.content || "",
      time:     conv.lastMessage?.createdAt
                  ? new Date(conv.lastMessage.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
                  : "",
      unread:   0,
      online:   false,
      otherId:  other?._id,
    };
  }

  function normalizeMsg(msg) {
    return {
      id:   msg._id,
      text: msg.content,
      own:  msg.sender?._id === currentUserId || msg.sender === currentUserId,
      time: new Date(msg.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    };
  }

  // -- Konfiguron socket-in dhe event listener-at --
  // Behet nje here ne mount dhe mbetet aktiv per gjithe jeten e komponentit

  useEffect(() => {
    // Lidh socket-in (ose riperdor ate ekzistues)
    const socket = connectSocket();
    if (!socket) return;

    const handleMessageNew = ({ conversationId, message }) => {
      // Shto mesazhin ne pamje nese kjo bisede eshte aktive
      if (activeConvRef.current?.id === conversationId) {
        setMessages((prev) => {
          // Mos shto duplikate (optimistic message zevendesohet)
          const exists = prev.some((m) => m.id === message._id);
          if (exists) return prev;
          // Largo mesazhin optimist dhe shto ate realen
          const filtered = prev.filter((m) => !m.id.startsWith("opt-"));
          return [...filtered, normalizeMsg(message)];
        });
      }
      // Perditeso lastMsg ne listen e bisedave
      setConversations((prev) =>
        prev.map((c) =>
          c._id === conversationId
            ? { ...c, lastMessage: { content: message.content, createdAt: message.createdAt } }
            : c
        )
      );
    };

    const handleUserOnline  = ({ userId }) => setOnlineUsers((s) => new Set([...s, userId]));
    const handleUserOffline = ({ userId }) => setOnlineUsers((s) => { const n = new Set(s); n.delete(userId); return n; });
    const handleTypingStart = ({ userId }) => setTypingUsers((s) => new Set([...s, userId]));
    const handleTypingStop  = ({ userId }) => setTypingUsers((s) => { const n = new Set(s); n.delete(userId); return n; });

    // Kur socket rilidhет pas shkepitjes, ribashkohu ne dhomen aktive
    const handleReconnect = () => {
      console.log("[Socket] Reconnected — rejoining active room");
      if (activeConvRef.current?.id) {
        joinConversation(activeConvRef.current.id);
      }
    };

    socket.on("message:new",   handleMessageNew);
    socket.on("user:online",   handleUserOnline);
    socket.on("user:offline",  handleUserOffline);
    socket.on("typing:start",  handleTypingStart);
    socket.on("typing:stop",   handleTypingStop);
    socket.on("reconnect",     handleReconnect);

    return () => {
      socket.off("message:new",  handleMessageNew);
      socket.off("user:online",  handleUserOnline);
      socket.off("user:offline", handleUserOffline);
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop",  handleTypingStop);
      socket.off("reconnect",    handleReconnect);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // -- Ngarkon bisedat kur faqja hapet per here te pare --

  useEffect(() => {
    async function load() {
      try {
        const { conversations: list } = await getConversations();
        setConversations(list);

        // Rikthen biseden aktive nga URL nese faqja rifrekohet
        const convId = searchParams.get("conv");
        if (convId) {
          const match = list.find((c) => c._id === convId);
          if (match) handleSelectConv(match);
        }
      } catch (err) {
        console.error("[Chat] Failed to load conversations:", err);
      }
    }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // -- Zgjedh nje bisede --

  const handleSelectConv = useCallback(async (conv, skipUrlUpdate = false) => {
    const normalized = normalizeConv(conv);
    setActiveConv(normalized);
    setMessages([]);
    setLoadingMsgs(true);

    if (!skipUrlUpdate) {
      setSearchParams({ conv: normalized.id }, { replace: true });
    }

    // Bashkohu ne dhomen e socket-it per kete bisede
    joinConversation(normalized.id);

    try {
      const { messages: list } = await getMessages(normalized.id);
      setMessages(list.map(normalizeMsg));
    } catch (err) {
      console.error("[Chat] Failed to load messages:", err);
    } finally {
      setLoadingMsgs(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // -- Fillon bisede te re nga kerkimi --

  const handleStartConversation = useCallback(async (user) => {
    try {
      setSearchParams({ user: user.username }, { replace: true });
      const { conversation } = await getOrCreateConversation(user._id);
      setConversations((prev) => {
        const exists = prev.find((c) => c._id === conversation._id);
        return exists ? prev : [conversation, ...prev];
      });
      handleSelectConv(conversation, true);
    } catch (err) {
      console.error("[Chat] Failed to start conversation:", err);
    }
  }, [handleSelectConv, setSearchParams]);

  // -- Fshin biseden --

  const handleDeleteConv = useCallback((convId) => {
    setConversations((prev) => prev.filter((c) => c._id !== convId));
    if (activeConvRef.current?.id === convId) {
      setActiveConv(null);
      setMessages([]);
      setSearchParams({}, { replace: true });
    }
  }, [setSearchParams]);

  // -- Dergo mesazh me parashikim optimist --

  async function handleSend(text) {
    if (!activeConv) return;
    try {
      const optimistic = {
        id:   `opt-${Date.now()}`,
        text,
        own:  true,
        time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, optimistic]);
      await sendMessage(activeConv.id, text);
    } catch (err) {
      console.error("[Chat] Failed to send message:", err);
      // Largo mesazhin optimist nese deshtoi dergimi
      setMessages((prev) => prev.filter((m) => !m.id.startsWith("opt-")));
    }
  }

  // Pasuri bisedat me online status
  const enrichedConversations = conversations.map((c) => {
    const other = c.participants?.find((p) => p._id !== currentUserId) || c.participants?.[0];
    return { ...c, _otherId: other?._id, _online: onlineUsers.has(other?._id) };
  });

  const isTyping = activeConv
    ? [...typingUsers].some((uid) => uid === activeConv.otherId)
    : false;

  return (
    <section className="flex w-full h-screen overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      <Sidebar
        activeConv={activeConv}
        conversations={enrichedConversations}
        onSelectConv={handleSelectConv}
        onStartConversation={handleStartConversation}
        onDeleteConv={handleDeleteConv}
        onlineUsers={onlineUsers}
      />
      <div className="flex flex-col flex-1 min-w-0">
        <MessageArea
          activeConv={activeConv}
          messages={messages}
          loading={loadingMsgs}
          isTyping={isTyping}
        />
        <ChatInput
          onSend={handleSend}
          disabled={!activeConv}
          conversationId={activeConv?.id}
        />
      </div>
    </section>
  );
}