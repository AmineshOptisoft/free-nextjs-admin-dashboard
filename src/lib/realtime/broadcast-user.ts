import { getSocketServer } from "@/lib/realtime/socket-server";
import { USER_UPDATE_EVENT, type UserRealtimePayload } from "@/lib/realtime/types";

export function emitUserStatusUpdate(userId: string | number, role: "agent" | "company", status: string): void {
  const io = getSocketServer();
  if (!io) return;

  const payload: UserRealtimePayload = {
    userId: String(userId),
    role,
    status: status.toUpperCase(),
    updatedAt: new Date().toISOString(),
  };

  // Broadcast to admins
  io.to("role:admin").emit(USER_UPDATE_EVENT, payload);

  // Broadcast to the specific user
  io.to(`role:${role}:${userId}`).emit(USER_UPDATE_EVENT, payload);
}
