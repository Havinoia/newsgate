"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [showNotifications, setShowNotifications] = useState(false);
  const router = useRouter();
  const notificationRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const marketReminders = [
    { id: 1, type: 'critical', title: 'BTC Volatility Alert', time: '5m ago', description: 'Significant price movement detected in the last 15 minutes (+4.2%).' },
    { id: 2, type: 'event', title: 'OPEC+ Supply Meeting', time: '2h remaining', description: 'Oil supply decision expected at 14:00 UTC. High impact on energy sector.' },
    { id: 3, type: 'news', title: 'SEC ETH ETF Update', time: '1h ago', description: 'New spot ETH application filed by institutional partner node.' },
    { id: 4, type: 'alert', title: 'FED Rate Protocol', time: 'Starts in 4h', description: 'Live coverage and analysis of upcoming interest rate decision.' }
  ];

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-2xl border-b border-outline-variant/30 h-16 flex justify-between items-center px-margin-mobile md:px-margin-desktop shadow-2xl shadow-black/20">
      <div className="flex items-center gap-10">
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
          
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant/50 transition-all active:scale-90 relative ${showNotifications ? 'bg-secondary/20 text-secondary' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-secondary rounded-full border border-surface shadow-[0_0_8px_rgba(180,197,255,0.5)]"></span>
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-12 right-0 w-80 bg-surface-container-high/95 backdrop-blur-3xl border border-outline-variant/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
                >
                  <div className="p-4 border-b border-outline-variant/10 flex justify-between items-center">
                    <span className="font-headline-sm text-xs font-black uppercase tracking-widest text-on-surface">Intelligence Alerts</span>
                    <span className="text-[10px] font-black text-secondary uppercase cursor-pointer hover:underline">Mark all read</span>
                  </div>
                  <div className="max-h-[350px] overflow-y-auto no-scrollbar">
                    {marketReminders.map((notif) => (
                      <div key={notif.id} className="p-4 border-b border-outline-variant/10 hover:bg-surface-variant/20 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-[10px] font-black uppercase tracking-wider ${notif.type === 'critical' ? 'text-error' : 'text-secondary'}`}>
                            {notif.title}
                          </span>
                          <span className="text-[9px] text-outline font-bold">{notif.time}</span>
                        </div>
                        <p className="text-xs text-on-surface-variant leading-relaxed group-hover:text-on-surface transition-colors">
                          {notif.description}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-surface-container-highest/50 text-center">
                    <Link href="#" className="text-[10px] font-black text-outline uppercase tracking-[0.2em] hover:text-on-surface transition-colors">
                      View Protocol Logs
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant/50 text-on-surface-variant hover:text-on-surface transition-all active:scale-90 overflow-hidden border border-outline-variant/20">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-full h-full object-cover" />
          </button>
        </div>
      </div>
    </header>
  );
}
