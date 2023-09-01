import { NextResponse } from "next/server";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

interface Params {
  params: {
    serverId: string;
  };
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.serverId) {
      return new NextResponse("Server ID missing", { status: 400 });
    }

    const server = await db.server.update({
      where: {
        id: params.serverId,
        profile_id: {
          not: profile.id,
        },
        members: {
          some: {
            profile_id: profile.id,
          },
        },
      },
      data: {
        members: {
          deleteMany: {
            profile_id: profile.id,
          },
        },
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log("SERVER_ID_LEAVE", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
