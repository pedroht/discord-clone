import { MemberRole } from "@prisma/client";
import { NextApiRequest } from "next";

import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { NextApiResponseServerIo } from "@/types";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponseServerIo
) {
  if (request.method !== "DELETE" && request.method !== "PATCH") {
    return response.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const profile = await currentProfilePages(request);
    const { content } = request.body;
    const { messageId, serverId, channelId } = request.query;

    if (!profile) {
      return response.status(401).json({ error: "Unauthorized" });
    }

    if (!serverId) {
      return response.status(400).json({ error: "Server ID missing" });
    }

    if (!channelId) {
      return response.status(400).json({ error: "Channel ID missing" });
    }

    const server = await db.server.findFirst({
      where: {
        id: serverId as string,
        members: {
          some: {
            profile_id: profile.id,
          },
        },
      },
      include: {
        members: true,
      },
    });

    if (!server) {
      return response.status(404).json({ message: "Server not found" });
    }

    const channel = await db.channel.findFirst({
      where: {
        id: channelId as string,
        server_id: serverId as string,
      },
    });

    if (!channel) {
      return response.status(404).json({ message: "Channel not found" });
    }

    const member = server.members.find(
      (member) => member.profile_id === profile.id
    );

    if (!member) {
      return response.status(404).json({ message: "Member not found" });
    }

    let message = await db.message.findFirst({
      where: {
        id: messageId as string,
        channel_id: channelId as string,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!message || message.deleted) {
      return response.status(404).json({ message: "Message not found" });
    }

    const isMessageOwner = message.member_id === member.id;
    const isAdmin = member.role === MemberRole.ADMIN;
    const isModerator = member.role === MemberRole.MODERATOR;
    const canModify = isMessageOwner || isAdmin || isModerator;

    if (!canModify) {
      return response.status(401).json({ message: "Unauthorized" });
    }

    if (request.method === "DELETE") {
      message = await db.message.update({
        where: {
          id: messageId as string,
        },
        data: {
          fileUrl: null,
          content: "This message has been deleted.",
          deleted: true,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
      });
    }

    if (request.method === "PATCH") {
      if (!isMessageOwner) {
        return response.status(401).json({ error: "Unauthorized" });
      }

      message = await db.message.update({
        where: {
          id: messageId as string,
        },
        data: {
          content,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
      });
    }

    const updateKey = `chat:${channelId}:messages:update`;

    response?.socket?.server?.io?.emit(updateKey, message);

    return response.status(200).json(message);
  } catch (error) {
    console.log("[MESSAGE_ID]", error);
    return response.status(400).json({
      message: "Internal Error",
    });
  }
}
