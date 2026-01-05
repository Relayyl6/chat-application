import { Server } from "socket.io";
import { Server as HttpServer } from "http";

import chatNamespace from "./namespaces/chat.ts";
import { IO, Namespace, WSType } from "./utils/ws.type";

let wsServer: IO;
let chatNS: Namespace;

function listen(httpServer: HttpServer, options?: WSType): IO {
  wsServer = new Server(httpServer, {
    ...options,
    cors: { origin: "*" },
    pingInterval: 2000,
    pingTimeout: 1000,
  });

  chatNS = wsServer.of("/chat");
  chatNS.on("connection", chatNamespace(wsServer, chatNS));

  return wsServer;
}

export { listen };