import "./globals.css";
import { Inter } from "next/font/google";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "NewsGate - Real-time News Aggregator",
  description: "Platform agregator berita real-time dengan desain premium.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body className={`${inter.variable} font-sans bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 antialiased min-h-screen`}>
        <Providers>
            {/* Header / Navbar Navigasi Ringan */}
            <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/70 dark:bg-black/70 border-b border-zinc-200 dark:border-zinc-800">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                        NewsGate.
                    </h1>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                        <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Terbaru</a>
                        <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Politik</a>
                        <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Teknologi</a>
                        <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Bisnis</a>
                    </nav>
                    <div className="flex items-center gap-4">
                        {/* Auth UI Placeholder */}
                        <button className="text-sm font-medium hover:text-blue-500 transition-colors">Sign In</button>
                    </div>
                </div>
            </header>
            
            <main className="px-4 py-8">
                {children}
            </main>
        </Providers>
      </body>
    </html>
  );
}
