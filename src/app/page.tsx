"use client";
 
import LiveChart from "@/components/LiveChart";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
 
function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeSymbol, setActiveSymbol] = useState<string>("BINANCE:BTCUSDT");

  // Map and parse standard symbol query parameters to exchange notations
  const parseSymbol = (input: string) => {
    if (!input) return "BINANCE:BTCUSDT";
    const upper = input.toUpperCase().trim();
    
    if (upper === "BTCUSD" || upper === "BTCUSDT" || upper === "BTC") return "BINANCE:BTCUSDT";
    if (upper === "ETHUSD" || upper === "ETHUSDT" || upper === "ETH") return "BINANCE:ETHUSDT";
    if (upper === "SOLUSD" || upper === "SOLUSDT" || upper === "SOL") return "BINANCE:SOLUSDT";
    if (upper === "AAPL") return "NASDAQ:AAPL";
    if (upper === "TSLA") return "NASDAQ:TSLA";
    if (upper === "SPY") return "AMEX:SPY";
    if (upper === "GOLD" || upper === "XAUUSD") return "OANDA:XAUUSD";
    if (upper === "BRENT" || upper === "UKOIL") return "TVC:UKOIL";
    
    if (upper.includes(":")) return upper;
    return upper; // Default as is
  };

  useEffect(() => {
    const symbolQuery = searchParams.get("symbol");
    if (symbolQuery) {
      setActiveSymbol(parseSymbol(symbolQuery));
    }
  }, [searchParams]);

  const selectSymbol = (symbolKey: string) => {
    const parsed = parseSymbol(symbolKey);
    setActiveSymbol(parsed);
    router.push(`/?symbol=${symbolKey.toUpperCase()}`);
  };

  // Popular quick-selection asset hotkeys
  const quickHotkeys = [
    { label: "BTC / BITCOIN", key: "BTC", category: "crypto" },
    { label: "ETH / ETHEREUM", key: "ETH", category: "crypto" },
    { label: "SOL / SOLANA", key: "SOL", category: "crypto" },
    { label: "SPY / S&P 500", key: "SPY", category: "macro" },
    { label: "AAPL / APPLE", key: "AAPL", category: "tech" },
    { label: "GOLD / SPOT", key: "GOLD", category: "metals" }
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-3 bg-background">
      {/* High-density Terminal Metrics Ribbon */}
      <section className="h-14 flex items-center px-4 bg-surface-container-lowest/80 border border-outline-variant/15 rounded-xl justify-between shrink-0 mb-3 glass-panel">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 border-r border-outline-variant/20 pr-4">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse shadow-[0_0_8px_rgba(180,197,255,0.8)]" />
            <span className="font-label-caps text-[9px] text-secondary font-black uppercase tracking-[0.2em] text-glow" style={{ color: "var(--color-secondary)" }}>
              FEED SYNCED
            </span>
          </div>

          {/* Quick symbol selectors */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {quickHotkeys.map((asset) => {
              const currentExchange = parseSymbol(asset.key);
              const isActive = activeSymbol === currentExchange;
              return (
                <button
                  key={asset.key}
                  onClick={() => selectSymbol(asset.key)}
                  className={`px-3 py-1.5 rounded-lg font-label-caps text-[9px] font-black border transition-all duration-300 uppercase tracking-widest ${
                    isActive 
                      ? 'bg-secondary text-on-secondary border-secondary shadow-[0_0_10px_rgba(180,197,255,0.35)]' 
                      : 'bg-surface-container-high/30 border-outline-variant/15 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50'
                  }`}
                >
                  {asset.key}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-6 font-data-point text-[10px] text-outline font-bold">
          <div className="flex items-center gap-2">
            <span>ACTIVE FEED:</span>
            <span className="text-secondary font-black uppercase tracking-wider text-glow" style={{ color: "var(--color-secondary)" }}>
              {activeSymbol}
            </span>
          </div>
          <div className="w-[1px] h-4 bg-outline-variant/20" />
          <div className="flex items-center gap-2">
            <span>VOLATILITY RATIO:</span>
            <span className="text-error font-black text-glow" style={{ color: "var(--color-error)" }}>18.2%</span>
          </div>
          <div className="w-[1px] h-4 bg-outline-variant/20" />
          <div className="flex items-center gap-2">
            <span>STABILITY RATE:</span>
            <span className="text-secondary font-black text-glow" style={{ color: "var(--color-secondary)" }}>99.99%</span>
          </div>
        </div>
      </section>
 
      {/* Full Screen Live Chart Bento Box Frame */}
      <div className="flex-1 relative rounded-2xl overflow-hidden border border-outline-variant/15 glass-panel p-1 group">
        {/* Animated Scanner Overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(19,19,22,0.4)_100%)] pointer-events-none z-20" />
        
        {/* Corner Neon Accents */}
        <div className="absolute top-1 left-1 w-6 h-6 border-t-2 border-l-2 border-secondary/35 pointer-events-none z-20"></div>
        <div className="absolute top-1 right-1 w-6 h-6 border-t-2 border-r-2 border-secondary/35 pointer-events-none z-20"></div>
        <div className="absolute bottom-1 left-1 w-6 h-6 border-b-2 border-l-2 border-secondary/35 pointer-events-none z-20"></div>
        <div className="absolute bottom-1 right-1 w-6 h-6 border-b-2 border-r-2 border-secondary/35 pointer-events-none z-20"></div>

        <LiveChart symbol={activeSymbol} />
      </div>
    </div>
  );
}
 
export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant opacity-50 space-y-4 py-20 bg-background h-screen">
        <span className="material-symbols-outlined text-[48px] animate-spin text-secondary">sync</span>
        <p className="font-label-caps text-xs tracking-widest uppercase">Syncing Trading Terminal Feeds...</p>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
