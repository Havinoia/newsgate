"use client";
 
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useSidebar } from "@/components/Providers";
 
export default function Sidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSidebarCollapsed } = useSidebar();
  const currentCategory = searchParams.get("category") || "all";
  const currentSort = searchParams.get("sort") || "latest";
 
  const newsChannels = [
    { name: "Semua Berita", icon: "newspaper", category: "all" },
    { name: "High Impact Alerts", icon: "bolt", sort: "impact" },
    { name: "Politik & Dunia", icon: "gavel", category: "politics" },
    { name: "Kripto & Finansial", icon: "currency_bitcoin", category: "crypto" },
    { name: "Teknologi", icon: "memory", category: "technology" },
    { name: "Energi & Sains", icon: "bolt", category: "energy" },
    { name: "Pasar Global", icon: "trending_up", category: "markets" },
  ];
 
  const handleNavigate = (item: { category?: string; sort?: string }) => {
    if (item.sort) {
      router.push(`/?sort=${item.sort}`);
    } else if (item.category) {
      router.push(item.category === "all" ? "/" : `/?category=${item.category}`);
    }
  };

  return (
    <aside className={`fixed left-0 top-16 bottom-0 flex flex-col justify-between py-6 px-4 w-64 border-r border-outline-variant/15 bg-surface-container-low/40 backdrop-blur-xl shadow-2xl z-40 hidden lg:flex transition-all duration-300 ease-in-out ${isSidebarCollapsed ? "-translate-x-full" : "translate-x-0"}`}>
      <div className="space-y-6">
        <div className="px-3 flex items-center justify-between">
          <p className="font-label-caps text-[10px] text-outline uppercase tracking-[0.2em] font-black text-glow" style={{ color: "var(--color-outline)" }}>Saluran Berita</p>
          <span className="text-[9px] font-black text-secondary bg-secondary/15 px-2 py-0.5 rounded border border-secondary/20 uppercase">Live</span>
        </div>
        
        <nav className="space-y-1.5">
          {newsChannels.map((item) => {
            const isActive = item.sort 
              ? currentSort === item.sort 
              : currentCategory === item.category;

            return (
              <button
                key={item.name}
                onClick={() => handleNavigate(item)}
                className={`w-full rounded-xl flex items-center gap-3 p-3 transition-all duration-300 border text-left ${
                  isActive 
                    ? "bg-secondary-container/15 border-secondary text-secondary font-black shadow-[0_0_15px_rgba(0,83,219,0.15)] text-glow" 
                    : "text-on-surface-variant border-transparent hover:bg-surface-variant/20 hover:text-on-surface hover:translate-x-1"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span className="font-body-md text-sm">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* News Stream Metrics Tracker */}
        <div className="border border-outline-variant/15 bg-background/30 rounded-2xl p-4 space-y-3 font-label-caps text-[9px] relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px] opacity-10 pointer-events-none" />
          
          <span className="text-outline uppercase font-black block tracking-[0.15em] border-b border-outline-variant/10 pb-1.5 mb-1.5 text-glow" style={{ color: "var(--color-outline)" }}>News Stream Status</span>
          <div className="space-y-2 relative z-10 font-bold">
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant/80">REALTIME FEED</span>
              <span className="text-secondary font-black animate-pulse">ACTIVE</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant/80">AUTO SYNC</span>
              <span className="text-secondary font-black">5 DETIK</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant/80">SUPABASE DB</span>
              <span className="text-secondary font-black">CONNECTED</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant/80">SENTIMENT ENGINE</span>
              <span className="text-tertiary font-black">ONLINE</span>
            </div>
          </div>
        </div>
      </div>
 
      <div className="space-y-2">
        <div className="px-3 py-2 rounded-xl bg-surface-container-high/40 border border-outline-variant/15 text-[10px] font-label-caps text-outline font-medium text-center">
          <span className="text-on-surface font-bold">NewsGate Terminal</span>
          <br />
          Platform Berita Realtime
        </div>
      </div>
    </aside>
  );
}
