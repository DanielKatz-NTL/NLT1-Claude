"use client";

import useSWR from "swr";
import { useWallet } from "@/context/WalletContext";

interface Position {
  coin: string;
  szi: string;
  entryPx: string;
  positionValue: string;
  unrealizedPnl: string;
  returnOnEquity: string;
  leverage: { type: string; value: number };
}

interface ClearinghouseState {
  marginSummary?: {
    accountValue: string;
    totalMarginUsed: string;
  };
  assetPositions?: Array<{ position: Position }>;
}

const fetcher = (address: string) =>
  fetch("https://api.hyperliquid.xyz/info", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "clearinghouseState", user: address }),
  }).then((r) => r.json());

function fmt(val: string | undefined, prefix = "$") {
  if (!val) return "—";
  const n = parseFloat(val);
  if (isNaN(n)) return "—";
  return prefix + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function PortfolioView() {
  const { address, connect } = useWallet();

  const { data, error } = useSWR<ClearinghouseState>(
    address ? address : null,
    () => fetcher(address!),
    { revalidateOnFocus: false }
  );

  if (!address) {
    return (
      <div className="flex flex-1 items-center justify-center" style={{ background: "#0A0A0A" }}>
        <div
          className="flex flex-col items-center gap-6 p-10 rounded-2xl border"
          style={{ background: "#141414", borderColor: "#2A2A2A", maxWidth: 400 }}
        >
          {/* Diamond logo */}
          <svg width="56" height="56" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="28" height="28" rx="6" fill="#1E1E1E" />
            <polygon points="14,4 24,14 14,24 4,14" fill="none" stroke="#D4A017" strokeWidth="1.5" />
            <polygon points="14,8 20,14 14,20 8,14" fill="#D4A017" opacity="0.25" />
            <circle cx="14" cy="14" r="2.5" fill="#D4A017" />
          </svg>
          <div className="text-center">
            <p className="text-base font-medium" style={{ color: "#F0EBE0" }}>
              Connect your wallet to view your portfolio
            </p>
            <p className="text-sm mt-1" style={{ color: "#8C8278" }}>
              See your positions, account value, and margin usage
            </p>
          </div>
          <button
            onClick={connect}
            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all hover:brightness-110 active:scale-95"
            style={{ background: "linear-gradient(135deg, #D4A017, #B8860B)", color: "#0A0A0A" }}
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  const loading = !data && !error;
  const positions = data?.assetPositions?.map((ap) => ap.position) ?? [];
  const accountValue = data?.marginSummary?.accountValue;
  const marginUsed = data?.marginSummary?.totalMarginUsed;

  return (
    <div className="flex flex-col flex-1 overflow-auto p-6" style={{ background: "#0A0A0A" }}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#F0EBE0" }}>Portfolio</h1>
        <p className="text-sm mt-1 font-num" style={{ color: "#8C8278" }}>{address}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32" style={{ color: "#8C8278" }}>
          Loading account data...
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-32" style={{ color: "#FF4466" }}>
          Failed to load account data.
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="rounded-lg p-4 border" style={{ background: "#141414", borderColor: "#2A2A2A" }}>
              <p className="text-xs mb-1" style={{ color: "#8C8278" }}>Account Value</p>
              <p className="text-xl font-semibold font-num" style={{ color: "#F0EBE0" }}>
                {fmt(accountValue)}
              </p>
            </div>
            <div className="rounded-lg p-4 border" style={{ background: "#141414", borderColor: "#2A2A2A" }}>
              <p className="text-xs mb-1" style={{ color: "#8C8278" }}>Margin Used</p>
              <p className="text-xl font-semibold font-num" style={{ color: "#F0EBE0" }}>
                {fmt(marginUsed)}
              </p>
            </div>
          </div>

          {/* Positions table */}
          <div className="rounded-lg overflow-hidden border" style={{ borderColor: "#2A2A2A" }}>
            <div className="px-4 py-3 border-b" style={{ background: "#141414", borderColor: "#2A2A2A" }}>
              <p className="text-sm font-medium" style={{ color: "#F0EBE0" }}>Open Positions</p>
            </div>
            {positions.length === 0 ? (
              <div className="flex items-center justify-center py-12" style={{ color: "#8C8278" }}>
                No open positions
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "#141414", borderBottom: "1px solid #2A2A2A" }}>
                    <th className="text-left px-4 py-3 font-medium" style={{ color: "#8C8278" }}>Market</th>
                    <th className="text-left px-4 py-3 font-medium" style={{ color: "#8C8278" }}>Side</th>
                    <th className="text-right px-4 py-3 font-medium" style={{ color: "#8C8278" }}>Size</th>
                    <th className="text-right px-4 py-3 font-medium" style={{ color: "#8C8278" }}>Entry Price</th>
                    <th className="text-right px-4 py-3 font-medium" style={{ color: "#8C8278" }}>Mark Price</th>
                    <th className="text-right px-4 py-3 font-medium" style={{ color: "#8C8278" }}>PnL</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((pos, idx) => {
                    const size = parseFloat(pos.szi);
                    const isLong = size >= 0;
                    const pnl = parseFloat(pos.unrealizedPnl ?? "0");
                    return (
                      <tr
                        key={pos.coin}
                        style={{
                          background: idx % 2 === 0 ? "#0A0A0A" : "#0F0F0F",
                          borderBottom: "1px solid #1E1E1E",
                        }}
                      >
                        <td className="px-4 py-3 font-medium" style={{ color: "#D4A017" }}>{pos.coin}</td>
                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-0.5 rounded text-xs font-semibold"
                            style={{
                              background: isLong ? "rgba(0,200,83,0.12)" : "rgba(255,68,102,0.12)",
                              color: isLong ? "#00C853" : "#FF4466",
                            }}
                          >
                            {isLong ? "LONG" : "SHORT"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-num" style={{ color: "#C8BCA8" }}>
                          {Math.abs(size)}
                        </td>
                        <td className="px-4 py-3 text-right font-num" style={{ color: "#C8BCA8" }}>
                          {fmt(pos.entryPx)}
                        </td>
                        <td className="px-4 py-3 text-right font-num" style={{ color: "#C8BCA8" }}>
                          {fmt(pos.positionValue)}
                        </td>
                        <td
                          className="px-4 py-3 text-right font-num font-medium"
                          style={{ color: pnl >= 0 ? "#00C853" : "#FF4466" }}
                        >
                          {pnl >= 0 ? "+" : ""}
                          {fmt(pos.unrealizedPnl)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
