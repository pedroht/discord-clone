import { PropsWithChildren } from "react";

interface LayoutProps extends PropsWithChildren {}

export default function LayoutPage({ children }: LayoutProps) {
  return (
    <div className="h-full flex items-center justify-center">{children}</div>
  );
}
