import { PropsWithChildren } from "react";

interface MemberIdProps extends PropsWithChildren {}

export default async function MemberIdPage({ children }: MemberIdProps) {
  return (
    <div>
      <h1>memberid page</h1>
    </div>
  );
}
