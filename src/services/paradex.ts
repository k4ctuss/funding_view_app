import { BaseExchangeService } from "./api";
import type { Token } from "../types/token";
import type {ParadexMarketResponse, ParadexMarketsStaticResponse} from "../types/exchange";

export class ParadexService extends BaseExchangeService {
	name = "paradex";

	constructor() {
		super("https://api.prod.paradex.trade");
	}

	async fetchTokens(): Promise<Map<string,Token>> {
		try {
			//requete pour les infos static
			if(!this.staticMeta.has("market_static_info")){
				const staticOptions: RequestInit = {
					method: "GET",
				};
				const staticData = await this.makeRequest<ParadexMarketsStaticResponse>("/v1/markets", staticOptions);

				const market_static_info = new Map<string, {base_currency:string|null, funding_multiplier: number, funding_period_hours: number }>();
				staticData.results?.forEach((token) => { 
					if(token.asset_kind==="PERP" && (token.symbol || token.base_currency)){
						market_static_info.set(token.symbol||token.base_currency+"-USD-PERP", {base_currency: token.base_currency, funding_multiplier: token.funding_multiplier||1, funding_period_hours: token.funding_period_hours || 8});
					}
				});

				this.staticMeta.set("market_static_info", market_static_info);
			}


			// requete pour les données dynamiques
			const options: RequestInit = {
				method: "GET",
			};
			const data = await this.makeRequest<ParadexMarketResponse>("/v1/markets/summary?market=ALL", options);
			
			let tokens = new Map<string,Token>();
			const market_static_info = this.staticMeta.get("market_static_info") as Map<string, {base_currency:string|null, funding_multiplier: number, funding_period_hours: number }>;

			// Map the response to Token[]
			data.results?.filter(token=>token.symbol.endsWith("-USD-PERP")).forEach((token) => { 
				
				const newEntry: Token = {
					ticker: token.symbol.slice(0, -"-USD-PERP".length),
					price: parseFloat(token.mark_price),
					volume_24: parseFloat(token.volume_24h),
					funding_rate: parseFloat(token.funding_rate) * (market_static_info.has(token.symbol) && market_static_info.get(token.symbol)?.funding_multiplier ? market_static_info.get(token.symbol)?.funding_multiplier||1 : 1), // par défaut 1 si pas trouvé
					funding_period: market_static_info.has(token.symbol) && market_static_info.get(token.symbol)?.funding_period_hours ? market_static_info.get(token.symbol)?.funding_period_hours||8 : 8, // par défaut 8h si pas trouvé
					open_interest_USD: parseFloat(token.open_interest)*parseFloat(token.mark_price),
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