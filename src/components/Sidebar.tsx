"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Terminal", icon: "terminal", href: "/", active: true },
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-0 flex flex-col justify-between py-6 px-4 w-64 border-r border-outline-variant/20 bg-surface-container-low/60 backdrop-blur-xl shadow-2xl shadow-background/50 z-40 hidden lg:flex">
      <div className="space-y-2">
        <div className="px-3 mb-6">
          <p className="font-label-caps text-[10px] text-outline uppercase tracking-widest">Command Center</p>
        </div>
        
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`rounded-lg flex items-center gap-3 p-3 transition-all hover:translate-x-1 duration-200 ${
                item.active 
                  ? "bg-secondary-container text-on-secondary-container font-bold" 
                  : "text-on-surface-variant hover:bg-surface-variant/40"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="font-body-md">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <Link href="#" className="text-on-surface-variant hover:bg-surface-variant/40 rounded-lg flex items-center gap-3 p-3 transition-all text-sm group">
            <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-on-surface transition-colors">settings</span>
            <span>Settings</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
