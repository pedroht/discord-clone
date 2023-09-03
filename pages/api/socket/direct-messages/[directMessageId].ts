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
    const { directMessageId, conversationId } = request.query;

    if (!profile) {
      return response.status(401).json({ error: "Unauthorized" });
    }

    if (!conversationId) {
      return response.status(400).json({ error: "Conversation ID missing" });
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

    let directMessage = await db.directMessage.findFirst({
      where: {
        id: directMessageId as string,
        conversation_id: conversationId as string,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!directMessage || directMessage.deleted) {
      return response.status(404).json({ message: "Message not found" });
    }

    const isMessageOwner = directMessage.member_id === member.id;
    const isAdmin = member.role === MemberRole.ADMIN;
    const isModerator = member.role === MemberRole.MODERATOR;
    const canModify = isMessageOwner || isAdmin || isModerator;

    if (!canModify) {
      return response.status(401).json({ message: "Unauthorized" });
    }

    if (request.method === "DELETE") {
      directMessage = await db.directMessage.update({
        where: {
          id: directMessageId as string,
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

      directMessage = await db.directMessage.update({
        where: {
          id: directMessageId as string,
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

    const updateKey = `chat:${conversationId}:messages:update`;

    response?.socket?.server?.io?.emit(updateKey, directMessage);

    return response.status(200).json(directMessage);
  } catch (error) {
    console.log("[MESSAGE_ID]", error);
    return response.status(400).json({
      message: "Internal Error",
    });
  }
}
