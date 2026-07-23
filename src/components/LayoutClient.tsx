"use client";
 
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getNewsArticles } from "@/actions/news";
import { useSidebar } from "@/components/Providers";
 
export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const { isSidebarCollapsed } = useSidebar();

  // Fetch recent news for the ticker marquee
  const { data: tickerArticles } = useQuery({
    queryKey: ["ticker-news"],
    queryFn: async () => {
      const res = await getNewsArticles({ limit: 10, sortBy: "latest" });
      if (res.success) return res.data;
      return [];
    },
    refetchInterval: 15000,
  });

  const defaultTickerItems = [
    { title: "KONEKTIVITAS STREAM REALTIME TERHUBUNG KE SUPABASE NEWS article NODE", isAlert: true },
    { title: "Laporan Pasar Global: Pergerakan Sektor Teknologi Menunjukkan Tren Positif", isAlert: false },
    { title: "Analisis Sentimen Kecerdasan Buatan Memindai Berita Berdampak Tinggi", isAlert: false },
    { title: "Perkembangan Kebijakan Energi Terbarukan Menjadi Sorotan Internasional", isAlert: true }
  ];

  const itemsToDisplay = (tickerArticles && tickerArticles.length > 0)
    ? tickerArticles.map((art: any) => ({
        title: art.title,
        isAlert: art.sentimentScore >= 70
      }))
    : defaultTickerItems;

  const scrolledTickerItems = [...itemsToDisplay, ...itemsToDisplay];

  return (
    <>
      <Navbar />
      <Sidebar />

      {/* Main Container adjusting for Sidebar width */}
      <main 
        className={`pt-16 min-h-screen flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "lg:ml-0" : "lg:ml-64"
        }`}
      >
        {/* Primary Page Content Wrapper */}
        <div className="flex-1 flex flex-col bg-background">
          {children}
        </div>

        {/* Cinematic Horizontally Scrolling News Flash Ticker */}
        <div className="h-9 bg-surface-container-lowest/90 border-t border-outline-variant/20 flex items-center overflow-hidden z-40 select-none relative shadow-[0_-4px_24px_rgba(0,0,0,0.4)] shrink-0 sticky bottom-10">
          <div className="h-full px-4 bg-secondary text-on-secondary flex items-center gap-1.5 font-label-caps text-[10px] font-black tracking-widest z-50 shadow-[6px_0_15px_rgba(0,0,0,0.6)] shrink-0">
            <span className="w-2 h-2 rounded-full bg-error animate-ping" />
            <span className="text-glow uppercase">TICKER BERITA TERKINI</span>
          </div>

          <div className="flex gap-12 items-center animate-marquee whitespace-nowrap pr-12 select-none">
            {scrolledTickerItems.map((item, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-2 text-[10px] font-label-caps tracking-wider"
              >
                {item.isAlert ? (
                  <>
                    <span className="text-error font-black px-1.5 py-0.5 rounded bg-error/15 border border-error/25 animate-pulse text-glow uppercase" style={{ color: "var(--color-error)" }}>
                      HIGH IMPACT
                    </span>
                    <span className="text-on-surface font-bold uppercase">{item.title}</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 bg-secondary rounded-full" />
                    <span className="text-on-surface-variant font-medium uppercase">{item.title}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* News Portal Footer */}
        <footer className="w-full bg-surface-container-lowest border-t border-outline-variant/15 px-6 py-3 flex flex-col md:flex-row items-center justify-between z-50 shrink-0 select-none gap-3">
          <div className="flex items-center gap-4 text-label-caps text-[10px] text-on-surface-variant font-label-caps font-bold">
            <span>STATUS SYNC: <span className="text-secondary text-glow font-black" style={{ color: "var(--color-secondary)" }}>AKTIF</span></span>
            <span className="w-1.5 h-1.5 bg-outline-variant/30 rounded-full"></span>
            <span>SUMBER: <span className="text-secondary font-black">MULTI-FEED AGGREGATOR</span></span>
            <span className="w-1.5 h-1.5 bg-outline-variant/30 rounded-full"></span>
            <span className="uppercase tracking-widest text-[9px] opacity-70">© 2026 NEWSGATE. PORTAL MONITORING BERITA REALTIME.</span>
          </div>
          <div className="flex items-center gap-5 text-[9px] font-label-caps font-black tracking-widest">
            <Link className="text-on-surface-variant hover:text-secondary transition-colors" href="/">BERANDA</Link>
            <Link className="text-on-surface-variant hover:text-secondary transition-colors" href="/?sort=impact">HIGH IMPACT</Link>
            <Link className="text-on-surface-variant hover:text-secondary transition-colors" href="/?category=crypto">KRIPTO</Link>
            <Link className="text-on-surface-variant hover:text-secondary transition-colors" href="/?category=politics">POLITIK</Link>
          </div>
        </footer>
      </main>
    </>
  );
}
