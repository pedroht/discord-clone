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
    const { conversationId } = request.query;

    if (!profile) {
      return response.status(401).json({ error: "Unauthorized" });
    }

    if (!conversationId) {
      return response.status(400).json({ error: "Conversation ID missing" });
    }

    if (!content) {
      return response.status(400).json({ error: "Content missing" });
    }

    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId as string,
        OR: [
          {
            member_one: {
              profile_id: profile.id,
            },
          },
          {
            member_two: {
              profile_id: profile.id,
            },
          },
        ],
      },
      include: {
        member_one: {
          include: {
            profile: true,
          },
        },
        member_two: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!conversation) {
      return response.status(404).json({ message: "Conversation not found" });
    }

    const member =
      conversation.member_one.profile_id === profile.id
        ? conversation.member_one
        : conversation.member_two;

    if (!member) {
      return response.status(404).json({ message: "Member not found" });
    }

    const message = await db.directMessage.create({
      data: {
        content,
        fileUrl,
        conversation_id: conversationId as string,
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

    const channelKey = `chat:${conversationId}:messages`;

    response?.socket?.server?.io?.emit(channelKey, message);

    return response.status(200).json(message);
  } catch (error) {
    console.log("[DIRECT_MESSAGES_POST]", error);
    return response.status(400).json({
      message: "Internal Error",
    });
  }
}
