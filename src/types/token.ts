export interface Token {
	ticker: string;
	price: number;
	volume_24: number;
	funding_rate: number;
	funding_period: number; // en heures
	open_interest_USD: number;
	last_updated: Date;
	// Informations additionnelles pour le trading
	bid_price?: number;
	ask_price?: number;
	spread?: number;
	// Métriques de volatilité
	price_change_24h?: number;
	price_change_percentage_24h?: number;
}