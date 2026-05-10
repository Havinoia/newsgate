import "./globals.css";
import { Inter, Work_Sans, JetBrains_Mono } from "next/font/google";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const workSans = Work_Sans({ subsets: ["latin"], variable: "--font-work-sans" });
const jetBrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata = {
  title: "NewsGate - Real-time News Aggregator",
  description: "A premium real-time news aggregation platform. Bloomberg for Everyone.",
};

import Navbar from "@/components/Navbar";

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
      <body className={`${inter.variable} ${workSans.variable} ${jetBrainsMono.variable} font-sans bg-background text-on-surface antialiased min-h-screen`}>
        <Providers>
          <Navbar />

          <main className="pt-24 pb-section-padding min-h-screen">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-surface-container-lowest border-t border-outline-variant w-full py-section-padding">
            <div className="flex flex-col md:flex-row justify-between items-start gap-gutter px-margin-desktop max-w-container-max mx-auto">
              <div className="flex flex-col gap-6 max-w-sm">
                <span className="font-headline-md text-xl font-black text-on-surface">NewsGate</span>
                <p className="font-body-md text-sm text-on-surface-variant">Leading news platform providing accurate, in-depth, and real-time information for the modern reader. Bloomberg for Everyone.</p>
                <div className="flex gap-4">
                  <a className="text-on-surface-variant hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">public</span></a>
                  <a className="text-on-surface-variant hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">share</span></a>
                  <a className="text-on-surface-variant hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">mail</span></a>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
                <div className="flex flex-col gap-4">
                  <span className="font-label-caps text-xs text-primary">COMPANY</span>
                  <nav className="flex flex-col gap-2 text-sm">
                    <a className="text-on-surface-variant hover:text-primary hover:underline transition-colors" href="#">About</a>
                    <a className="text-on-surface-variant hover:text-primary hover:underline transition-colors" href="#">Sources</a>
                    <a className="text-on-surface-variant hover:text-primary hover:underline transition-colors" href="#">Newsroom</a>
                  </nav>
                </div>
                <div className="flex flex-col gap-4">
                  <span className="font-label-caps text-xs text-primary">LEGAL</span>
                  <nav className="flex flex-col gap-2 text-sm">
                    <a className="text-on-surface-variant hover:text-primary hover:underline transition-colors" href="#">Privacy Policy</a>
                    <a className="text-on-surface-variant hover:text-primary hover:underline transition-colors" href="#">Terms of Service</a>
                    <a className="text-on-surface-variant hover:text-primary hover:underline transition-colors" href="#">Editorial Guidelines</a>
                  </nav>
                </div>
              </div>
            </div>
            <div className="mt-16 px-margin-desktop max-w-container-max mx-auto pt-8 border-t border-outline-variant/30 flex flex-col md:flex-row justify-between gap-4 text-xs">
              <p className="text-on-surface-variant">© 2026 NewsGate Global. Bloomberg for Everyone.</p>
              <div className="flex gap-6">
                <span className="text-on-surface-variant">English</span>
                <span className="text-on-surface-variant">UTC +7:00</span>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
