import { Sidebar } from "@/components/navigation/sidebar";
import { PropsWithChildren } from "react";

interface MainLayoutProps extends PropsWithChildren {}

export default async function MainLayoutPage({ children }: MainLayoutProps) {
  return (
    <div className="h-full">
      <div className="hidden md:flex h-full w-[72px] z-30 flex-col fixed inset-y-0">
        <Sidebar />
      </div>

      <main className="md:pl-[72px] h-full">{children}</main>
    </div>
  );
}
