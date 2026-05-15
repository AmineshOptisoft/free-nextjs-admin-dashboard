import type { Server } from "socket.io";

declare global {
  // eslint-disable-next-line no-var
  var __tepaySocketIO: Server | undefined;
}

let io: Server | null = null;

export function setSocketServer(server: Server): void {
  io = server;
  globalThis.__tepaySocketIO = server;
}

export function getSocketServer(): Server | null {
  return io ?? globalThis.__tepaySocketIO ?? null;
}
