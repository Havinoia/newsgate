"use client";
 
import Navbar from "@/components/Navbar";
import Link from "next/link";
 
export default function LayoutClient({ children }: { children: React.ReactNode }) {
  // Dynamic mock stock/crypto data and flash messages for ticker
  const tickerItems = [
    { text: "BREAKING ALERT: SECURE TRANSACTION CHANNELS REGISTERING INSTITUTIONAL ORDERS", isAlert: true },
    { text: "BTC/USD $68,241.50 (+2.40%)", isAlert: false },
    { text: "ETH/USD $3,412.20 (+1.80%)", isAlert: false },
    { text: "BRENT CRUDE OIL $82.40 (+1.15%)", isAlert: false },
    { text: "US 10Y BOND YIELD 4.32% (-0.05%)", isAlert: false },
    { text: "SIGNAL FLASH: BLOCKORDER CVD DESKS INITIATING MASSIVE WHALE CORRIDOR ACCUMULATION", isAlert: true },
    { text: "SUEZ TRANSIT FLOWS DECREASE 12.4% WEEK-ON-WEEK FOLLOWING SHIP ROUTE HIGHLIGHTS", isAlert: true },
    { text: "MACRO SYNTHESIS PROTOCOL INDICATES STRUCTURAL SAFETY POSTURES IN CRYPTO ASSETS", isAlert: false }
  ];
 
  // Repeat items to fill marquee seamlessly
  const scrolledTickerItems = [...tickerItems, ...tickerItems];
 
  return (
    <>
      <Navbar />
 
      {/* For full-screen TradingView terminal, sidebar is removed and ml-0 is forced */}
      <main className="pt-16 h-screen flex flex-col overflow-hidden transition-all duration-300 ease-in-out lg:ml-0">
        
        {/* Primary Page Content Wrapper */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
          {children}
        </div>
 
        {/* Cinematic Horizontally Scrolling News Flash Ticker */}
        <div className="h-8 bg-surface-container-lowest/80 border-t border-outline-variant/15 flex items-center overflow-hidden z-40 select-none relative shadow-[0_-4px_24px_rgba(0,0,0,0.4)] shrink-0">
          {/* Static Alert Prefix Badge */}
          <div className="h-full px-4 bg-secondary text-on-secondary flex items-center gap-1.5 font-label-caps text-[9px] font-black tracking-[0.2em] z-50 shadow-[6px_0_15px_rgba(0,0,0,0.6)] shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping" />
            <span className="text-glow">GLOBAL MARKET TAPE</span>
          </div>
 
          {/* Marquee Scroller Wrapper */}
          <div className="flex gap-14 items-center animate-marquee whitespace-nowrap pr-14 select-none">
            {scrolledTickerItems.map((item, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-2 text-[9px] font-label-caps tracking-wider"
              >
                {item.isAlert ? (
                  <>
                    <span className="text-error font-black px-1.5 py-0.5 rounded bg-error/15 border border-error/25 animate-pulse text-glow" style={{ color: "var(--color-error)" }}>
                      ALERT
                    </span>
                    <span className="text-on-surface font-bold uppercase">{item.text}</span>
                  </>
                ) : (
                  <>
                    <span className="w-1 h-1 bg-secondary rounded-full" />
                    <span className="text-on-surface-variant font-medium uppercase">{item.text}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
 
        {/* Terminal Footer */}
        <footer className="w-full h-10 bg-surface-container-lowest border-t border-outline-variant/15 px-6 flex items-center justify-between z-50 shrink-0 select-none">
          <div className="flex items-center gap-4 text-label-caps text-[9px] text-on-surface-variant font-label-caps font-bold">
            <span>SYSTEM STATUS: <span className="text-secondary text-glow" style={{ color: "var(--color-secondary)" }}>OPTIMAL</span></span>
            <span className="w-1.5 h-1.5 bg-outline-variant/20 rounded-full"></span>
            <span>SECURE LATENCY: <span className="text-secondary text-glow" style={{ color: "var(--color-secondary)" }}>18MS</span></span>
            <span className="w-1.5 h-1.5 bg-outline-variant/20 rounded-full"></span>
            <span className="uppercase tracking-widest text-[8px] opacity-60">© 2026 NEWSGATE TERMINAL. ULTRA-LOW FEED SHUTTLE PROTOCOL.</span>
          </div>
          <div className="flex items-center gap-5 text-[8px] font-label-caps font-black tracking-widest">
            <Link className="text-on-surface-variant hover:text-secondary transition-colors" href="#">API ACCESS</Link>
            <Link className="text-on-surface-variant hover:text-secondary transition-colors" href="#">NODE NETWORK</Link>
            <Link className="text-on-surface-variant hover:text-secondary transition-colors" href="#">INSTITUTIONAL</Link>
          </div>
        </footer>
      </main>
    </>
  );
}
