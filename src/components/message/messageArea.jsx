import { useEffect, useRef } from "react";
import PropTypes from "prop-types";

// Zona e mesazheve: header me status, lista e mesazheve dhe indikatori i shkrimit
export function MessageArea({ activeConv, messages, loading, isTyping }) {
  const bottomRef = useRef(null);

  // Shkun automatikisht ne fund kur vijn mesazhe te reja ose nis shkrimit
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Nese nuk ka bisede aktive, trego udhezim
  if (!activeConv) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", fontWeight: 400, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
          Select a conversation
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", maxWidth: 280, lineHeight: 1.6 }}>
          Search for someone by username and start a conversation.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Header: avatar, emer dhe status online/shkrimit */}
      <div className="flex items-center gap-3 px-6 py-4"
        style={{ borderBottom: "1px solid var(--border-subtle)", background: "rgba(255,255,255,0.01)" }}>
        <div className="relative">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
            style={{ background: "linear-gradient(135deg, #0a2545, #1a4a8a)", color: "var(--gold-light)", border: "1px solid var(--border-subtle)" }}>
            {activeConv.initials}
          </div>
          {activeConv.online && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
              style={{ background: "var(--online)", borderColor: "var(--bg-primary)" }} />
          )}
        </div>
        <div className="flex-1">
          <p className="font-medium" style={{ color: "var(--text-primary)" }}>{activeConv.name}</p>
          {/* Tregon "typing..." nese po shkruan, "Active now" nese online, "Offline" nese jo */}
          <p className="text-xs" style={{ color: activeConv.online ? "var(--online)" : "var(--text-muted)" }}>
            {isTyping ? "typing..." : activeConv.online ? "Active now" : "Offline"}
          </p>
        </div>
      </div>

      {/* Zona e mesazheve me scroll */}
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-1">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No messages yet. Say hello!</p>
          </div>
        ) : (
          <>
            {/* Ndarese me daten "Today" */}
            <div className="relative flex items-center justify-center my-4">
              <div className="absolute left-0 right-0 h-px" style={{ background: "var(--border-subtle)" }} />
              <span className="relative px-3 text-xs"
                style={{ background: "var(--bg-primary)", color: "var(--text-muted)", letterSpacing: "0.5px" }}>
                Today
              </span>
            </div>

            {/* Rendit mesazhet: te vetit djathtas (own), te tjereve majtas */}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 items-end mb-1 ${msg.own ? "flex-row-reverse" : ""}`}>
                {/* Avatar shfaqet vetem per mesazhet e te tjereve */}
                {!msg.own && (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #0a2545, #1a4a8a)", color: "var(--gold-light)" }}>
                    {activeConv.initials}
                  </div>
                )}
                <div>
                  {/* Flluska e mesazhit me stil te ndryshëm per mesazhet e veta */}
                  <div className={`max-w-xs px-4 py-2.5 text-sm leading-relaxed ${msg.own ? "rounded-2xl rounded-br-sm" : "rounded-2xl rounded-bl-sm"}`}
                    style={msg.own ? {
                      background: "linear-gradient(135deg, #0d3570, #1a4a8a)",
                      border: "1px solid rgba(212,160,23,0.12)",
                      color: "var(--text-primary)",
                      boxShadow: "0 4px 16px rgba(26,74,138,0.3)",
                    } : {
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid var(--border-subtle)",
                      color: "var(--text-primary)",
                    }}>
                    {msg.text}
                  </div>
                  <span className={`block text-xs mt-1 ${msg.own ? "text-right" : ""}`}
                    style={{ color: "var(--text-muted)" }}>
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}

            {/* Indikator animuar kur perdoruesi tjeter po shkruan */}
            {isTyping && (
              <div className="flex gap-2 items-end mb-1">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #0a2545, #1a4a8a)", color: "var(--gold-light)" }}>
                  {activeConv.initials}
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-subtle)" }}>
                  {/* Tre pika te animuara qe tregojne shkrimin */}
                  {[0, 1, 2].map((i) => (
                    <span key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: "var(--text-muted)",
                        animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
        {/* Element referenc per scroll automatik ne fund */}
        <div ref={bottomRef} />
      </div>

      {/* Animacioni CSS per pikat e shkrimit */}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30%            { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </>
  );
}

MessageArea.propTypes = {
  activeConv: PropTypes.object,
  messages:   PropTypes.array.isRequired,
  loading:    PropTypes.bool,
  isTyping:   PropTypes.bool,
};