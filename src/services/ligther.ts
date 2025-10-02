import { BaseExchangeService } from "./api";
import type { Token } from "../types/token";
import type { LighterExchangeStatsResponse, LighterFundingRatesResponse } from "../types/exchange";


export class LighterService extends BaseExchangeService {
	name = "Lighter";

	constructor() {
		super("https://mainnet.zklighter.elliot.ai/api/v1");
	}

	async fetchTokens(): Promise<Map<string,Token>> {
		try {
			const dataExchangeStats = await this.makeRequest<LighterExchangeStatsResponse>("/exchangeStats");
			const dataFundingRates = await this.makeRequest<LighterFundingRatesResponse>("/funding-rates");
			const cleanFundingRates = new Map<string, number>();
			dataFundingRates.funding_rates.forEach((fundingRate) => {
				if(fundingRate.exchange === "lighter"){
					cleanFundingRates.set(fundingRate.symbol, fundingRate.rate);
				}
			});
			const tokens = new Map<string,Token>();
			dataExchangeStats.order_book_stats.forEach((stat) => {
				if(stat.last_trade_price && stat.daily_base_token_volume && cleanFundingRates.has(stat.symbol)){
					tokens.set(stat.symbol, {
						ticker: stat.symbol,
						price: stat.last_trade_price,
						volume_24: stat.daily_base_token_volume,
						funding_rate: cleanFundingRates.get(stat.symbol)!,
						funding_period: 8, // lighter funding rate looks to be for 8 hours
						open_interest_USD: NaN,
						last_updated: new Date(),
					});
				}
			});
			return tokens;
		} catch (error) {
			console.error(`Error fetching tokens from ${this.name}:`, error);
			return new Map<string,Token>();
		}
	}

	
}