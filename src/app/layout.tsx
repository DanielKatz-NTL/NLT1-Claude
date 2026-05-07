import type { Metadata } from "next";
import "./globals.css";
import { BRANDING } from "@/config/branding";

export const metadata: Metadata = {
  title: `${BRANDING.name} — ${BRANDING.tagline}`,
  description: `${BRANDING.name}: ${BRANDING.tagline}. Trade perpetual futures with deep liquidity and low fees.`,
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0A0A0A] text-[#F0EBE0] min-h-screen">
        {children}
      </body>
    </html>
  );
}
