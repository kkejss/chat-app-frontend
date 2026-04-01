import { useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { SendHorizontal } from "lucide-react";
import { emitTypingStart, emitTypingStop } from "@/services/socket.service";

// Fusha e shkrimit te mesazhit me indikator shkrimit dhe dergim me Enter
export function ChatInput({ onSend, disabled, conversationId }) {
  const [value, setValue] = useState("");

  // Ref per debounce-in e "typing:stop" (ndalon pas 2 sekondash pa shkruar)
  const typingTimeout = useRef(null);
  const isTyping = useRef(false);

  // Dergo "typing:stop" te backend-i nese perdoruesi po shfaqej si duke shkruar
  const stopTyping = useCallback(() => {
    if (isTyping.current && conversationId) {
      emitTypingStop(conversationId);
      isTyping.current = false;
    }
  }, [conversationId]);

  function handleChange(e) {
    setValue(e.target.value);
    if (!conversationId) return;

    // Nis indikatorin e shkrimit vetem nese nuk kishte filluar ende
    if (!isTyping.current) {
      emitTypingStart(conversationId);
      isTyping.current = true;
    }

    // Rivendos kronometrin: pas 2 sekondash pa shkruar, ndalon indikatorin
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(stopTyping, 2000);
  }

  // Dergo mesazhin: pastron indikatorin e shkrimit dhe boshatison fushen
  function handleSend() {
    if (!value.trim() || disabled) return;
    stopTyping();
    clearTimeout(typingTimeout.current);
    onSend(value.trim());
    setValue("");
  }

  // Enter dergo mesazhin; Shift+Enter shton rresht te ri
  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="px-6 py-4"
      style={{ borderTop: "1px solid var(--border-subtle)", background: "rgba(255,255,255,0.01)" }}>
      <div className="flex items-center gap-3 px-4 py-2 rounded-2xl transition-all"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-subtle)", opacity: disabled ? 0.5 : 1 }}>
        <textarea
          rows={1}
          className="flex-1 bg-transparent outline-none resize-none text-sm leading-relaxed"
          style={{ color: "var(--text-primary)", maxHeight: 120 }}
          placeholder={disabled ? "Select a conversation to start messaging..." : "Type a message..."}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        {/* Butoni i dergimit */}
        <button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
          style={{
            background: "linear-gradient(135deg, #1a4a8a, #1e5299)",
            border: "1px solid var(--border-subtle)",
            color: "var(--gold-light)",
            boxShadow: "0 2px 10px rgba(26,74,138,0.35)",
            opacity: disabled || !value.trim() ? 0.5 : 1,
          }}>
          <SendHorizontal size={16} />
        </button>
      </div>
    </div>
  );
}

ChatInput.propTypes = {
  onSend:         PropTypes.func.isRequired,
  disabled:       PropTypes.bool,
  conversationId: PropTypes.string,
};