import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/shared/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Plug n' Play Arena — Web3 Learning on Avalanche",
    template: "%s | Plug n' Play Arena",
  },
  description:
    "Gamified Web3 learning on Avalanche. Choose a persona, complete missions, join live events, race through speedruns, and earn NFT badges on Fuji testnet.",
  keywords: ["Avalanche", "Web3", "Learn", "NFT", "Blockchain", "Gaming", "DeFi"],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Plug n' Play Arena",
    description: "Gamified Web3 learning on Avalanche",
    siteName: "Plug n' Play Arena",
  },
  twitter: {
    card: "summary_large_image",
    title: "Plug n' Play Arena",
    description: "Gamified Web3 learning on Avalanche",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#080810]`}>
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "rgba(15,15,25,0.95)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#fff",
                backdropFilter: "blur(12px)",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
