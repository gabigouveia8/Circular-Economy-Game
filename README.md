# LoopWorks

A complete single-player circular economy strategy game. Build a profitable network of textile, furniture, and electronics businesses over a 12-round campaign. Trade with simulated partners, negotiate contracts, repair returned products, maintain equipment, and regenerate community green spaces.

## Play

Requires **Node.js 22.18+** (Node 24 recommended) and npm.

```sh
npm ci
npm run dev
```

Open the address printed by Vite in your browser. The game includes an introductory guide and saves your campaign in this browser automatically. No account, backend, API keys, or database is needed.

For a production build:

```sh
npm run build
npm run preview
```

The generated `dist/` folder can be deployed on any static web host. Do not open `index.html` directly from the filesystem; use the development or preview server.

## Your campaign

You start with **$650**, 8 recovered fiber units, and a textile studio. Every round gives you a limited number of actions. Finish all four goals by the end of round 12:

- Earn at least **150 Circularity Points (CP)**.
- Maintain **2 stable circular loops**.
- Keep at least **$900 in available capital** after final overhead.
- Restore **3 community gardens**.

The game ends in bankruptcy if you cannot pay round-end overhead. If you finish round 12 without all four goals, review your impact report and start a new campaign.

### Core actions

| Action | Inputs | Outputs |
| --- | --- | --- |
| Produce | 4 recovered material units + production cost | 4 products + 2 scrap units |
| Sell | 4 products | Sales revenue; 2 returns if take-back is installed |
| Repair | Repair station + 2 returns + $12 | 2 products + 8 CP (12 with durable design) |
| Recover | 2 returns + $8 | 2 material units + 3 CP |
| Trade byproducts | 2 scraps | Cash + 4 CP |
| Maintain | $25 | Up to 45 equipment health restored |
| Restore garden | $35 | 1 garden + 5 CP + 3 reputation |

Each operation, investment, expansion, or negotiation uses one action. A rejected negotiation also uses an action and reduces reputation. Opening another industry increases the next round's action allowance.

### Close and sustain loops

Install **take-back** and a **repair station**. To count as stable, an industry must earn new recovery points, retain at least 25% equipment health after round-end wear, and operate in a profitable business network for **two consecutive rounds**. A missed condition breaks the streak. Closing a loop is an ongoing responsibility, not a permanent badge.

One stable loop and 25 CP unlock furniture for $180. Two loops and 50 CP unlock electronics for $160. CP is an unlock threshold, not a currency deducted by expansion. Every new industry includes 8 material units and costs $18 overhead per round.

### Negotiate and adapt

Marketplace partners offer spot trades and three-round supply or byproduct contracts. Contracts lock prices but do not deliver or charge automatically. Better reputation improves your negotiating range. Market events change product prices, material prices, and equipment wear. Supply contracts shield you from spot-price increases.

A one-time $180 emergency grant is available in Impact report at a cost of 15 reputation. It does not count as operating revenue.

### First-round suggestion

Install take-back and repair. Produce and sell twice, repair twice, then sell the repaired batch. Trade the two scrap batches and maintain your equipment. This demonstrates a profitable circular round within the 12-action budget.

## Validation

```sh
npm test
npm run build
```

The test suite exercises inventory and cash accounting, insufficient resources, recovery, contract acceptance/expiration, action limits, equipment wear, loop stability, bankruptcy, save validation, and a complete winning 12-round campaign.

## Project structure

- `src/game.ts`: typed simulation, campaign rules, events, and persistence validation.
- `src/App.tsx`: interactive dashboard, marketplace, industries, reports, tutorial, and campaign outcomes.
- `src/style.css`: responsive desktop and mobile interface.
- `src/game.test.mjs`: simulation and campaign regression tests.

## Scope

This is a single-player game with simulated businesses, not live multiplayer. Returns represent previous customer product cycles; prices, production quantities, and CP are illustrative game abstractions, not lifecycle assessments. No external assets or font services are required at runtime. Browser storage can be cleared or unavailable in private browsing; the interface reports when it cannot save.
