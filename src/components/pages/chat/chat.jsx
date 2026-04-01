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

  // Ref per te pasur biseden aktive gjithnje aktuale brenda socket handler-ave
  const activeConvRef = useRef(activeConv);
  useEffect(() => { activeConvRef.current = activeConv; }, [activeConv]);

  // -- Ndihmes: shnderton biseden e paperpunuar nga API ne forme te perdorshem nga UI --

  function normalizeConv(conv) {
    // Gjen perdoruesin tjeter (jo current user) per te shfaqur emrin e tij
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
      online:   onlineUsers.has(other?._id),
      otherId:  other?._id,
    };
  }

  // Shnderton mesazhin nga API ne forme te perdorshem nga UI
  function normalizeMsg(msg) {
    return {
      id:   msg._id,
      text: msg.content,
      // Kontrollon nese mesazhi eshte i userit aktual
      own:  msg.sender?._id === currentUserId || msg.sender === currentUserId,
      time: new Date(msg.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    };
  }

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

  // -- Konfiguron event listener-at e Socket.io --

  useEffect(() => {
    // Rilidhja e socket-it nese faqja u rifreskua dhe socket-i u shkepute
    let socket = getSocket();
    if (!socket || !socket.connected) {
      socket = connectSocket();
    }
    if (!socket) return;

    // Shton mesazhin e ri ne pamje nese biseda eshte aktive, perditeson lastMsg gjithsesi
    const handleMessageNew = ({ conversationId, message }) => {
      if (activeConvRef.current?.id === conversationId) {
        setMessages((prev) => [...prev, normalizeMsg(message)]);
      }
      setConversations((prev) =>
        prev.map((c) =>
          c._id === conversationId
            ? { ...c, lastMessage: { content: message.content, createdAt: message.createdAt } }
            : c
        )
      );
    };

    // Perditeson listen e perdoruesve online/offline
    const handleUserOnline  = ({ userId }) => setOnlineUsers((s) => new Set([...s, userId]));
    const handleUserOffline = ({ userId }) => setOnlineUsers((s) => { const n = new Set(s); n.delete(userId); return n; });

    // Menaxhon indikatorin e shkrimit
    const handleTypingStart = ({ userId }) => setTypingUsers((s) => new Set([...s, userId]));
    const handleTypingStop  = ({ userId }) => setTypingUsers((s) => { const n = new Set(s); n.delete(userId); return n; });

    socket.on("message:new",   handleMessageNew);
    socket.on("user:online",   handleUserOnline);
    socket.on("user:offline",  handleUserOffline);
    socket.on("typing:start",  handleTypingStart);
    socket.on("typing:stop",   handleTypingStop);

    // Pastron event listener-at kur komponenti shkatarrohet (cleanup)
    return () => {
      socket.off("message:new",  handleMessageNew);
      socket.off("user:online",  handleUserOnline);
      socket.off("user:offline", handleUserOffline);
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop",  handleTypingStop);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // -- Zgjedh nje bisede: e normalizon, bashkohet ne socket room dhe ngarkon mesazhet --

  const handleSelectConv = useCallback(async (conv, skipUrlUpdate = false) => {
    const normalized = normalizeConv(conv);
    setActiveConv(normalized);
    setMessages([]);
    setLoadingMsgs(true);

    // Perditeson URL me ?conv=id (vetem kur klikon nga lista, jo nga kerkimi)
    if (!skipUrlUpdate) {
      setSearchParams({ conv: normalized.id }, { replace: true });
    }

    joinConversation(normalized.id);

    try {
      const { messages: list } = await getMessages(normalized.id);
      setMessages(list.map(normalizeMsg));
    } catch (err) {
      console.error("[Chat] Failed to load messages:", err);
    } finally {
      setLoadingMsgs(false);
    }
  }, [onlineUsers]); // eslint-disable-line react-hooks/exhaustive-deps

  // -- Fillon bisede te re nga kerkimi i perdoruesve --

  const handleStartConversation = useCallback(async (user) => {
    try {
      // Vendos ?user=username ne URL gjate hapjes se bisedes nga kerkimi
      setSearchParams({ user: user.username }, { replace: true });

      const { conversation } = await getOrCreateConversation(user._id);
      setConversations((prev) => {
        const exists = prev.find((c) => c._id === conversation._id);
        return exists ? prev : [conversation, ...prev];
      });
      // skipUrlUpdate=true sepse URL tashmë eshte vendosur me lart
      handleSelectConv(conversation, true);
    } catch (err) {
      console.error("[Chat] Failed to start conversation:", err);
    }
  }, [handleSelectConv, setSearchParams]);

  // -- Fshin biseden nga lista dhe pastron pamjen nese ishte aktive --

  const handleDeleteConv = useCallback((convId) => {
    setConversations((prev) => prev.filter((c) => c._id !== convId));
    if (activeConv?.id === convId) {
      setActiveConv(null);
      setMessages([]);
      setSearchParams({}, { replace: true });
    }
  }, [activeConv, setSearchParams]);

  // -- Dergo mesazh me parashikim optimist (shfaqet menjehere pa pritur backend-in) --

  async function handleSend(text) {
    if (!activeConv) return;
    try {
      // Shton mesazhin ne UI menjehere per pergjigje te shpejte
      const optimistic = {
        id:   `opt-${Date.now()}`,
        text,
        own:  true,
        time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, optimistic]);

      // Socket do te transmetoje message:new dhe do te zevendesoje mesazhin optimist
      await sendMessage(activeConv.id, text);
    } catch (err) {
      console.error("[Chat] Failed to send message:", err);
    }
  }

  // Pasuri bisedat me te dhenat e online status te perdoruesit tjeter
  const enrichedConversations = conversations.map((c) => {
    const other = c.participants?.find((p) => p._id !== currentUserId) || c.participants?.[0];
    return { ...c, _otherId: other?._id, _online: onlineUsers.has(other?._id) };
  });

  // Kontrollon nese perdoruesi tjeter ne biseden aktive po shkruan
  const isTyping = activeConv
    ? [...typingUsers].some((uid) => uid === activeConv.otherId)
    : false;

  return (
    <section className="flex w-full h-screen overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      {/* Shiriti anësor: lista e bisedave dhe kerkimi */}
      <Sidebar
        activeConv={activeConv}
        conversations={enrichedConversations}
        onSelectConv={handleSelectConv}
        onStartConversation={handleStartConversation}
        onDeleteConv={handleDeleteConv}
        onlineUsers={onlineUsers}
      />
      {/* Zona kryesore: mesazhet dhe fusha e shkrimit */}
      <div className="flex flex-col flex-1 min-w-0">
        <MessageArea
          activeConv={activeConv}
          messages={messages}
          loading={loadingMsgs}
          isTyping={isTyping}
          isOnline={activeConv ? onlineUsers.has(activeConv.otherId) : false}
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