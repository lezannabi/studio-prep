import { ReactNode } from "react";
import { AppView } from "../types/domain";

interface AppShellProps {
  activeView: AppView;
  children: ReactNode;
  isSmartStoreView?: boolean;
}

export function AppShell({
  children,
  isSmartStoreView = false
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(250,246,238,0.96),_rgba(236,232,225,0.9)_52%,_rgba(224,220,212,0.92))] text-stone-900">
      <div className="mx-auto max-w-[1680px] px-4 py-4 xl:px-6 xl:py-6">
        <main
          className={`overflow-hidden rounded-[34px] border border-white/70 bg-[#f7f4ee]/95 shadow-[0_36px_120px_rgba(69,59,47,0.12)] ${
            isSmartStoreView ? "p-5 xl:p-6" : "p-4 xl:p-5"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
