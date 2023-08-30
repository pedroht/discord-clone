import { NextResponse } from "next/server";
import { v4 as uuidV4 } from "uuid";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

interface PatchProps {
  params: {
    serverId: string;
  };
}

export async function PATCH(request: Request, { params }: PatchProps) {
  try {
    if (!params.serverId) {
      return new NextResponse("Server ID Missing", { status: 400 });
    }

    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const server = await db.server.update({
      where: {
        id: params.serverId,
        profile_id: profile.id,
      },
      data: {
        invite_code: uuidV4(),
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log("[SERVER_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
