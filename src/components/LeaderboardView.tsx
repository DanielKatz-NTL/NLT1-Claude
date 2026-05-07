"use client";

import useSWR from "swr";

interface LeaderboardEntry {
  rank: number;
  trader: string;
  volume: string;
  pnl: string;
  winRate: string;
  pnlPositive: boolean;
}

const PLACEHOLDER_ENTRIES: LeaderboardEntry[] = [
  { rank: 1, trader: "0x1a2b...3c4d", volume: "$42.7M", pnl: "+$1.24M", winRate: "71%", pnlPositive: true },
  { rank: 2, trader: "0x9f8e...7d6c", volume: "$38.1M", pnl: "+$980K", winRate: "68%", pnlPositive: true },
  { rank: 3, trader: "0x3b4c...5d6e", volume: "$29.4M", pnl: "+$670K", winRate: "65%", pnlPositive: true },
  { rank: 4, trader: "0xab12...cd34", volume: "$24.8M", pnl: "+$510K", winRate: "63%", pnlPositive: true },
  { rank: 5, trader: "0x7e8f...9a0b", volume: "$19.2M", pnl: "+$340K", winRate: "67%", pnlPositive: true },
  { rank: 6, trader: "0x4d5e...6f7a", volume: "$15.6M", pnl: "+$220K", winRate: "61%", pnlPositive: true },
  { rank: 7, trader: "0xfe12...3456", volume: "$12.4M", pnl: "+$180K", winRate: "58%", pnlPositive: true },
  { rank: 8, trader: "0x2c3d...4e5f", volume: "$9.8M",  pnl: "-$42K",  winRate: "49%", pnlPositive: false },
  { rank: 9, trader: "0x6a7b...8c9d", volume: "$7.3M",  pnl: "+$95K",  winRate: "55%", pnlPositive: true },
  { rank: 10, trader: "0xd1e2...f3a4", volume: "$5.1M",  pnl: "-$18K",  winRate: "46%", pnlPositive: false },
];

const fetcher = (url: string, body: object) =>
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json());

export default function LeaderboardView() {
  const { data, error } = useSWR(
    "leaderboard",
    () => fetcher("https://api.hyperliquid.xyz/info", { type: "leaderboard" }),
    { revalidateOnFocus: false }
  );

  // Use real data if available, else placeholder
  const hasRealData =
    !error &&
    data &&
    Array.isArray(data) &&
    data.length > 0;

  const entries: LeaderboardEntry[] = hasRealData
    ? (data as Array<{ address?: string; vlm?: number; pnl?: number; winRate?: number }>).slice(0, 10).map((row, i) => {
        const pnlNum = row.pnl ?? 0;
        return {
          rank: i + 1,
          trader: row.address ? row.address.slice(0, 6) + "..." + row.address.slice(-4) : `0x????...????`,
          volume: row.vlm != null ? `$${(row.vlm / 1_000_000).toFixed(1)}M` : "—",
          pnl: pnlNum >= 0 ? `+$${(pnlNum / 1000).toFixed(0)}K` : `-$${(Math.abs(pnlNum) / 1000).toFixed(0)}K`,
          winRate: row.winRate != null ? `${(row.winRate * 100).toFixed(0)}%` : "—",
          pnlPositive: pnlNum >= 0,
        };
      })
    : PLACEHOLDER_ENTRIES;

  return (
    <div className="flex flex-col flex-1 overflow-auto p-6" style={{ background: "#0A0A0A" }}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#F0EBE0" }}>
          Leaderboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "#C8BCA8" }}>
          Top traders in the last 30 days
          {!hasRealData && (
            <span className="ml-2 text-xs px-2 py-0.5 rounded" style={{ background: "#1E1E1E", color: "#8C8278" }}>
              Demo data
            </span>
          )}
        </p>
      </div>

      {/* Table */}
      <div className="rounded-lg overflow-hidden border" style={{ borderColor: "#2A2A2A" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#141414", borderBottom: "1px solid #2A2A2A" }}>
              <th className="text-left px-4 py-3 font-medium" style={{ color: "#8C8278" }}>Rank</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: "#8C8278" }}>Trader</th>
              <th className="text-right px-4 py-3 font-medium" style={{ color: "#8C8278" }}>Volume (30d)</th>
              <th className="text-right px-4 py-3 font-medium" style={{ color: "#8C8278" }}>PnL (30d)</th>
              <th className="text-right px-4 py-3 font-medium" style={{ color: "#8C8278" }}>Win Rate</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, idx) => (
              <tr
                key={entry.rank}
                style={{
                  background: idx % 2 === 0 ? "#0A0A0A" : "#0F0F0F",
                  borderBottom: "1px solid #1E1E1E",
                }}
              >
                <td className="px-4 py-3 font-num">
                  {entry.rank <= 3 ? (
                    <span
                      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                      style={{
                        background:
                          entry.rank === 1 ? "#D4A017" :
                          entry.rank === 2 ? "#8C8278" :
                          "#7C5C3A",
                        color: "#0A0A0A",
                      }}
                    >
                      {entry.rank}
                    </span>
                  ) : (
                    <span style={{ color: "#C8BCA8" }}>{entry.rank}</span>
                  )}
                </td>
                <td className="px-4 py-3 font-num" style={{ color: "#F0EBE0" }}>
                  {entry.trader}
                </td>
                <td className="px-4 py-3 text-right font-num" style={{ color: "#C8BCA8" }}>
                  {entry.volume}
                </td>
                <td
                  className="px-4 py-3 text-right font-num font-medium"
                  style={{ color: entry.pnlPositive ? "#00C853" : "#FF4466" }}
                >
                  {entry.pnl}
                </td>
                <td className="px-4 py-3 text-right font-num" style={{ color: "#C8BCA8" }}>
                  {entry.winRate}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
