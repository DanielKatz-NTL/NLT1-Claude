"use client";

import { useState } from "react";
import { useMarket } from "@/hooks/useMarketData";

interface Props {
  market: string;
}

type Side = "long" | "short";
type OrderType = "market" | "limit";

export default function TradePanel({ market }: Props) {
  const { market: marketData } = useMarket(market);

  const [side, setSide] = useState<Side>("long");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [price, setPrice] = useState("");
  const [size, setSize] = useState("");
  const [leverage, setLeverage] = useState(10);

  const markPrice = marketData?.markPx ?? "0";
  const displayPrice = parseFloat(markPrice);

  const notional =
    size && parseFloat(size) > 0
      ? (parseFloat(size) * (orderType === "limit" && price ? parseFloat(price) : displayPrice)).toLocaleString(
          "en-US",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        )
      : "—";

  const isLong = side === "long";

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "#161B2E", borderLeft: "1px solid #1E2640" }}
    >
      {/* Side tabs */}
      <div className="flex shrink-0" style={{ borderBottom: "1px solid #1E2640" }}>
        {(["long", "short"] as Side[]).map((s) => (
          <button
            key={s}
            onClick={() => setSide(s)}
            className="flex-1 py-2.5 text-sm font-semibold capitalize transition-colors"
            style={{
              color:
                side === s
                  ? s === "long"
                    ? "#00FF88"
                    : "#FF4466"
                  : "#4A5170",
              borderBottom:
                side === s
                  ? `2px solid ${s === "long" ? "#00FF88" : "#FF4466"}`
                  : "2px solid transparent",
              background:
                side === s
                  ? s === "long"
                    ? "rgba(0,255,136,0.06)"
                    : "rgba(255,68,102,0.06)"
                  : "transparent",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="flex flex-col gap-3 p-3 flex-1 overflow-y-auto">
        {/* Order type */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium" style={{ color: "#4A5170" }}>
            Order Type
          </label>
          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value as OrderType)}
            className="w-full px-2 py-1.5 rounded text-xs outline-none cursor-pointer"
            style={{
              background: "#0D0E14",
              border: "1px solid #1E2640",
              color: "#E8EAF0",
            }}
          >
            <option value="market">Market</option>
            <option value="limit">Limit</option>
          </select>
        </div>

        {/* Price (limit only) */}
        {orderType === "limit" && (
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium" style={{ color: "#4A5170" }}>
              Price (USD)
            </label>
            <input
              type="number"
              placeholder={displayPrice > 0 ? displayPrice.toFixed(2) : "0.00"}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-2 py-1.5 rounded text-xs outline-none"
              style={{
                background: "#0D0E14",
                border: "1px solid #1E2640",
                color: "#E8EAF0",
              }}
            />
          </div>
        )}

        {/* Size */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium" style={{ color: "#4A5170" }}>
            Size ({market})
          </label>
          <input
            type="number"
            placeholder="0.000"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="w-full px-2 py-1.5 rounded text-xs outline-none"
            style={{
              background: "#0D0E14",
              border: "1px solid #1E2640",
              color: "#E8EAF0",
            }}
          />
          {/* Quick size buttons */}
          <div className="flex gap-1 mt-0.5">
            {["25%", "50%", "75%", "100%"].map((pct) => (
              <button
                key={pct}
                className="flex-1 py-0.5 rounded text-[10px] transition-colors hover:brightness-125"
                style={{
                  background: "#0D0E14",
                  border: "1px solid #1E2640",
                  color: "#8B92A8",
                }}
              >
                {pct}
              </button>
            ))}
          </div>
        </div>

        {/* Leverage */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-medium" style={{ color: "#4A5170" }}>
              Leverage
            </label>
            <span
              className="text-xs font-mono font-semibold"
              style={{ color: "#00E5CC" }}
            >
              {leverage}x
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={marketData?.maxLeverage ?? 50}
            step={1}
            value={leverage}
            onChange={(e) => setLeverage(parseInt(e.target.value))}
            className="w-full accent-[#00E5CC]"
            style={{ accentColor: "#00E5CC" }}
          />
          <div className="flex justify-between text-[9px]" style={{ color: "#4A5170" }}>
            <span>1x</span>
            <span>{Math.round((marketData?.maxLeverage ?? 50) / 2)}x</span>
            <span>{marketData?.maxLeverage ?? 50}x</span>
          </div>
        </div>

        {/* Order summary */}
        <div
          className="rounded p-2 text-[10px] flex flex-col gap-1"
          style={{ background: "#0D0E14", border: "1px solid #1E2640" }}
        >
          <div className="flex justify-between">
            <span style={{ color: "#4A5170" }}>Est. Notional</span>
            <span className="font-mono" style={{ color: "#8B92A8" }}>
              ${notional}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "#4A5170" }}>Margin Required</span>
            <span className="font-mono" style={{ color: "#8B92A8" }}>
              {size && parseFloat(size) > 0 && displayPrice > 0
                ? `$${(
                    (parseFloat(size) * displayPrice) /
                    leverage
                  ).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "#4A5170" }}>
              {orderType === "market" ? "Mark Price" : "Limit Price"}
            </span>
            <span className="font-mono" style={{ color: "#8B92A8" }}>
              {orderType === "market"
                ? displayPrice > 0
                  ? `$${displayPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : "—"
                : price
                ? `$${parseFloat(price).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Submit button */}
      <div className="p-3 shrink-0" style={{ borderTop: "1px solid #1E2640" }}>
        <button
          className="w-full py-2.5 rounded font-semibold text-sm transition-all hover:brightness-110 active:scale-[0.98]"
          style={{
            background: isLong
              ? "linear-gradient(135deg, #00FF88, #00CC77)"
              : "linear-gradient(135deg, #FF4466, #CC2244)",
            color: "#0D0E14",
          }}
        >
          {isLong ? "Buy / Long" : "Sell / Short"} {market}
        </button>
      </div>
    </div>
  );
}
