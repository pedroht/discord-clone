import { NextApiRequest } from "next";

import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { NextApiResponseServerIo } from "@/types";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponseServerIo
) {
  if (request.method !== "POST") {
    return response.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const profile = await currentProfilePages(request);
    const { content, fileUrl } = request.body;
    const { serverId, channelId } = request.query;

    if (!profile) {
      return response.status(401).json({ error: "Unauthorized" });
    }

    if (!serverId) {
      return response.status(400).json({ error: "Server ID missing" });
    }

    if (!channelId) {
      return response.status(400).json({ error: "Channel ID missing" });
    }

    if (!content) {
      return response.status(400).json({ error: "Content missing" });
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

    const message = await db.message.create({
      data: {
        content,
        fileUrl,
        channel_id: channelId as string,
        member_id: member.id,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    const channelKey = `chat:${channelId}:messages`;

    response?.socket?.server?.io?.emit(channelKey, message);

    return response.status(200).json(message);
  } catch (error) {
    console.log("[MESSAGES_POST]", error);
    return response.status(400).json({
      message: "Internal Error",
    });
  }
}
