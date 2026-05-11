import "./globals.css";
import { Inter, Work_Sans, JetBrains_Mono } from "next/font/google";
import Providers from "@/components/Providers";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const workSans = Work_Sans({ subsets: ["latin"], variable: "--font-work-sans" });
const jetBrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata = {
  title: "NewsGate - Real-time News Aggregator",
  description: "A premium real-time news aggregation platform. Bloomberg for Everyone.",
};

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
      </head>
      <body className={`${inter.variable} ${workSans.variable} ${jetBrainsMono.variable} font-sans bg-background text-on-surface antialiased min-h-screen overflow-hidden`}>
        <Providers>
          <Navbar />
          <Sidebar />

          <main className="lg:ml-64 pt-16 h-screen flex flex-col overflow-hidden">
            {children}

            {/* Terminal Footer */}
            <footer className="w-full h-10 bg-surface-container-lowest border-t border-outline-variant/20 px-6 flex items-center justify-between z-50 shrink-0">
              <div className="flex items-center gap-4 text-label-caps text-[10px] text-on-surface-variant font-label-caps">
                <span>SYSTEM STATUS: <span className="text-secondary">OPTIMAL</span></span>
                <span className="w-1 h-1 bg-outline-variant/40 rounded-full"></span>
                <span>LATENCY: <span className="text-secondary">18MS</span></span>
                <span className="w-1 h-1 bg-outline-variant/40 rounded-full"></span>
                <span className="uppercase">© 2026 NEWSGATE TERMINAL. DATA DELIVERED WITH 20ms LATENCY.</span>
              </div>
              <div className="flex items-center gap-6">
                <Link className="text-[10px] font-label-caps text-on-surface-variant hover:text-primary transition-colors" href="#">API ACCESS</Link>
                <Link className="text-[10px] font-label-caps text-on-surface-variant hover:text-primary transition-colors" href="#">NETWORK STATUS</Link>
                <Link className="text-[10px] font-label-caps text-on-surface-variant hover:text-primary transition-colors" href="#">INSTITUTIONAL</Link>
              </div>
            </footer>
          </main>
        </Providers>
      </body>
    </html>
  );
}
