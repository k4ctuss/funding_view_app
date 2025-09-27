# Architecture de l'Application Funding View

## Vue d'ensemble

Cette application permet de trouver les meilleures opportunités de trading delta neutre en comparant les taux de funding entre différents exchanges (Hyperliquid, Paradex, Lighter).

## Structure du Projet

```
src/
├── components/           # Composants UI
│   ├── ui/              # Composants UI de base (shadcn/ui)
│   ├── ExchangeSelector.tsx    # Sélection des exchanges
│   └── TradingOpportunities.tsx # Affichage des opportunités
├── context/             # Contextes React
│   ├── ExchangeContext.tsx     # Gestion des exchanges
│   └── TradingContext.tsx      # Logique de trading
├── services/            # Services API
│   ├── api.ts          # Interface commune
│   ├── hyperliquid.ts  # Service Hyperliquid
│   ├── paradex.ts      # Service Paradex
│   ├── lighter.ts      # Service Lighter
│   └── index.ts        # Factory et exports
├── types/              # Types TypeScript
│   ├── exchange.ts     # Types pour les exchanges
│   └── token.ts        # Types pour les tokens
└── App.tsx             # Composant principal
```

## Architecture des Contextes

### 1. ExchangeContext

**Responsabilités :**
- Gérer les données des exchanges
- Synchroniser les données avec les APIs
- Gérer la sélection des exchanges
- Suivre l'état de santé des exchanges

**État :**
```typescript
interface ExchangeState {
  exchanges: Exchange[];
  selectedExchanges: string[];
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date | null;
}
```

**Actions principales :**
- `refreshExchangeData(exchangeName)` - Rafraîchir un exchange
- `refreshAllExchanges()` - Rafraîchir tous les exchanges
- `toggleExchangeSelection(exchangeName)` - Basculer la sélection

### 2. TradingContext

**Responsabilités :**
- Calculer les paires de trading delta neutre
- Filtrer et trier les opportunités
- Générer des recommandations de trading
- Gérer les paramètres de filtrage

**État :**
```typescript
interface TradingState {
  tradingPairs: TradingPair[];
  isLoading: boolean;
  error: string | null;
  sortBy: 'net_funding_rate' | 'opportunity_score' | 'volume_score';
  sortOrder: 'asc' | 'desc';
  minVolumeThreshold: number;
  minOpenInterestThreshold: number;
}
```

**Logique de calcul :**
1. Grouper les tokens par ticker
2. Créer des paires entre exchanges pour chaque token
3. Calculer le net funding rate (différence entre les funding rates)
4. Calculer l'opportunity score (combinaison de funding rate et volume)
5. Trier par opportunity score

## Services API

### Architecture des Services

Chaque service d'exchange implémente l'interface `ExchangeApiService` :

```typescript
interface ExchangeApiService {
  name: string;
  fetchTokens(): Promise<Token[]>;
  fetchTokenData(ticker: string): Promise<Token | null>;
  isHealthy(): Promise<boolean>;
}
```

### Services Implémentés

1. **HyperliquidService**
   - API: `https://api.hyperliquid.xyz`
   - Endpoints: `/info` (POST avec différents types)
   - Données: Prix, funding rates, open interest

2. **ParadexService**
   - API: `https://api.paradex.trade`
   - Endpoints: `/v1/tickers`, `/v1/funding-rates`, `/v1/open-interest`
   - Données: Prix, volume, funding rates, open interest

3. **LighterService**
   - API: `https://api.lighter.xyz`
   - Endpoints: `/v1/tickers`, `/v1/funding-rates`, `/v1/open-interest`
   - Données: Prix, volume, funding rates, open interest

## Types de Données

### Token
```typescript
interface Token {
  ticker: string;
  exchange: string;
  price: number;
  volume: number;
  funding_rate: number;
  open_interest: number;
  last_updated: Date;
  // Données additionnelles...
}
```

### TradingPair
```typescript
interface TradingPair {
  token: string;
  long_exchange: string;
  short_exchange: string;
  long_funding_rate: number;
  short_funding_rate: number;
  net_funding_rate: number;
  volume_score: number;
  opportunity_score: number;
  last_updated: Date;
}
```

## Flux de Données

1. **Initialisation :**
   - Les exchanges sont initialisés avec des configurations par défaut
   - Les contextes sont fournis à l'application

2. **Sélection des Exchanges :**
   - L'utilisateur sélectionne les exchanges à comparer
   - Le contexte Exchange met à jour la sélection

3. **Récupération des Données :**
   - Les services API récupèrent les données de chaque exchange
   - Les tokens sont stockés dans le contexte Exchange

4. **Calcul des Opportunités :**
   - Le contexte Trading calcule les paires de trading
   - Les opportunités sont filtrées et triées

5. **Affichage :**
   - Les composants UI affichent les opportunités
   - L'utilisateur peut filtrer et trier les résultats

## Avantages de cette Architecture

1. **Séparation des Responsabilités :**
   - Chaque contexte a une responsabilité claire
   - Les services API sont isolés et testables

2. **Extensibilité :**
   - Facile d'ajouter de nouveaux exchanges
   - Les contextes peuvent être étendus sans casser l'existant

3. **Performance :**
   - Les données sont mises en cache dans les contextes
   - Les calculs sont optimisés et memoizés

4. **Maintenabilité :**
   - Code modulaire et bien structuré
   - Types TypeScript pour la sécurité

## Prochaines Étapes

1. **Implémentation des APIs Réelles :**
   - Remplacer les données simulées par de vraies APIs
   - Gérer l'authentification et les clés API

2. **Amélioration de l'UI :**
   - Ajouter des graphiques pour visualiser les données
   - Améliorer la responsivité mobile

3. **Fonctionnalités Avancées :**
   - Alertes en temps réel
   - Historique des opportunités
   - Calcul de la rentabilité

4. **Tests :**
   - Tests unitaires pour les services
   - Tests d'intégration pour les contextes
   - Tests E2E pour l'interface utilisateur
