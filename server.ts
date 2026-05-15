import { createServer } from "http";
import next from "next";
import { parse } from "url";
import { Server } from "socket.io";
import { setSocketServer } from "./src/lib/realtime/socket-server";
import { authenticateSocket, roomForAuth } from "./src/lib/realtime/socket-auth";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME ?? "localhost";
const port = Number(process.env.PORT ?? 3000);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url ?? "", true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    path: "/api/socket.io",
    addTrailingSlash: false,
    cors: {
      origin: dev ? true : process.env.NEXT_PUBLIC_APP_ORIGIN ?? true,
      credentials: true,
    },
  });

  setSocketServer(io);

  io.use((socket, nextFn) => {
    const auth = authenticateSocket(socket.handshake.headers.cookie);
    if (!auth) {
      nextFn(new Error("Unauthorized"));
      return;
    }
    socket.data.auth = auth;
    nextFn();
  });

  io.on("connection", (socket) => {
    const auth = socket.data.auth as ReturnType<typeof authenticateSocket>;
    if (!auth) {
      socket.disconnect(true);
      return;
    }
    void socket.join(roomForAuth(auth));
  });

  httpServer.listen(port, () => {
    console.log(`> TE-Pay ready on http://${hostname}:${port} (Next.js + Socket.IO)`);
  });
});
