import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";

import { NextApiResponseServerIo } from "@/types";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function ioHandler(
  request: NextApiRequest,
  response: NextApiResponseServerIo
) {
  if (!response.socket.server.io) {
    const path = "/api/socket/io";
    const httpServer: NetServer = response.socket.server as any;
    const io = new ServerIO(httpServer, {
      path,
      // @ts-ignore
      addTrailingSlash: false,
    });

    response.socket.server.io = io;
  }

  response.end();
}
