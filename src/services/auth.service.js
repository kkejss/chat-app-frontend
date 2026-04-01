import { apiFetch } from "./api";
import { connectSocket, disconnectSocket } from "./socket.service";

// Dergo kerkese regjistrim te backend-i
export async function signupUser({ firstName, lastName, username, phone, password }) {
  return await apiFetch("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ firstName, lastName, username, phone, password }),
  });
}

// Bën login, ruan token dhe te dhenat e userit ne localStorage, lidh socket-in
export async function loginUser({ username, password }) {
  const response = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  const { token, user } = response;

  // Ruan token-in dhe te dhenat e userit per perdorim ne te gjithe app-in
  localStorage.setItem("accessToken", token);
  localStorage.setItem("userId",    user.id);
  localStorage.setItem("firstName", user.firstName);
  localStorage.setItem("lastName",  user.lastName);
  localStorage.setItem("username",  user.username);

  // Lidh socket-in menjehere pas login-it te suksesshem
  connectSocket();

  return response;
}

// Merr te dhenat e userit aktual nga backend-i (kerkon token)
export async function getMe() {
  return await apiFetch("/api/auth/me");
}

// Shkepute socket-in dhe pastron te gjitha te dhenat e sesionit nga localStorage
export function logoutUser() {
  disconnectSocket();
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("firstName");
  localStorage.removeItem("lastName");
  localStorage.removeItem("username");
}