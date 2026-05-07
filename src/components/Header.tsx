"use client";

import { BRANDING } from "@/config/branding";

export default function Header() {
  return (
    <header
      className="flex items-center justify-between px-4 h-12 border-b shrink-0"
      style={{ background: "#161B2E", borderColor: "#1E2640" }}
    >
      {/* Logo + Brand */}
      <div className="flex items-center gap-3">
        <div
          className="w-7 h-7 rounded flex items-center justify-center font-bold text-sm"
          style={{ background: "#00E5CC", color: "#0D0E14" }}
        >
          HT
        </div>
        <span className="font-semibold text-base tracking-wide" style={{ color: "#E8EAF0" }}>
          {BRANDING.name}
        </span>
        <span className="text-xs hidden sm:block" style={{ color: "#4A5170" }}>
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
              color: label === "Trade" ? "#00E5CC" : "#8B92A8",
              background: label === "Trade" ? "rgba(0,229,204,0.08)" : "transparent",
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
          background: "linear-gradient(135deg, #00E5CC, #7B61FF)",
          color: "#0D0E14",
        }}
      >
        <span className="w-2 h-2 rounded-full bg-[#0D0E14] opacity-70" />
        Connect Wallet
      </button>
    </header>
  );
}
