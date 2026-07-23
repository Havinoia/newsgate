"use client";
 
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
 
export default function Navbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const currentCategory = searchParams.get("category") || "all";

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearchQuery(q);
  }, [searchParams]);
 
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/");
    }
  };

  const navCategories = [
    { label: "Semua Berita", id: "all", icon: "newspaper" },
    { label: "Politik", id: "politics", icon: "gavel" },
    { label: "Kripto", id: "crypto", icon: "currency_bitcoin" },
    { label: "Teknologi", id: "technology", icon: "memory" },
    { label: "Energi", id: "energy", icon: "bolt" },
    { label: "Pasar", id: "markets", icon: "show_chart" },
  ];
 
  return (
    <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-2xl border-b border-outline-variant/30 h-16 flex justify-between items-center px-4 md:px-8 shadow-2xl shadow-black/40">
      {/* Brand / Logo */}
      <div className="flex items-center gap-6">
        <Link className="flex items-center gap-2 text-xl font-black tracking-tight text-on-surface hover:text-secondary transition-colors" href="/">
          <div className="w-8 h-8 rounded-lg bg-secondary/20 border border-secondary/40 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[20px]">feed</span>
          </div>
          <span>NewsGate <span className="text-[10px] font-label-caps tracking-widest text-secondary px-2 py-0.5 rounded-md bg-secondary/15 border border-secondary/25 uppercase ml-1">PORTAL</span></span>
        </Link>

        {/* Quick Category Pills on Desktop Navbar */}
        <nav className="hidden lg:flex items-center gap-1.5 ml-4 border-l border-outline-variant/20 pl-6">
          {navCategories.map((cat) => {
            const isActive = currentCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => router.push(cat.id === "all" ? "/" : `/?category=${cat.id}`)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "bg-secondary text-on-secondary shadow-md shadow-secondary/20"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60"
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">{cat.icon}</span>
                {cat.label}
              </button>
            );
          })}
        </nav>
      </div>
 
      {/* Search & Actions */}
      <div className="flex items-center gap-4">
        <form onSubmit={handleSearch} className="flex relative items-center group">
          <span className="material-symbols-outlined absolute left-3.5 text-outline text-[18px] group-focus-within:text-secondary transition-colors">search</span>
          <input 
            type="text" 
            placeholder="Cari berita & topik hangat..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-surface-container-low/60 border border-outline-variant/25 rounded-full py-1.5 pl-10 pr-4 text-xs text-on-surface focus:outline-none focus:border-secondary/50 focus:bg-surface-container-high/80 transition-all w-48 sm:w-64 md:w-72 placeholder:text-outline/50 font-medium"
          />
          {searchQuery && (
            <button 
              type="button" 
              onClick={() => { setSearchQuery(""); router.push("/"); }}
              className="absolute right-3 text-outline hover:text-on-surface text-xs"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </form>
 
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-[10px] font-label-caps font-bold text-secondary">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span>LIVE SYNC</span>
          </div>
        </div>
      </div>
    </header>
  );
}
