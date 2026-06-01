"use client";
 
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
 
export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
 
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Direct asset query to chart
      router.push(`/?symbol=${encodeURIComponent(searchQuery.toUpperCase())}`);
      setSearchQuery("");
    }
  };
 
  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-2xl border-b border-outline-variant/30 h-16 flex justify-between items-center px-margin-mobile md:px-margin-desktop shadow-2xl shadow-black/20">
      <div className="flex items-center gap-6">
        <Link className="text-2xl font-black tracking-tighter text-on-surface hover:text-secondary transition-colors" href="/">
          NewsGate <span className="text-xs font-label-caps tracking-widest text-secondary px-2 py-0.5 rounded-md bg-secondary/15 ml-2 border border-secondary/25">TERMINAL</span>
        </Link>
      </div>
 
      <div className="flex items-center gap-6">
        <form onSubmit={handleSearch} className="hidden md:flex relative items-center group">
          <span className="material-symbols-outlined absolute left-4 text-outline text-[18px] group-focus-within:text-secondary transition-colors">search</span>
          <input 
            type="text" 
            placeholder="Search Tickers (e.g. BTCUSD, AAPL, EURUSD)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-surface-variant/30 border border-outline-variant/20 rounded-full py-2.5 pl-11 pr-6 text-sm text-on-surface focus:outline-none focus:border-secondary/40 focus:bg-surface-variant/50 transition-all w-80 placeholder:text-outline/40"
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
