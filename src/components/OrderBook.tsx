"use client";

import { useOrderBook } from "@/hooks/useOrderBook";
import { OrderLevel } from "@/lib/hyperliquid";

interface Props {
  market: string;
}

function formatPrice(px: string): string {
  const n = parseFloat(px);
  if (n >= 1000) return n.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  if (n >= 1) return n.toFixed(3);
  return n.toFixed(5);
}

function formatSize(sz: string): string {
  const n = parseFloat(sz);
  if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (n >= 1) return n.toFixed(2);
  return n.toFixed(4);
}

interface BookRowProps {
  level: OrderLevel;
  side: "ask" | "bid";
  maxSize: number;
}

function BookRow({ level, side, maxSize }: BookRowProps) {
  const size = parseFloat(level.sz);
  const pct = maxSize > 0 ? (size / maxSize) * 100 : 0;
  const isAsk = side === "ask";

  return (
    <div
      className="relative flex items-center justify-between px-2 py-[2px] text-[11px] font-mono hover:bg-white/5 cursor-default"
      style={{ minHeight: 18 }}
    >
      {/* Background bar */}
      <div
        className="absolute inset-y-0 right-0"
        style={{
          width: `${pct}%`,
          background: isAsk ? "rgba(255,68,102,0.12)" : "rgba(0,200,83,0.12)",
        }}
      />
      {/* Price */}
      <span
        className="relative z-10 w-24 text-left"
        style={{ color: isAsk ? "#FF4466" : "#00C853" }}
      >
        {formatPrice(level.px)}
      </span>
      {/* Size */}
      <span className="relative z-10 w-20 text-right" style={{ color: "#F0EBE0" }}>
        {formatSize(level.sz)}
      </span>
      {/* Count */}
      <span className="relative z-10 w-8 text-right" style={{ color: "#8C8278" }}>
        {level.n}
      </span>
    </div>
  );
}

export default function OrderBook({ market }: Props) {
  const { orderBook, isLoading } = useOrderBook(market);

  // l2Book returns levels as [asks, bids]
  const asks: OrderLevel[] = orderBook?.levels?.[0] ?? [];
  const bids: OrderLevel[] = orderBook?.levels?.[1] ?? [];

  // Show top 12 asks (reversed so highest ask at top) and top 12 bids
  const displayAsks = [...asks].slice(0, 12).reverse();
  const displayBids = [...bids].slice(0, 12);

  const allSizes = [...asks, ...bids].map((l) => parseFloat(l.sz));
  const maxSize = allSizes.length > 0 ? Math.max(...allSizes) : 1;

  // Mid price spread
  const bestAsk = asks[0] ? parseFloat(asks[0].px) : null;
  const bestBid = bids[0] ? parseFloat(bids[0].px) : null;
  const spread = bestAsk && bestBid ? bestAsk - bestBid : null;
  const spreadPct = spread && bestBid ? ((spread / bestBid) * 100).toFixed(3) : null;

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "#141414", borderLeft: "1px solid #2A2A2A" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-2 py-2 border-b shrink-0"
        style={{ borderColor: "#2A2A2A" }}
      >
        <span className="text-xs font-semibold" style={{ color: "#F0EBE0" }}>
          Order Book
        </span>
        {isLoading && (
          <span className="text-[10px]" style={{ color: "#8C8278" }}>
            refreshing...
          </span>
        )}
      </div>

      {/* Column labels */}
      <div
        className="flex items-center justify-between px-2 py-1 text-[10px]"
        style={{ color: "#8C8278", borderBottom: "1px solid #2A2A2A" }}
      >
        <span className="w-24">Price</span>
        <span className="w-20 text-right">Size</span>
        <span className="w-8 text-right">Orders</span>
      </div>

      {/* Asks (sell side) */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col justify-end overflow-hidden">
          {displayAsks.map((level, i) => (
            <BookRow key={`ask-${i}`} level={level} side="ask" maxSize={maxSize} />
          ))}
        </div>

        {/* Spread row */}
        {spread !== null && (
          <div
            className="flex items-center justify-between px-2 py-1 text-[10px] shrink-0"
            style={{
              background: "#0A0A0A",
              borderTop: "1px solid #2A2A2A",
              borderBottom: "1px solid #2A2A2A",
            }}
          >
            <span style={{ color: "#8C8278" }}>Spread</span>
            <span className="font-mono" style={{ color: "#C8BCA8" }}>
              {formatPrice(spread.toString())}
            </span>
            <span className="font-mono" style={{ color: "#8C8278" }}>
              {spreadPct}%
            </span>
          </div>
        )}

        {/* Bids (buy side) */}
        <div className="flex-1 overflow-hidden">
          {displayBids.map((level, i) => (
            <BookRow key={`bid-${i}`} level={level} side="bid" maxSize={maxSize} />
          ))}
        </div>
      </div>
    </div>
  );
}
