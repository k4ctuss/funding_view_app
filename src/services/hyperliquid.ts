import { BaseExchangeService } from "./api";
import type { Token } from "../types/token";
import type { HyperliquidMetaAndAssetCtxsResponse } from "../types/exchange";


export class HyperliquidService extends BaseExchangeService {
	name = "hyperliquid";

	constructor() {
		super("https://api.hyperliquid.xyz");
	}

	async fetchTokens(): Promise<Map<string,Token>> {
		try {
			const options: RequestInit = {
				method: "POST",
				body: JSON.stringify({ type: "metaAndAssetCtxs" }),
			};
			const data = await this.makeRequest<HyperliquidMetaAndAssetCtxsResponse>("/info", options);
			// Map the response to Token[]
			const universeAssets = data[0].universe;

			let tokens = new Map<string,Token>();
			data[1].forEach((assetCtx, index) => { 
				
				const newEntry: Token = {
					ticker: universeAssets[index].name,
					price: parseFloat(assetCtx.markPx),
					volume_24: parseFloat(assetCtx.dayNtlVlm),
					funding_rate: parseFloat(assetCtx.funding),
					funding_period: 1, // funding value is always for 1 hour on hyperliquid
					open_interest_USD: parseFloat(assetCtx.openInterest)*parseFloat(assetCtx.markPx),
					last_updated: new Date(),
				};
				tokens.set(newEntry.ticker, newEntry);
			});
			return tokens;
		} catch (error) {
			console.error(`Error fetching tokens from ${this.name}:`, error);
			return new Map<string,Token>();
		}
	}

	
}