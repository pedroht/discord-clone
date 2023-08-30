import { PropsWithChildren } from "react";

interface ServersProps extends PropsWithChildren {}

export default function ServersPage({ children }: ServersProps) {
  return <div>{children}</div>;
}
