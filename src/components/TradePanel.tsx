"use client";

import { useState } from "react";
import { useMarket } from "@/hooks/useMarketData";
import { BRANDING } from "@/config/branding";
import { useTrading } from "@/context/TradingContext";

interface Props {
  market: string;
}

type Side = "long" | "short";
type OrderType = "market" | "limit";

export default function TradePanel({ market }: Props) {
  const { market: marketData } = useMarket(market);
  const { openPosition } = useTrading();

  const [side, setSide] = useState<Side>("long");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [price, setPrice] = useState("");
  const [size, setSize] = useState("");
  const [leverage, setLeverage] = useState(10);
  const [flash, setFlash] = useState<"success" | "error" | null>(null);

  const markPrice = marketData?.markPx ?? "0";
  const displayPrice = parseFloat(markPrice);

  const entryPrice =
    orderType === "limit" && price ? parseFloat(price) : displayPrice;
  const notionalRaw =
    size && parseFloat(size) > 0 && entryPrice > 0
      ? parseFloat(size) * entryPrice
      : 0;
  const notional =
    notionalRaw > 0
      ? notionalRaw.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "—";
  const marginRaw = notionalRaw > 0 ? notionalRaw / leverage : 0;
  const feeRate =
    orderType === "market"
      ? parseFloat(BRANDING.fees.taker) / 100
      : parseFloat(BRANDING.fees.maker) / 100;
  const feeRaw = notionalRaw * feeRate;

  // Simplified liq price: long = entry*(1 - 1/lev + 0.005), short = entry*(1 + 1/lev - 0.005)
  const liqPrice =
    entryPrice > 0 && parseFloat(size) > 0
      ? side === "long"
        ? entryPrice * (1 - 1 / leverage + 0.005)
        : entryPrice * (1 + 1 / leverage - 0.005)
      : null;

  const isLong = side === "long";

  function handleSubmit() {
    const sizeNum = parseFloat(size);
    if (!sizeNum || sizeNum <= 0) {
      setFlash("error");
      setTimeout(() => setFlash(null), 1500);
      return;
    }
    if (!entryPrice || entryPrice <= 0) {
      setFlash("error");
      setTimeout(() => setFlash(null), 1500);
      return;
    }

    openPosition({
      market,
      side,
      size: sizeNum,
      entryPrice,
      leverage,
      margin: marginRaw,
      fee: feeRaw,
      orderType,
    });

    setFlash("success");
    setTimeout(() => setFlash(null), 2000);
    setSize("");
    setPrice("");
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "#141414", borderLeft: "1px solid #2A2A2A" }}
    >
      {/* Side tabs */}
      <div className="flex shrink-0" style={{ borderBottom: "1px solid #2A2A2A" }}>
        {(["long", "short"] as Side[]).map((s) => (
          <button
            key={s}
            onClick={() => setSide(s)}
            className="flex-1 py-2.5 text-sm font-semibold capitalize transition-colors"
            style={{
              color:
                side === s
                  ? s === "long"
                    ? "#00C853"
                    : "#FF4466"
                  : "#8C8278",
              borderBottom:
                side === s
                  ? `2px solid ${s === "long" ? "#00C853" : "#FF4466"}`
                  : "2px solid transparent",
              background:
                side === s
                  ? s === "long"
                    ? "rgba(0,200,83,0.06)"
                    : "rgba(255,68,102,0.06)"
                  : "transparent",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Demo badge */}
      <div className="px-3 pt-2 shrink-0">
        <span
          className="text-[10px] px-2 py-0.5 rounded font-medium"
          style={{ background: "rgba(212,160,23,0.12)", color: "#D4A017" }}
        >
          Demo Mode — no real funds
        </span>
      </div>

      {/* Form */}
      <div className="flex flex-col gap-3 p-3 flex-1 overflow-y-auto">
        {/* Order type */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium" style={{ color: "#8C8278" }}>
            Order Type
          </label>
          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value as OrderType)}
            className="w-full px-2 py-1.5 rounded text-xs outline-none cursor-pointer"
            style={{
              background: "#0A0A0A",
              border: "1px solid #2A2A2A",
              color: "#F0EBE0",
            }}
          >
            <option value="market">Market</option>
            <option value="limit">Limit</option>
          </select>
        </div>

        {/* Price (limit only) */}
        {orderType === "limit" && (
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium" style={{ color: "#8C8278" }}>
              Price (USD)
            </label>
            <input
              type="number"
              placeholder={displayPrice > 0 ? displayPrice.toFixed(2) : "0.00"}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-2 py-1.5 rounded text-xs outline-none"
              style={{
                background: "#0A0A0A",
                border: "1px solid #2A2A2A",
                color: "#F0EBE0",
              }}
            />
          </div>
        )}

        {/* Size */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium" style={{ color: "#8C8278" }}>
            Size ({market})
          </label>
          <input
            type="number"
            placeholder="0.000"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="w-full px-2 py-1.5 rounded text-xs outline-none"
            style={{
              background: flash === "error" ? "rgba(255,68,102,0.08)" : "#0A0A0A",
              border: `1px solid ${flash === "error" ? "#FF4466" : "#2A2A2A"}`,
              color: "#F0EBE0",
            }}
          />
          <div className="flex gap-1 mt-0.5">
            {["25%", "50%", "75%", "100%"].map((pct) => (
              <button
                key={pct}
                className="flex-1 py-0.5 rounded text-[10px] transition-colors hover:brightness-125"
                style={{
                  background: "#0A0A0A",
                  border: "1px solid #2A2A2A",
                  color: "#C8BCA8",
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
            <label className="text-[10px] font-medium" style={{ color: "#8C8278" }}>
              Leverage
            </label>
            <span className="text-xs font-mono font-semibold" style={{ color: "#D4A017" }}>
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
            className="w-full"
            style={{ accentColor: "#D4A017" }}
          />
          <div className="flex justify-between text-[9px]" style={{ color: "#8C8278" }}>
            <span>1x</span>
            <span>{Math.round((marketData?.maxLeverage ?? 50) / 2)}x</span>
            <span>{marketData?.maxLeverage ?? 50}x</span>
          </div>
        </div>

        {/* Order summary */}
        <div
          className="rounded p-2 text-[10px] flex flex-col gap-1.5"
          style={{ background: "#0A0A0A", border: "1px solid #2A2A2A" }}
        >
          <div className="flex justify-between">
            <span style={{ color: "#8C8278" }}>Est. Notional</span>
            <span className="font-mono" style={{ color: "#C8BCA8" }}>${notional}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "#8C8278" }}>Margin Required</span>
            <span className="font-mono" style={{ color: "#C8BCA8" }}>
              {marginRaw > 0
                ? `$${marginRaw.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "#8C8278" }}>
              {orderType === "market" ? "Mark Price" : "Limit Price"}
            </span>
            <span className="font-mono" style={{ color: "#C8BCA8" }}>
              {entryPrice > 0
                ? `$${entryPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : "—"}
            </span>
          </div>
          {liqPrice && (
            <div className="flex justify-between">
              <span style={{ color: "#8C8278" }}>Liq. Price</span>
              <span className="font-mono" style={{ color: "#FF4466" }}>
                ${liqPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}
          <div style={{ borderTop: "1px solid #2A2A2A", margin: "2px 0" }} />
          <div className="flex justify-between">
            <span style={{ color: "#8C8278" }}>
              {orderType === "market" ? "Taker" : "Maker"} Fee
              <span
                className="ml-1 px-1 rounded"
                style={{ background: "rgba(212,160,23,0.12)", color: "#D4A017", fontSize: "9px" }}
              >
                {orderType === "market" ? BRANDING.fees.taker : BRANDING.fees.maker}
              </span>
            </span>
            <span className="font-mono" style={{ color: "#C8BCA8" }}>
              {feeRaw > 0
                ? `$${feeRaw.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`
                : "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "#8C8278" }}>Total Cost</span>
            <span className="font-mono font-semibold" style={{ color: "#F0EBE0" }}>
              {marginRaw > 0
                ? `$${(marginRaw + feeRaw).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="p-3 shrink-0 flex flex-col gap-2" style={{ borderTop: "1px solid #2A2A2A" }}>
        {flash === "success" && (
          <div
            className="text-xs text-center py-1 rounded font-medium"
            style={{ background: "rgba(0,200,83,0.12)", color: "#00C853" }}
          >
            Position opened!
          </div>
        )}
        {flash === "error" && (
          <div
            className="text-xs text-center py-1 rounded font-medium"
            style={{ background: "rgba(255,68,102,0.12)", color: "#FF4466" }}
          >
            Enter a valid size
          </div>
        )}
        <button
          onClick={handleSubmit}
          className="w-full py-2.5 rounded font-semibold text-sm transition-all hover:brightness-110 active:scale-[0.98]"
          style={{
            background: isLong
              ? "linear-gradient(135deg, #00C853, #009C3B)"
              : "linear-gradient(135deg, #FF4466, #CC2244)",
            color: "#0A0A0A",
          }}
        >
          {isLong ? "Buy / Long" : "Sell / Short"} {market}
        </button>
      </div>
    </div>
  );
}
