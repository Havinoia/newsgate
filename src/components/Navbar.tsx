"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "@/components/Providers";

function NavLinks() {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";

  const categories = [
    { name: "All", slug: "all", href: "/" },
    { name: "Crypto", slug: "crypto", href: "/?category=crypto" },
    { name: "Politics", slug: "politics", href: "/?category=politics" },
    { name: "Energy", slug: "energy", href: "/?category=energy" },
  ];

  return (
    <nav className="hidden lg:flex items-center gap-6">
      {categories.map((cat) => {
        const isActive = activeCategory === cat.slug;
        return (
          <Link
            key={cat.slug}
            className={`font-body-md text-sm transition-colors whitespace-nowrap ${
              isActive
                ? "font-bold text-on-surface border-b border-on-surface pb-0.5"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
            href={cat.href}
          >
            {cat.name}
          </Link>
        );
      })}
    </nav>
  );
}

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { isSidebarCollapsed, toggleSidebar } = useSidebar();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };



  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-2xl border-b border-outline-variant/30 h-16 flex justify-between items-center px-margin-mobile md:px-margin-desktop shadow-2xl shadow-black/20">
      <div className="flex items-center gap-6">
        <button 
          onClick={toggleSidebar}
          className="hidden lg:flex w-10 h-10 items-center justify-center rounded-full hover:bg-surface-variant/40 text-on-surface-variant hover:text-on-surface transition-all active:scale-90 border border-outline-variant/15 mr-1"
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <span className="material-symbols-outlined text-[20px] transition-transform duration-300">
            {isSidebarCollapsed ? "menu" : "menu_open"}
          </span>
        </button>
        <Link className="text-2xl font-black tracking-tighter text-on-surface hover:text-secondary transition-colors" href="/">
          NewsGate
        </Link>
        <Suspense fallback={<div className="h-4 w-48 bg-white/5 animate-pulse rounded" />}>
          <NavLinks />
        </Suspense>
      </div>

      <div className="flex items-center gap-6">
        <form onSubmit={handleSearch} className="hidden md:flex relative items-center group">
          <span className="material-symbols-outlined absolute left-4 text-outline text-[18px] group-focus-within:text-secondary transition-colors">search</span>
          <input 
            type="text" 
            placeholder="Search Global Intelligence..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-surface-variant/30 border border-outline-variant/20 rounded-full py-2.5 pl-11 pr-6 text-sm text-on-surface focus:outline-none focus:border-secondary/40 focus:bg-surface-variant/50 transition-all w-64 lg:w-80 placeholder:text-outline/40"
          />
        </form>

        <div className="flex items-center gap-2 relative">
          


          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant/50 text-on-surface-variant hover:text-on-surface transition-all active:scale-90 overflow-hidden border border-outline-variant/20">
            <span className="material-symbols-outlined text-[20px]">person</span>
          </button>
        </div>
      </div>
    </header>
  );
}
