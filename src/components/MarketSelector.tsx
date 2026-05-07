"use client";

import { useState } from "react";
import { useMarketData } from "@/hooks/useMarketData";
import { MarketInfo } from "@/lib/hyperliquid";

interface Props {
  selectedMarket: string;
  onSelect: (name: string) => void;
}

function formatPrice(px: string): string {
  const n = parseFloat(px);
  if (n >= 1000) return n.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  if (n >= 1) return n.toFixed(2);
  return n.toFixed(4);
}

export default function MarketSelector({ selectedMarket, onSelect }: Props) {
  const { markets, isLoading } = useMarketData();
  const [search, setSearch] = useState("");

  const filtered = markets.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside
      className="flex flex-col h-full border-r"
      style={{ background: "#161B2E", borderColor: "#1E2640", width: 200 }}
    >
      {/* Header */}
      <div className="p-2 border-b" style={{ borderColor: "#1E2640" }}>
        <input
          type="text"
          placeholder="Search markets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-2 py-1.5 text-xs rounded outline-none"
          style={{
            background: "#0D0E14",
            border: "1px solid #1E2640",
            color: "#E8EAF0",
          }}
        />
      </div>

      {/* Column headers */}
      <div
        className="flex items-center justify-between px-2 py-1 text-xs"
        style={{ color: "#4A5170" }}
      >
        <span>Market</span>
        <span>24h%</span>
      </div>

      {/* Market list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="p-3 text-xs" style={{ color: "#4A5170" }}>
            Loading markets...
          </div>
        )}
        {filtered.map((market: MarketInfo) => {
          const isSelected = market.name === selectedMarket;
          const isPositive = market.change24h >= 0;
          return (
            <button
              key={market.name}
              onClick={() => onSelect(market.name)}
              className="w-full flex items-center justify-between px-2 py-1.5 text-xs transition-colors hover:bg-[#1A2035]"
              style={{
                background: isSelected ? "rgba(0,229,204,0.07)" : undefined,
                borderLeft: isSelected ? "2px solid #00E5CC" : "2px solid transparent",
              }}
            >
              <div className="flex flex-col items-start gap-0.5">
                <span className="font-medium" style={{ color: isSelected ? "#00E5CC" : "#E8EAF0" }}>
                  {market.name}
                </span>
                <span className="font-mono text-[10px]" style={{ color: "#8B92A8" }}>
                  {formatPrice(market.markPx)}
                </span>
              </div>
              <span
                className="font-mono text-[11px] font-medium"
                style={{ color: isPositive ? "#00FF88" : "#FF4466" }}
              >
                {isPositive ? "+" : ""}
                {market.change24h.toFixed(2)}%
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
