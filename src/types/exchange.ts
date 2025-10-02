import type { BaseExchangeService } from "@/services/api";
import type { Token } from "./token";

export interface Exchange {
	name: string;
	tokens: Map<string,Token>;
	service:  BaseExchangeService;
	// Configuration de l'API
	api_key?: string;
	api_secret?: string;
	// Statut de l'exchange
	is_active: boolean;
	last_sync: Date;
	// Métriques de performance
	response_time_ms?: number;
	error_count: number;
	color?: string; // Pour l'UI
}

// Types pour les paires de trading delta neutre
export interface TradingPair {
	token: string; // Ex: "BTC"
	long_exchange: string; // Exchange où on va long
	short_exchange: string; // Exchange où on va short
	long_funding_rate: number;
	short_funding_rate: number;
	net_funding_rate: number; // long_funding_rate - short_funding_rate
	volume_score: number; // Score basé sur le volume des deux exchanges
	opportunity_score: number; // Score global de l'opportunité
	last_updated: Date;
}

// Configuration des exchanges supportés
export interface ExchangeConfig {
	name: string;
	service: BaseExchangeService;
	is_enabled: boolean;
	color: string; // Pour l'UI
}


export interface UniverseAsset {
  name: string;
  szDecimals: number;
  maxLeverage: number;
  onlyIsolated?: boolean;
  isDelisted?: boolean;
}

export interface AssetCtx {
  dayNtlVlm: string;
  funding: string;
  impactPxs: [string, string];
  markPx: string;
  midPx: string;
  openInterest: string;
  oraclePx: string;
  premium: string;
  prevDayPx: string;
}

export type HyperliquidMetaAndAssetCtxsResponse = [{ universe: UniverseAsset[] }, AssetCtx[]];

export interface MarketGreeks {
  delta: string; // e.g. "1"
  gamma: string; // e.g. "0.2"
  rho: string;   // e.g. "0.2"
  vanna: string; // e.g. "0.2"
  vega: string;  // e.g. "0.2"
  volga: string; // e.g. "0.2"
}

// Élément individuel du résumé de marché
export interface MarketSummaryItem {
  ask: string;                  // "30130.15"
  ask_iv: string;               // "0.2"
  bid: string;                  // "30112.22"
  bid_iv: string;               // "0.2"
  created_at: number;                 // 1 (unix time ms selon la doc)
  delta: string;                // "1"
  funding_rate: string;         // "0.3"
  future_funding_rate: string;  // "0.3"
  greeks: MarketGreeks;               // objet greeks
  last_iv: string;              // "0.2"
  last_traded_price: string;    // "30109.53"
  mark_iv: string;              // "0.2"
  mark_price: string;           // "29799.70877478"
  open_interest: string;        // "6100048.3"
  price_change_rate_24h: string;// "0.05"
  symbol: string;                     // "BTC-USD-PERP"
  total_volume: string;         // "141341.0424"
  underlying_price: string;     // "29876.3"
  volume_24h: string;           // "47041.0424"
}

// Réponse complète de l’API
export interface ParadexMarketResponse {
  results: MarketSummaryItem[] | null;
}


export interface ParadexMarketsStaticResponse {
  results: ParadexMarketStaticItem[] | null;
}

export interface ParadexMarketStaticItem {
  asset_kind: "PERP" | "PERP_OPTION" | null;
  base_currency: string | null;
  funding_multiplier: number | null;     // double
  funding_period_hours: number | null;   // double (heures)
  symbol: string | null;
}

export interface LighterOrderBookStat {

  symbol: string;
  last_trade_price: number;
  daily_trades_count: number;
  daily_base_token_volume: number;
  daily_quote_token_volume: number;
  daily_price_change: number;
}

export interface LighterExchangeStatsResponse {
 
  code: number;
  total: number;
  order_book_stats: LighterOrderBookStat[];
  daily_usd_volume: number;
  daily_trades_count: number;
}

// types/fundingRates.ts

export interface LighterFundingRateEntry {
  market_id: number;
  exchange: string;
  symbol: string;
  rate: number;
}

export interface LighterFundingRatesResponse {
  code: number;
  funding_rates: LighterFundingRateEntry[];
}
