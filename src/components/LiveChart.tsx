"use client";
 
interface LiveChartProps {
  symbol?: string;
}
 
export default function LiveChart({ symbol = "BINANCE:BTCUSDT" }: LiveChartProps) {
  // Construct the official TradingView iframe widget embed URL
  const iframeUrl = `https://s.tradingview.com/widgetembed/?symbol=${encodeURIComponent(symbol)}&interval=60&theme=dark&style=1&timezone=Etc%2FUTC&locale=en&hidevolume=true&symboledit=1&saveimage=1&calendar=1`;
 
  return (
    <div className="w-full h-full bg-[#131316] relative overflow-hidden rounded-xl">
      <iframe
        src={iframeUrl}
        className="w-full h-full border-none z-10"
        allowFullScreen
        title="TradingView Chart"
      />
    </div>
  );
}
