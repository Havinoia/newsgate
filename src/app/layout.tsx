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

import LayoutClient from "@/components/LayoutClient";

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
          <LayoutClient>
            {children}
          </LayoutClient>
        </Providers>
      </body>
    </html>
  );
}
