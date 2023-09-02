import { Member, Message, Profile, Server } from "@prisma/client";
import { Server as NetServer, Socket } from "net";
import { NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";

type MemberWithProfile = Member & {
  profile: Profile;
};

export type ServerWithMembersWithProfiles = Server & {
  members: Array<MemberWithProfile>;
};

export type NextApiResponseServerIo = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

export type MessageWithMemberWithProfile = Message & {
  member: MemberWithProfile;
};
