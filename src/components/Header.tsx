"use client";

import { BRANDING } from "@/config/branding";

export default function Header() {
  return (
    <header
      className="flex items-center justify-between px-4 h-12 border-b shrink-0"
      style={{ background: "#141414", borderColor: "#2A2A2A" }}
    >
      {/* Logo + Brand */}
      <div className="flex items-center gap-3">
        {/* Onyx diamond logo mark */}
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="28" height="28" rx="6" fill="#1E1E1E" />
          <polygon points="14,4 24,14 14,24 4,14" fill="none" stroke="#D4A017" strokeWidth="1.5" />
          <polygon points="14,8 20,14 14,20 8,14" fill="#D4A017" opacity="0.25" />
          <circle cx="14" cy="14" r="2.5" fill="#D4A017" />
        </svg>
        <span className="font-semibold text-base tracking-wide" style={{ color: "#F0EBE0" }}>
          {BRANDING.name}
        </span>
        <span className="text-xs hidden sm:block" style={{ color: "#4A4540" }}>
          {BRANDING.tagline}
        </span>
      </div>

      {/* Nav */}
      <nav className="hidden md:flex items-center gap-1">
        {["Trade", "Portfolio", "Leaderboard"].map((label) => (
          <button
            key={label}
            className="px-4 py-1.5 rounded text-sm font-medium transition-colors"
            style={{
              color: label === "Trade" ? "#D4A017" : "#8A8070",
              background: label === "Trade" ? "rgba(212,160,23,0.08)" : "transparent",
            }}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Connect Wallet */}
      <button
        className="flex items-center gap-2 px-4 py-1.5 rounded text-sm font-semibold transition-all hover:brightness-110 active:scale-95"
        style={{
          background: "linear-gradient(135deg, #D4A017, #B8860B)",
          color: "#0A0A0A",
        }}
      >
        <span className="w-2 h-2 rounded-full bg-[#0A0A0A] opacity-60" />
        Connect Wallet
      </button>
    </header>
  );
}
