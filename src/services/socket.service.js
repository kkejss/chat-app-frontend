import { io } from "socket.io-client";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

let socket = null;

// Krijon lidhjen me Socket.io duke perdorur token-in JWT per autentikim
export function connectSocket() {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;

  // Nese socket ekziston dhe eshte i lidhur, ktheje direkt pa krijuar te ri
  if (socket && socket.connected) return socket;

  // Nese socket ekziston por eshte shkepute, fshi dhe krijo te ri
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(API_BASE_URL, {
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("[Socket] Connected:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.error("[Socket] Connection error:", err.message);
  });

  return socket;
}

// Shkepute socket-in dhe pastron instancen (perdoret gjate logout-it)
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Kthen instancen aktuale te socket-it (mund te jete null para login-it)
export function getSocket() {
  return socket;
}

// Dergon nje event per t'u bashkuar ne dhomen e nje bisede
export function joinConversation(conversationId) {
  socket?.emit("conversation:join", conversationId);
}

// Njofton te tjeret qe ky perdorues po shkruan
export function emitTypingStart(conversationId) {
  socket?.emit("typing:start", { conversationId });
}

// Njofton te tjeret qe ky perdorues ndaloi se shkruari
export function emitTypingStop(conversationId) {
  socket?.emit("typing:stop", { conversationId });
}