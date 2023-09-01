import { getAuth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { NextApiRequest } from "next";

export async function currentProfilePages(request: NextApiRequest) {
  const { userId } = getAuth(request);

  if (!userId) {
    return null;
  }

  const profile = await db.profile.findUnique({
    where: {
      user_id: userId,
    },
  });

  return profile;
}
