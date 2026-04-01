import { useState, useRef } from "react";
import PropTypes from "prop-types";
import { UserProfile } from "@/components/userProfile/userProfile";
import { Search, Trash2 } from "lucide-react";
import { searchUsers, deleteConversation } from "@/services/chat.service";

// Shiriti anesor: logo, kerkimi i perdoruesve, lista e bisedave dhe profili
export function Sidebar({ activeConv, onSelectConv, onStartConversation, onDeleteConv, conversations, onlineUsers }) {
  const [query,       setQuery]       = useState("");
  const [results,     setResults]     = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searching,   setSearching]   = useState(false);
  const [deletingId,  setDeletingId]  = useState(null);

  // Ref per debounce-in e kerkimit (pret 350ms pas shtypjes se fundit)
  const searchTimeout = useRef(null);

  // Fshin biseden: ndal perhapjen e eventit, therr API, perditeson listen
  async function handleDelete(e, convId) {
    e.stopPropagation();
    setDeletingId(convId);
    try {
      await deleteConversation(convId);
      onDeleteConv(convId);
    } catch {
      // Gabimi injorohet me heshtje (mund te shtohet nje toast me vone)
    } finally {
      setDeletingId(null);
    }
  }

  // Kerkon perdorues me debounce: pret 350ms pas shtypjes se fundit te tastit
  async function handleQueryChange(e) {
    const val = e.target.value;
    setQuery(val);

    if (!val.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setShowResults(true);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const { users } = await searchUsers(val.trim());
        setResults(users);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
  }

  // Klik ne rezultat: fillon biseden dhe pastron kerkimin
  function handleSelectResult(user) {
    onStartConversation(user);
    setQuery("");
    setResults([]);
    setShowResults(false);
  }

  // Shnderton biseden nga API ne forme te perdorshem nga UI (per listen)
  function normalizeConv(conv) {
    const currentUserId = localStorage.getItem("userId");
    const other = conv.participants?.find((p) => p._id !== currentUserId) || conv.participants?.[0];
    const firstName = other?.firstName || "User";
    const lastName  = other?.lastName  || "";
    return {
      id:       conv._id,
      name:     `${firstName} ${lastName}`.trim(),
      username: other?.username || "",
      initials: (firstName[0] + (lastName[0] || "")).toUpperCase(),
      lastMsg:  conv.lastMessage?.content || "",
      time:     conv.lastMessage?.createdAt
                  ? new Date(conv.lastMessage.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
                  : "",
      unread:   0,
      online:   onlineUsers?.has(other?._id) || conv._online || false,
    };
  }

  return (
    <aside className="flex flex-col w-72 flex-shrink-0"
      style={{ background: "var(--bg-secondary)", borderRight: "1px solid var(--border-subtle)" }}>

      {/* Logo e aplikacionit */}
      <div className="flex items-center gap-3 px-5 py-4"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <span className="text-lg font-semibold"
          style={{ fontFamily: "'Playfair Display', serif", background: "linear-gradient(135deg, #d4a017, #f5dcaa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Lumiere
        </span>
      </div>

      {/* Fusha e kerkimit me dropdown te rezultateve */}
      <div className="px-4 py-3" style={{ position: "relative" }}>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-subtle)" }}>
          <Search size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <input
            className="flex-1 min-w-0 bg-transparent outline-none text-sm"
            style={{ color: "var(--text-primary)" }}
            placeholder="Search by username..."
            value={query}
            onChange={handleQueryChange}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            onFocus={() => query && setShowResults(true)}
          />
        </div>

        {/* Lista e rezultateve te kerkimit */}
        {showResults && (
          <div className="absolute left-4 right-4 top-full mt-1 rounded-xl overflow-hidden z-50"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-mid)", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
            {searching ? (
              <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>Searching...</p>
            ) : results.length > 0 ? results.map((user, i) => (
              <div key={user._id}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
                style={{ borderBottom: i < results.length - 1 ? "1px solid var(--border-subtle)" : "none" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(212,160,23,0.06)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                onClick={() => handleSelectResult(user)}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #0a2545, #1a4a8a)", color: "var(--gold-light)", border: "1px solid var(--border-subtle)" }}>
                  {(user.firstName[0] + (user.lastName?.[0] || "")).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>@{user.username}</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>No results found</p>
            )}
          </div>
        )}
      </div>

      {/* Etiketa e seksionit */}
      <p className="px-5 pt-2 pb-1 text-xs font-medium uppercase tracking-widest"
        style={{ color: "var(--gold-dim)" }}>
        Conversations
      </p>

      {/* Lista e bisedave me butonin e fshirjes qe shfaqet me hover */}
      <div className="flex-1 overflow-y-auto px-2">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 px-4 text-center">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No conversations yet.</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Search for someone to start chatting.</p>
          </div>
        ) : (
          conversations.map((conv) => {
            const c = normalizeConv(conv);
            return (
              <div key={c.id}
                className="flex items-center gap-3 px-3 py-3 rounded-xl mb-1 cursor-pointer transition-all group"
                style={{
                  background: activeConv?.id === c.id ? "rgba(26,74,138,0.25)" : "transparent",
                  border:     activeConv?.id === c.id ? "1px solid rgba(26,74,138,0.4)" : "1px solid transparent",
                }}
                onMouseEnter={e => { if (activeConv?.id !== c.id) e.currentTarget.style.background = "rgba(212,160,23,0.05)"; }}
                onMouseLeave={e => { if (activeConv?.id !== c.id) e.currentTarget.style.background = "transparent"; }}
                onClick={() => onSelectConv(conv)}>

                {/* Avatar me tregues online */}
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold"
                    style={{ background: "linear-gradient(135deg, #0a2545, #1a4a8a)", color: "var(--gold-light)", border: "1px solid var(--border-subtle)" }}>
                    {c.initials}
                  </div>
                  {c.online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
                      style={{ background: "var(--online)", borderColor: "var(--bg-secondary)" }} />
                  )}
                </div>

                {/* Emri dhe mesazhi i fundit */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{c.name}</p>
                  <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{c.lastMsg || "No messages yet"}</p>
                </div>

                {/* Ora dhe numer mesazhesh te palexuara */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{c.time}</span>
                  {c.unread > 0 && (
                    <span className="text-xs font-semibold rounded-full px-1.5 py-0.5 min-w-5 text-center"
                      style={{ background: "#1a4a8a", color: "var(--gold-light)" }}>
                      {c.unread}
                    </span>
                  )}
                </div>

                {/* Butoni fshij - i dukshem vetem me hover */}
                <button
                  onClick={(e) => handleDelete(e, c.id)}
                  disabled={deletingId === c.id}
                  className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-1 rounded-lg"
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#e05555"}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
                  title="Delete conversation">
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Profili i userit aktual ne fund */}
      <UserProfile />
    </aside>
  );
}

Sidebar.propTypes = {
  activeConv:          PropTypes.object,
  onSelectConv:        PropTypes.func.isRequired,
  onStartConversation: PropTypes.func.isRequired,
  onDeleteConv:        PropTypes.func.isRequired,
  conversations:       PropTypes.array.isRequired,
  onlineUsers:         PropTypes.instanceOf(Set),
};