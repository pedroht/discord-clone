import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

interface InviteCodeProps {
  params: {
    inviteCode: string;
  };
}

export default async function InviteCodePage({ params }: InviteCodeProps) {
  if (!params.inviteCode) {
    return redirect("/");
  }

  const profile = await currentProfile();

  if (!profile) {
    return redirectToSignIn();
  }

  const existingServer = await db.server.findFirst({
    where: {
      invite_code: params.inviteCode,
      members: {
        some: {
          profile_id: profile.id,
        },
      },
    },
  });

  if (existingServer) {
    return redirect(`/servers/${existingServer.id}`);
  }

  const server = await db.server.update({
    where: {
      invite_code: params.inviteCode,
    },
    data: {
      members: {
        create: [
          {
            profile_id: profile.id,
          },
        ],
      },
    },
  });

  if (server) {
    return redirect(`/servers/${server.id}`);
  }

  return null;
}
