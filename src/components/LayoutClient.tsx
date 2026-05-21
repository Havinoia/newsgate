"use client";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useSidebar } from "@/components/Providers";
import Link from "next/link";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const { isSidebarCollapsed } = useSidebar();
  
  return (
    <>
      <Navbar />
      <Sidebar />

      <main className={`pt-16 h-screen flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${isSidebarCollapsed ? "lg:ml-0" : "lg:ml-64"}`}>
        {children}

        {/* Terminal Footer */}
        <footer className="w-full h-10 bg-surface-container-lowest border-t border-outline-variant/20 px-6 flex items-center justify-between z-50 shrink-0">
          <div className="flex items-center gap-4 text-label-caps text-[10px] text-on-surface-variant font-label-caps">
            <span>SYSTEM STATUS: <span className="text-secondary">OPTIMAL</span></span>
            <span className="w-1 h-1 bg-outline-variant/40 rounded-full"></span>
            <span>LATENCY: <span className="text-secondary">18MS</span></span>
            <span className="w-1 h-1 bg-outline-variant/40 rounded-full"></span>
            <span className="uppercase">© 2026 NEWSGATE TERMINAL. DATA DELIVERED WITH 20ms LATENCY.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link className="text-[10px] font-label-caps text-on-surface-variant hover:text-primary transition-colors" href="#">API ACCESS</Link>
            <Link className="text-[10px] font-label-caps text-on-surface-variant hover:text-primary transition-colors" href="#">NETWORK STATUS</Link>
            <Link className="text-[10px] font-label-caps text-on-surface-variant hover:text-primary transition-colors" href="#">INSTITUTIONAL</Link>
          </div>
        </footer>
      </main>
    </>
  );
}
