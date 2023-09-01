import { PropsWithChildren } from "react";

interface ChannelIdProps extends PropsWithChildren {}

export default async function ChannelIdPage({ children }: ChannelIdProps) {
  return (
    <div>
      <h1>ChannelID Page</h1>
    </div>
  );
}
