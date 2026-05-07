"use client";

import { useMarket } from "@/hooks/useMarketData";

interface Props {
  market: string;
}

function formatVolume(v: string): string {
  const n = parseFloat(v);
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}

function formatOI(v: string, price: string): string {
  const oi = parseFloat(v);
  const px = parseFloat(price);
  const usd = oi * px;
  if (usd >= 1e9) return `$${(usd / 1e9).toFixed(2)}B`;
  if (usd >= 1e6) return `$${(usd / 1e6).toFixed(2)}M`;
  if (usd >= 1e3) return `$${(usd / 1e3).toFixed(2)}K`;
  return `$${usd.toFixed(2)}`;
}

function formatFunding(f: string): string {
  const pct = parseFloat(f) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(4)}%`;
}

export default function MarketStats({ market }: Props) {
  const { market: data, isLoading } = useMarket(market);

  if (isLoading || !data) {
    return (
      <div
        className="flex items-center gap-6 px-4 h-12 border-b text-xs"
        style={{ background: "#141414", borderColor: "#2A2A2A", color: "#8C8278" }}
      >
        <span>Loading market data...</span>
      </div>
    );
  }

  const markPx = parseFloat(data.markPx);
  const isPositive = data.change24h >= 0;
  const fundingPositive = parseFloat(data.funding) >= 0;

  return (
    <div
      className="flex items-center gap-0 px-3 h-12 border-b overflow-x-auto shrink-0"
      style={{ background: "#141414", borderColor: "#2A2A2A" }}
    >
      {/* Market name */}
      <div className="flex items-center gap-2 pr-4 mr-3 border-r" style={{ borderColor: "#2A2A2A" }}>
        <span className="font-semibold text-sm" style={{ color: "#F0EBE0" }}>
          {data.name}
          <span className="text-xs ml-1" style={{ color: "#8C8278" }}>PERP</span>
        </span>
      </div>

      {/* Mark price */}
      <div className="flex flex-col px-3">
        <span className="text-[10px]" style={{ color: "#8C8278" }}>Mark Price</span>
        <span
          className="font-mono text-sm font-semibold"
          style={{ color: isPositive ? "#00C853" : "#FF4466" }}
        >
          {markPx >= 1000
            ? markPx.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : markPx.toFixed(4)}
        </span>
      </div>

      {/* 24h Change */}
      <div className="flex flex-col px-3">
        <span className="text-[10px]" style={{ color: "#8C8278" }}>24h Change</span>
        <span
          className="font-mono text-xs font-medium"
          style={{ color: isPositive ? "#00C853" : "#FF4466" }}
        >
          {isPositive ? "+" : ""}
          {data.change24h.toFixed(2)}%
        </span>
      </div>

      {/* 24h Volume */}
      <div className="flex flex-col px-3">
        <span className="text-[10px]" style={{ color: "#8C8278" }}>24h Volume</span>
        <span className="font-mono text-xs" style={{ color: "#F0EBE0" }}>
          {formatVolume(data.dayNtlVlm)}
        </span>
      </div>

      {/* Open Interest */}
      <div className="flex flex-col px-3">
        <span className="text-[10px]" style={{ color: "#8C8278" }}>Open Interest</span>
        <span className="font-mono text-xs" style={{ color: "#F0EBE0" }}>
          {formatOI(data.openInterest, data.markPx)}
        </span>
      </div>

      {/* Funding Rate */}
      <div className="flex flex-col px-3">
        <span className="text-[10px]" style={{ color: "#8C8278" }}>Funding Rate</span>
        <span
          className="font-mono text-xs font-medium"
          style={{ color: fundingPositive ? "#00C853" : "#FF4466" }}
        >
          {formatFunding(data.funding)}
        </span>
      </div>

      {/* Max Leverage */}
      <div className="flex flex-col px-3">
        <span className="text-[10px]" style={{ color: "#8C8278" }}>Max Leverage</span>
        <span className="font-mono text-xs" style={{ color: "#D4A017" }}>
          {data.maxLeverage}x
        </span>
      </div>
    </div>
  );
}
