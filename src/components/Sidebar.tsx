"use client";
 
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/Providers";
 
export default function Sidebar() {
  const pathname = usePathname();
  const { isSidebarCollapsed } = useSidebar();
 
  const navItems = [
    { name: "Command Center", icon: "terminal", href: "/", active: true },
  ];
 
  return (
    <aside className={`fixed left-0 top-16 bottom-0 flex flex-col justify-between py-6 px-4 w-64 border-r border-outline-variant/15 bg-surface-container-low/40 backdrop-blur-xl shadow-2xl z-40 hidden lg:flex transition-all duration-300 ease-in-out ${isSidebarCollapsed ? "-translate-x-full" : "translate-x-0"}`}>
      <div className="space-y-6">
        <div className="px-3">
          <p className="font-label-caps text-[10px] text-outline uppercase tracking-[0.2em] font-black text-glow" style={{ color: "var(--color-outline)" }}>Command Center</p>
        </div>
        
        <nav className="space-y-1.5">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`rounded-xl flex items-center gap-3 p-3 transition-all duration-300 border ${
                item.active 
                  ? "bg-secondary-container/10 border-secondary text-secondary font-black shadow-[0_0_15px_rgba(0,83,219,0.15)] text-glow" 
                  : "text-on-surface-variant border-transparent hover:bg-surface-variant/20 hover:text-on-surface hover:translate-x-1"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="font-body-md text-sm">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Tactical System Nodes latency status tracker */}
        <div className="border border-outline-variant/15 bg-background/25 rounded-2xl p-4 space-y-3 font-label-caps text-[9px] relative overflow-hidden">
          {/* subtle scanning overlay grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px] opacity-10 pointer-events-none" />
          
          <span className="text-outline uppercase font-black block tracking-[0.15em] border-b border-outline-variant/10 pb-1.5 mb-1.5 text-glow" style={{ color: "var(--color-outline)" }}>System Nodes</span>
          <div className="space-y-2 relative z-10 font-bold">
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant/80">NODE-01 // WASHINGTON</span>
              <span className="text-secondary font-black animate-pulse">ONLINE</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant/80">NODE-02 // LONDON</span>
              <span className="text-secondary font-black animate-pulse">ONLINE</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant/80">NODE-03 // TOKYO</span>
              <span className="text-secondary font-black animate-pulse">ONLINE</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant/80">NODE-04 // ZURICH</span>
              <span className="text-error font-black animate-pulse text-glow" style={{ color: "var(--color-error)" }}>LATENCY ALERT</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant/80">NODE-05 // SINGAPORE</span>
              <span className="text-secondary font-black animate-pulse">ONLINE</span>
            </div>
          </div>
        </div>
      </div>
 
      <div className="space-y-4">
        <div className="space-y-1">
          <Link href="#" className="text-on-surface-variant hover:bg-surface-variant/30 rounded-xl flex items-center gap-3 p-3 transition-all text-sm group border border-transparent hover:border-outline-variant/10">
            <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-on-surface transition-colors">settings</span>
            <span className="font-body-md">Settings</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
