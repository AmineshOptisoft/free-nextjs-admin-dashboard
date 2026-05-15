"use client";

import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getTransactionSocket(): Socket {
  if (!socket) {
    socket = io({
      path: "/api/socket.io",
      transports: ["websocket", "polling"],
      autoConnect: false,
      withCredentials: true,
    });
  }
  return socket;
}

export function disconnectTransactionSocket(): void {
  if (socket?.connected) socket.disconnect();
}
