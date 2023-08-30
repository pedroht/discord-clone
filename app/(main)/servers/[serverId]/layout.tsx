import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";

import { ServerSidebar } from "@/components/server/server-sidebar";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

interface ServerIdLayoutProps extends PropsWithChildren {
  params: {
    serverId: string;
  };
}

export default async function ServerIdLayout({
  children,
  params,
}: ServerIdLayoutProps) {
  const profile = await currentProfile();

  if (!profile) {
    return redirectToSignIn();
  }

  const server = await db.server.findUnique({
    where: {
      id: params.serverId,
      members: {
        some: {
          profile_id: profile.id,
        },
      },
    },
  });

  if (!server) {
    return redirect("/");
  }

  return (
    <div className="h-full ">
      <div className="hidden md:flex h-full w-60 z-20 flex-col inset-y-0 fixed">
        <ServerSidebar serverId={server.id} />
      </div>

      <main className="h-full md:pl-60">{children}</main>
    </div>
  );
}
