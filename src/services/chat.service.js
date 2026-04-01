import { apiFetch } from "./api";

//Bisedat

// Merr te gjitha bisedat e userit aktual
export async function getConversations() {
  return await apiFetch("/api/conversations");
}

// Krijon ose merr biseden ekzistuese me nje perdorues tjeter
export async function getOrCreateConversation(participantId) {
  return await apiFetch("/api/conversations", {
    method: "POST",
    body: JSON.stringify({ participantId }),
  });
}

// Fshin biseden nga pamja e userit aktual
export async function deleteConversation(conversationId) {
  return await apiFetch(`/api/conversations/${conversationId}`, {
    method: "DELETE",
  });
}

//Mesazhet

// Merr mesazhet e nje bisede me faqezim (page dhe limit)
export async function getMessages(conversationId, page = 1) {
  return await apiFetch(`/api/messages/${conversationId}?page=${page}&limit=40`);
}

// Dergo nje mesazh te ri ne bisede
export async function sendMessage(conversationId, content) {
  return await apiFetch("/api/messages", {
    method: "POST",
    body: JSON.stringify({ conversationId, content }),
  });
}

// Perdoruesit

// Kerkon perdorues sipas username (per te filluar biseda te reja)
export async function searchUsers(username) {
  return await apiFetch(`/api/users/search?username=${encodeURIComponent(username)}`);
}