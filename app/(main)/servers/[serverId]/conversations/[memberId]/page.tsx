import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { ChatHeader } from "@/components/chat/chat-header";
import { getOrCreateConversation } from "@/lib/conversation";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

interface MemberIdProps {
  params: {
    memberId: string;
    serverId: string;
  };
}

export default async function MemberIdPage({ params }: MemberIdProps) {
  const profile = await currentProfile();

  if (!profile) {
    return redirectToSignIn();
  }

  const currentMember = await db.member.findFirst({
    where: {
      server_id: params.serverId,
      profile_id: profile.id,
    },
    include: {
      profile: true,
    },
  });

  if (!currentMember) {
    return redirect("/");
  }

  const conversation = await getOrCreateConversation(
    currentMember.id,
    params.memberId
  );

  if (!conversation) {
    return redirect(`/servers/${params.serverId}`);
  }

  const { member_one, member_two } = conversation;

  const otherMember =
    member_one.profile_id === profile.id ? member_two : member_one;

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader
        imageUrl={otherMember.profile.image_url}
        name={otherMember.profile.name}
        serverId={params.serverId}
        type="conversation"
      />
    </div>
  );
}
