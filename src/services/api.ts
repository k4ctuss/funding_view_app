import type { Token } from '../types/token';

// Interface commune pour tous les services d'exchange
export interface ExchangeApiService {
  name: string;
  fetchTokens: () => Promise<Map<string,Token>>;
  isHealthy: () => Promise<boolean>;
}

// Service de base avec gestion d'erreurs
export abstract class BaseExchangeService implements ExchangeApiService {
  abstract name: string;
  protected baseUrl: string;
  protected apiKey?: string;
  protected apiSecret?: string;
	protected staticMeta: Map<string, unknown>;


  constructor(baseUrl: string, apiKey?: string, apiSecret?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
		this.staticMeta = new Map<string, unknown>(); // <-- NEW
  }

  abstract fetchTokens(): Promise<Map<string,Token>>;

  async isHealthy(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  protected getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    return headers;
  }

  protected async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

	// Getter pour permettre aux composants d'accéder aux données statiques
  getStaticMeta<T = unknown>(key: string): T | undefined {
    return this.staticMeta.get(key) as T | undefined;
  }

  protected setStaticMeta<T = unknown>(key: string, value: T) {
    this.staticMeta.set(key, value);
  }
}
