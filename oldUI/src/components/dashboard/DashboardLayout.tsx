import { ReactNode } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <main
        className={cn(
          "min-h-screen transition-all duration-300",
          "md:ml-[280px] pb-20 md:pb-0 pt-14 md:pt-0"
        )}
      >
        <div className="gradient-mesh fixed inset-0 pointer-events-none" />
        <div className="relative z-10">{children}</div>
      </main>
    </div>
  );
};