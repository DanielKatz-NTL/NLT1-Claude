"use client";

import { useState } from "react";
import { useTrading } from "@/context/TradingContext";
import { useMarketData } from "@/hooks/useMarketData";

type Tab = "positions" | "orders" | "history";

const TABS: { key: Tab; label: string }[] = [
  { key: "positions", label: "Positions" },
  { key: "orders", label: "Open Orders" },
  { key: "history", label: "Trade History" },
];

function fmt(n: number, decimals = 2) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-2">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: "#2A2A2A" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8C8278" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
      </div>
      <span className="text-xs" style={{ color: "#8C8278" }}>No {label}</span>
    </div>
  );
}

export default function PositionsTable() {
  const [activeTab, setActiveTab] = useState<Tab>("positions");
  const { positions, history, closePosition } = useTrading();
  const { markets } = useMarketData();

  // Build a map of market name -> current mark price
  const priceMap: Record<string, number> = {};
  markets.forEach((m) => { priceMap[m.name] = parseFloat(m.markPx); });

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "#141414", borderTop: "1px solid #2A2A2A" }}
    >
      {/* Tabs */}
      <div className="flex items-center shrink-0" style={{ borderBottom: "1px solid #2A2A2A" }}>
        {TABS.map(({ key, label }) => {
          const count = key === "positions" ? positions.length : key === "history" ? history.length : 0;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="px-4 py-2 text-xs font-medium transition-colors flex items-center gap-1.5"
              style={{
                color: activeTab === key ? "#D4A017" : "#8C8278",
                borderBottom: activeTab === key ? "2px solid #D4A017" : "2px solid transparent",
              }}
            >
              {label}
              {count > 0 && (
                <span
                  className="px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                  style={{ background: "rgba(212,160,23,0.2)", color: "#D4A017" }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {/* POSITIONS */}
        {activeTab === "positions" && (
          positions.length === 0 ? <EmptyState label="open positions" /> : (
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: "1px solid #2A2A2A" }}>
                  {["Market","Side","Size","Entry Price","Mark Price","Liq. Price","Unrealized PnL","Margin","Actions"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-medium whitespace-nowrap" style={{ color: "#8C8278" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {positions.map((pos) => {
                  const markPx = priceMap[pos.market] ?? pos.entryPrice;
                  const pnl = pos.side === "long"
                    ? (markPx - pos.entryPrice) * pos.size
                    : (pos.entryPrice - markPx) * pos.size;
                  const pnlPct = (pnl / pos.margin) * 100;
                  const liqPrice = pos.side === "long"
                    ? pos.entryPrice * (1 - 1 / pos.leverage + 0.005)
                    : pos.entryPrice * (1 + 1 / pos.leverage - 0.005);
                  return (
                    <tr key={pos.id} style={{ borderBottom: "1px solid #1E1E1E" }}>
                      <td className="px-3 py-2 font-medium" style={{ color: "#F0EBE0" }}>{pos.market}</td>
                      <td className="px-3 py-2 font-semibold" style={{ color: pos.side === "long" ? "#00C853" : "#FF4466" }}>
                        {pos.side.toUpperCase()} {pos.leverage}x
                      </td>
                      <td className="px-3 py-2 font-mono" style={{ color: "#C8BCA8" }}>{fmt(pos.size, 4)}</td>
                      <td className="px-3 py-2 font-mono" style={{ color: "#C8BCA8" }}>${fmt(pos.entryPrice)}</td>
                      <td className="px-3 py-2 font-mono" style={{ color: "#F0EBE0" }}>${fmt(markPx)}</td>
                      <td className="px-3 py-2 font-mono" style={{ color: "#FF4466" }}>${fmt(liqPrice)}</td>
                      <td className="px-3 py-2 font-mono font-semibold" style={{ color: pnl >= 0 ? "#00C853" : "#FF4466" }}>
                        {pnl >= 0 ? "+" : ""}${fmt(Math.abs(pnl))}
                        <span className="ml-1 text-[10px]">({pnl >= 0 ? "+" : ""}{fmt(pnlPct, 2)}%)</span>
                      </td>
                      <td className="px-3 py-2 font-mono" style={{ color: "#C8BCA8" }}>${fmt(pos.margin)}</td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => closePosition(pos.id, markPx)}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold transition-colors hover:brightness-110"
                          style={{ background: "rgba(255,68,102,0.15)", color: "#FF4466", border: "1px solid rgba(255,68,102,0.3)" }}
                        >
                          Close
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        )}

        {/* OPEN ORDERS (demo mode has no pending orders) */}
        {activeTab === "orders" && <EmptyState label="open orders" />}

        {/* HISTORY */}
        {activeTab === "history" && (
          history.length === 0 ? <EmptyState label="trade history" /> : (
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: "1px solid #2A2A2A" }}>
                  {["Time","Market","Side","Type","Size","Entry","Close","Fee","Realized PnL"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-medium whitespace-nowrap" style={{ color: "#8C8278" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((t) => (
                  <tr key={t.id + t.closedAt.getTime()} style={{ borderBottom: "1px solid #1E1E1E" }}>
                    <td className="px-3 py-2 font-mono" style={{ color: "#8C8278" }}>
                      {t.closedAt.toLocaleTimeString()}
                    </td>
                    <td className="px-3 py-2 font-medium" style={{ color: "#F0EBE0" }}>{t.market}</td>
                    <td className="px-3 py-2 font-semibold" style={{ color: t.side === "long" ? "#00C853" : "#FF4466" }}>
                      {t.side.toUpperCase()}
                    </td>
                    <td className="px-3 py-2" style={{ color: "#C8BCA8" }}>{t.orderType}</td>
                    <td className="px-3 py-2 font-mono" style={{ color: "#C8BCA8" }}>{fmt(t.size, 4)}</td>
                    <td className="px-3 py-2 font-mono" style={{ color: "#C8BCA8" }}>${fmt(t.entryPrice)}</td>
                    <td className="px-3 py-2 font-mono" style={{ color: "#C8BCA8" }}>${fmt(t.closePrice)}</td>
                    <td className="px-3 py-2 font-mono" style={{ color: "#8C8278" }}>${fmt(t.fee, 4)}</td>
                    <td className="px-3 py-2 font-mono font-semibold" style={{ color: t.realizedPnl >= 0 ? "#00C853" : "#FF4466" }}>
                      {t.realizedPnl >= 0 ? "+" : ""}${fmt(Math.abs(t.realizedPnl))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  );
}
