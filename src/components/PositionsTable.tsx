"use client";

"use client";

import { useState, useRef } from "react";
import { useTrading, DemoPosition } from "@/context/TradingContext";
import { useMarketData } from "@/hooks/useMarketData";

interface CloseConfirmProps {
  pos: DemoPosition;
  markPrice: number;
  pnl: number;
  onConfirm: () => void;
  onCancel: () => void;
}

function CloseConfirmModal({ pos, markPrice, pnl, onConfirm, onCancel }: CloseConfirmProps) {
  const isProfit = pnl >= 0;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={onCancel}
    >
      <div
        className="rounded-xl p-6 flex flex-col gap-4 w-80"
        style={{ background: "#141414", border: "1px solid #2A2A2A" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold text-base" style={{ color: "#F0EBE0" }}>Close Position</h3>
          <p className="text-xs" style={{ color: "#8C8278" }}>
            Are you sure you want to close this position?
          </p>
        </div>

        {/* Position summary */}
        <div className="rounded-lg p-3 flex flex-col gap-2 text-xs" style={{ background: "#0A0A0A", border: "1px solid #2A2A2A" }}>
          <div className="flex justify-between">
            <span style={{ color: "#8C8278" }}>Market</span>
            <span className="font-medium" style={{ color: "#F0EBE0" }}>{pos.market}</span>
          </div>
          {pos.label && (
            <div className="flex justify-between">
              <span style={{ color: "#8C8278" }}>Label</span>
              <span style={{ color: "#D4A017" }}>{pos.label}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span style={{ color: "#8C8278" }}>Side</span>
            <span className="font-semibold" style={{ color: pos.side === "long" ? "#00C853" : "#FF4466" }}>
              {pos.side.toUpperCase()} {pos.leverage}x
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "#8C8278" }}>Close Price</span>
            <span className="font-mono" style={{ color: "#F0EBE0" }}>${markPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div style={{ borderTop: "1px solid #2A2A2A", paddingTop: 4 }} className="flex justify-between">
            <span style={{ color: "#8C8278" }}>Realized PnL</span>
            <span className="font-mono font-bold" style={{ color: isProfit ? "#00C853" : "#FF4466" }}>
              {isProfit ? "+" : ""}${Math.abs(pnl).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded text-sm font-medium transition-colors hover:brightness-110"
            style={{ background: "#1E1E1E", color: "#C8BCA8", border: "1px solid #2A2A2A" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded text-sm font-semibold transition-colors hover:brightness-110"
            style={{ background: isProfit ? "rgba(0,200,83,0.15)" : "rgba(255,68,102,0.15)", color: isProfit ? "#00C853" : "#FF4466", border: `1px solid ${isProfit ? "rgba(0,200,83,0.3)" : "rgba(255,68,102,0.3)"}` }}
          >
            Close Position
          </button>
        </div>
      </div>
    </div>
  );
}

type Tab = "positions" | "orders" | "history";

const TABS: { key: Tab; label: string }[] = [
  { key: "positions", label: "Positions" },
  { key: "orders", label: "Open Orders" },
  { key: "history", label: "Trade History" },
];

function fmt(n: number, decimals = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-2">
      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#2A2A2A" }}>
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

function closeReasonLabel(reason: string) {
  const map: Record<string, string> = {
    manual: "Manual",
    stop_loss: "Stop Loss",
    take_profit: "Take Profit",
    trailing_stop: "Trailing Stop",
    liquidation: "Liquidated",
  };
  return map[reason] ?? reason;
}

function closeReasonColor(reason: string) {
  if (reason === "take_profit") return "#00C853";
  if (reason === "liquidation") return "#FF4466";
  if (reason === "stop_loss" || reason === "trailing_stop") return "#FF8C42";
  return "#8C8278";
}

function InlineLabel({ pos }: { pos: DemoPosition }) {
  const { updatePosition } = useTrading();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(pos.label ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit() {
    setDraft(pos.label ?? "");
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function commit() {
    updatePosition(pos.id, { label: draft.trim() || undefined });
    setEditing(false);
  }

  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-medium text-xs" style={{ color: "#F0EBE0" }}>{pos.market}</span>
      {editing ? (
        <input
          ref={inputRef}
          type="text"
          maxLength={32}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
          className="px-1 py-0.5 rounded text-[10px] outline-none w-28"
          style={{ background: "#1E1E1E", border: "1px solid #D4A017", color: "#F0EBE0" }}
        />
      ) : (
        <button
          onClick={startEdit}
          className="text-left text-[10px] truncate max-w-[120px] transition-opacity hover:opacity-80"
          style={{ color: pos.label ? "#D4A017" : "#4A4540" }}
        >
          {pos.label ?? "+ add label"}
        </button>
      )}
    </div>
  );
}

interface ToolsRowProps {
  pos: DemoPosition;
  markPrice: number;
}

function ToolsRow({ pos, markPrice }: ToolsRowProps) {
  const { updatePosition } = useTrading();
  const [slValue, setSlValue] = useState(pos.stopLoss?.toString() ?? "");
  const [tpValue, setTpValue] = useState(pos.takeProfit?.toString() ?? "");
  const [trailValue, setTrailValue] = useState(pos.trailingStop?.distance?.toString() ?? "");

  function applyStopLoss() {
    const val = parseFloat(slValue);
    updatePosition(pos.id, { stopLoss: isNaN(val) ? undefined : val });
  }
  function clearStopLoss() {
    setSlValue("");
    updatePosition(pos.id, { stopLoss: undefined });
  }

  function applyTakeProfit() {
    const val = parseFloat(tpValue);
    updatePosition(pos.id, { takeProfit: isNaN(val) ? undefined : val });
  }
  function clearTakeProfit() {
    setTpValue("");
    updatePosition(pos.id, { takeProfit: undefined });
  }

  function applyTrailingStop() {
    const dist = parseFloat(trailValue);
    if (isNaN(dist) || dist <= 0) return;
    updatePosition(pos.id, {
      trailingStop: { distance: dist, highWaterMark: markPrice },
    });
  }
  function clearTrailingStop() {
    setTrailValue("");
    updatePosition(pos.id, { trailingStop: undefined });
  }

  const isLong = pos.side === "long";

  return (
    <tr style={{ background: "#0F0F0F", borderBottom: "1px solid #2A2A2A" }}>
      <td colSpan={9} className="px-3 py-2">
        <div className="flex items-center gap-6 flex-wrap">

          {/* Stop Loss */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium" style={{ color: "#FF8C42" }}>Stop Loss</span>
            <input
              type="number"
              value={slValue}
              onChange={(e) => setSlValue(e.target.value)}
              placeholder={isLong ? "below entry" : "above entry"}
              className="w-24 px-1.5 py-0.5 rounded text-[10px] outline-none font-mono"
              style={{ background: "#1E1E1E", border: "1px solid #2A2A2A", color: "#F0EBE0" }}
            />
            <button onClick={applyStopLoss} className="px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{ background: "rgba(255,140,66,0.15)", color: "#FF8C42" }}>Set</button>
            {pos.stopLoss !== undefined && (
              <button onClick={clearStopLoss} className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: "#1E1E1E", color: "#8C8278" }}>✕</button>
            )}
            {pos.stopLoss !== undefined && (
              <span className="text-[10px] font-mono" style={{ color: "#FF8C42" }}>${fmt(pos.stopLoss)}</span>
            )}
          </div>

          {/* Take Profit */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium" style={{ color: "#00C8FF" }}>Take Profit</span>
            <input
              type="number"
              value={tpValue}
              onChange={(e) => setTpValue(e.target.value)}
              placeholder={isLong ? "above entry" : "below entry"}
              className="w-24 px-1.5 py-0.5 rounded text-[10px] outline-none font-mono"
              style={{ background: "#1E1E1E", border: "1px solid #2A2A2A", color: "#F0EBE0" }}
            />
            <button onClick={applyTakeProfit} className="px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{ background: "rgba(0,200,255,0.12)", color: "#00C8FF" }}>Set</button>
            {pos.takeProfit !== undefined && (
              <button onClick={clearTakeProfit} className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: "#1E1E1E", color: "#8C8278" }}>✕</button>
            )}
            {pos.takeProfit !== undefined && (
              <span className="text-[10px] font-mono" style={{ color: "#00C8FF" }}>${fmt(pos.takeProfit)}</span>
            )}
          </div>

          {/* Trailing Stop */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium" style={{ color: "#D4A017" }}>Trailing Stop</span>
            <input
              type="number"
              value={trailValue}
              onChange={(e) => setTrailValue(e.target.value)}
              placeholder="distance $"
              className="w-20 px-1.5 py-0.5 rounded text-[10px] outline-none font-mono"
              style={{ background: "#1E1E1E", border: "1px solid #2A2A2A", color: "#F0EBE0" }}
            />
            <button onClick={applyTrailingStop} className="px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{ background: "rgba(212,160,23,0.12)", color: "#D4A017" }}>Set</button>
            {pos.trailingStop && (
              <button onClick={clearTrailingStop} className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: "#1E1E1E", color: "#8C8278" }}>✕</button>
            )}
            {pos.trailingStop && (
              <span className="text-[10px] font-mono" style={{ color: "#D4A017" }}>
                ±${fmt(pos.trailingStop.distance)} · trigger ${fmt(
                  isLong ? pos.trailingStop.highWaterMark - pos.trailingStop.distance
                         : pos.trailingStop.highWaterMark + pos.trailingStop.distance
                )}
              </span>
            )}
          </div>

        </div>
      </td>
    </tr>
  );
}

export default function PositionsTable() {
  const [activeTab, setActiveTab] = useState<Tab>("positions");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pendingClose, setPendingClose] = useState<{ pos: DemoPosition; markPrice: number; pnl: number } | null>(null);
  const { positions, history, closePosition } = useTrading();
  const { markets } = useMarketData();

  const priceMap: Record<string, number> = {};
  markets.forEach((m) => { priceMap[m.name] = parseFloat(m.markPx); });

  return (
    <div className="flex flex-col h-full relative" style={{ background: "#141414", borderTop: "1px solid #2A2A2A" }}>
      {pendingClose && (
        <CloseConfirmModal
          pos={pendingClose.pos}
          markPrice={pendingClose.markPrice}
          pnl={pendingClose.pnl}
          onConfirm={() => { closePosition(pendingClose.pos.id, pendingClose.markPrice); setPendingClose(null); }}
          onCancel={() => setPendingClose(null)}
        />
      )}
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
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold" style={{ background: "rgba(212,160,23,0.2)", color: "#D4A017" }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
        <span className="ml-auto mr-3 text-[10px]" style={{ color: "#4A4540" }}>
          Click a position row to set SL / TP / Trailing Stop
        </span>
      </div>

      <div className="flex-1 overflow-auto">
        {/* POSITIONS */}
        {activeTab === "positions" && (
          positions.length === 0 ? <EmptyState label="open positions" /> : (
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: "1px solid #2A2A2A" }}>
                  {["Market / Label","Side","Size","Entry","Mark","Liq.","PnL","SL / TP","Actions"].map((h) => (
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
                  const isExpanded = expandedId === pos.id;

                  return (
                    <>
                      <tr
                        key={pos.id}
                        onClick={() => setExpandedId(isExpanded ? null : pos.id)}
                        className="cursor-pointer transition-colors"
                        style={{
                          borderBottom: isExpanded ? "none" : "1px solid #1E1E1E",
                          background: isExpanded ? "#181818" : undefined,
                        }}
                        onMouseEnter={(e) => { if (!isExpanded) (e.currentTarget as HTMLElement).style.background = "#181818"; }}
                        onMouseLeave={(e) => { if (!isExpanded) (e.currentTarget as HTMLElement).style.background = ""; }}
                      >
                        <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                          <InlineLabel pos={pos} />
                        </td>
                        <td className="px-3 py-2 font-semibold" style={{ color: pos.side === "long" ? "#00C853" : "#FF4466" }}>
                          {pos.side.toUpperCase()} {pos.leverage}x
                        </td>
                        <td className="px-3 py-2 font-mono" style={{ color: "#C8BCA8" }}>{fmt(pos.size, 4)}</td>
                        <td className="px-3 py-2 font-mono" style={{ color: "#C8BCA8" }}>${fmt(pos.entryPrice)}</td>
                        <td className="px-3 py-2 font-mono" style={{ color: "#F0EBE0" }}>${fmt(markPx)}</td>
                        <td className="px-3 py-2 font-mono" style={{ color: "#FF4466" }}>${fmt(liqPrice)}</td>
                        <td className="px-3 py-2 font-mono font-semibold" style={{ color: pnl >= 0 ? "#00C853" : "#FF4466" }}>
                          {pnl >= 0 ? "+" : ""}${fmt(Math.abs(pnl))}
                          <span className="ml-1 text-[10px] opacity-70">({pnl >= 0 ? "+" : ""}{fmt(pnlPct)}%)</span>
                        </td>
                        <td className="px-3 py-2 font-mono text-[10px]">
                          {pos.stopLoss !== undefined && (
                            <span style={{ color: "#FF8C42" }}>SL ${fmt(pos.stopLoss)} </span>
                          )}
                          {pos.takeProfit !== undefined && (
                            <span style={{ color: "#00C8FF" }}>TP ${fmt(pos.takeProfit)}</span>
                          )}
                          {pos.trailingStop && (
                            <span style={{ color: "#D4A017" }}>Trail ±${fmt(pos.trailingStop.distance)}</span>
                          )}
                          {!pos.stopLoss && !pos.takeProfit && !pos.trailingStop && (
                            <span style={{ color: "#4A4540" }}>—</span>
                          )}
                        </td>
                        <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setPendingClose({ pos, markPrice: markPx, pnl })}
                            className="px-2 py-0.5 rounded text-[10px] font-semibold"
                            style={{ background: "rgba(255,68,102,0.15)", color: "#FF4466", border: "1px solid rgba(255,68,102,0.3)" }}
                          >
                            Close
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <ToolsRow key={`tools-${pos.id}`} pos={pos} markPrice={markPx} />
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          )
        )}

        {activeTab === "orders" && <EmptyState label="open orders" />}

        {/* HISTORY */}
        {activeTab === "history" && (
          history.length === 0 ? <EmptyState label="trade history" /> : (
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: "1px solid #2A2A2A" }}>
                  {["Time","Market","Label","Side","Type","Size","Entry","Close","Reason","Fee","PnL"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-medium whitespace-nowrap" style={{ color: "#8C8278" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((t) => (
                  <tr key={t.id + t.closedAt.getTime()} style={{ borderBottom: "1px solid #1E1E1E" }}>
                    <td className="px-3 py-2 font-mono" style={{ color: "#8C8278" }}>{t.closedAt.toLocaleTimeString()}</td>
                    <td className="px-3 py-2 font-medium" style={{ color: "#F0EBE0" }}>{t.market}</td>
                    <td className="px-3 py-2 text-[10px] max-w-[100px] truncate" style={{ color: t.label ? "#D4A017" : "#4A4540" }}>{t.label ?? "—"}</td>
                    <td className="px-3 py-2 font-semibold" style={{ color: t.side === "long" ? "#00C853" : "#FF4466" }}>{t.side.toUpperCase()}</td>
                    <td className="px-3 py-2" style={{ color: "#C8BCA8" }}>{t.orderType}</td>
                    <td className="px-3 py-2 font-mono" style={{ color: "#C8BCA8" }}>{fmt(t.size, 4)}</td>
                    <td className="px-3 py-2 font-mono" style={{ color: "#C8BCA8" }}>${fmt(t.entryPrice)}</td>
                    <td className="px-3 py-2 font-mono" style={{ color: "#C8BCA8" }}>${fmt(t.closePrice)}</td>
                    <td className="px-3 py-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: "#1E1E1E", color: closeReasonColor(t.closeReason) }}>
                        {closeReasonLabel(t.closeReason)}
                      </span>
                    </td>
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
