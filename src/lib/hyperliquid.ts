const API_URL = "https://api.hyperliquid.xyz/info";

async function post<T>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Hyperliquid API error: ${res.status}`);
  return res.json();
}

// ---- Types ----

export interface AssetMeta {
  name: string;
  szDecimals: number;
  maxLeverage: number;
  onlyIsolated?: boolean;
}

export interface AssetCtx {
  dayNtlVlm: string;
  funding: string;
  impactPxs: [string, string];
  markPx: string;
  midPx: string | null;
  openInterest: string;
  oraclePx: string;
  prevDayPx: string;
  premium: string | null;
}

export interface MetaAndAssetCtxs {
  universe: AssetMeta[];
  assetCtxs: AssetCtx[];
}

export interface MarketInfo {
  name: string;
  markPx: string;
  midPx: string | null;
  prevDayPx: string;
  dayNtlVlm: string;
  openInterest: string;
  funding: string;
  szDecimals: number;
  maxLeverage: number;
  change24h: number;
}

export interface OrderLevel {
  px: string;
  sz: string;
  n: number;
}

export interface L2Book {
  coin: string;
  levels: [OrderLevel[], OrderLevel[]]; // [asks, bids]
  time: number;
}

export interface Candle {
  t: number;  // open time ms
  T: number;  // close time ms
  s: string;  // coin
  i: string;  // interval
  o: string;  // open
  c: string;  // close
  h: string;  // high
  l: string;  // low
  v: string;  // volume (coin)
  n: number;  // number of trades
}

// ---- API functions ----

export async function getMetaAndAssetCtxs(): Promise<[{ universe: AssetMeta[] }, AssetCtx[]]> {
  return post([{ type: "meta" }, { type: "metaAndAssetCtxs" }].length > 0
    ? { type: "metaAndAssetCtxs" }
    : { type: "metaAndAssetCtxs" }
  );
}

export async function getMarkets(): Promise<MarketInfo[]> {
  const data = await post<[{ universe: AssetMeta[] }, AssetCtx[]]>({ type: "metaAndAssetCtxs" });
  const [meta, ctxs] = data;
  return meta.universe.map((asset, i) => {
    const ctx = ctxs[i];
    const mark = parseFloat(ctx.markPx);
    const prev = parseFloat(ctx.prevDayPx);
    const change24h = prev > 0 ? ((mark - prev) / prev) * 100 : 0;
    return {
      name: asset.name,
      markPx: ctx.markPx,
      midPx: ctx.midPx,
      prevDayPx: ctx.prevDayPx,
      dayNtlVlm: ctx.dayNtlVlm,
      openInterest: ctx.openInterest,
      funding: ctx.funding,
      szDecimals: asset.szDecimals,
      maxLeverage: asset.maxLeverage,
      change24h,
    };
  });
}

export async function getOrderBook(coin: string): Promise<L2Book> {
  return post<L2Book>({ type: "l2Book", coin });
}

export async function getCandles(
  coin: string,
  interval: string,
  startTime: number,
  endTime: number
): Promise<Candle[]> {
  return post<Candle[]>({ type: "candleSnapshot", req: { coin, interval, startTime, endTime } });
}
