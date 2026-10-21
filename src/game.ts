/** The simulation is deterministic: identical decisions produce identical outcomes. */
export type Industry = 'textiles' | 'furniture' | 'electronics';
export type Resource = 'fiber' | 'wood' | 'organics';
export type Upgrade = 'takeback' | 'repair' | 'efficient' | 'durable';
export type Status = 'playing' | 'won' | 'lost';
export interface Business {
  open: boolean;
  material: number;
  products: number;
  returns: number;
  scraps: number;
  health: number;
  upgrades: Upgrade[];
  points: number;
  circularRounds: number;
  closed: boolean;
}
export interface Contract {
  id: string;
  industry: Industry;
  kind: 'supply' | 'offtake';
  price: number;
  remaining: number;
  partner: string;
}
export interface Ledger {
  round: number;
  revenue: number;
  expenses: number;
  points: number;
  industryPoints?: Record<Industry, number>;
}
export interface Game {
  version: 1;
  round: number;
  cash: number;
  points: number;
  reputation: number;
  nature: number;
  actions: number;
  businesses: Record<Industry, Business>;
  contracts: Contract[];
  ledger: Ledger;
  history: Ledger[];
  log: { id: number; round: number; text: string }[];
  serial: number;
  status: Status;
  reason: string;
  loan: boolean;
  tutorial: boolean;
}
export const industries: Industry[] = ['textiles', 'furniture', 'electronics'];
export const definitions: Record<Industry, {
  name: string; product: string; resource: string; waste: string; partner: string;
  supplier: string; price: number; production: number; materialPrice: number;
  unlock: number; requiredPoints: number; color: string;
}> = {
  textiles: {
    name: 'Textile studio', product: 'garments', resource: 'recovered fiber',
    waste: 'textile offcuts', partner: 'EcoBuild Insulation', supplier: 'ReThread Collective',
    price: 42, production: 24, materialPrice: 28, unlock: 0, requiredPoints: 0, color: '#557a58',
  },
  furniture: {
    name: 'Furniture workshop', product: 'chairs', resource: 'reclaimed wood',
    waste: 'wood shavings', partner: 'ForestCycle Panels', supplier: 'Second Grain Salvage',
    price: 60, production: 36, materialPrice: 40, unlock: 180, requiredPoints: 25, color: '#a17448',
  },
  electronics: {
    name: 'Electronics lab', product: 'devices', resource: 'recovered components',
    waste: 'circuit offcuts', partner: 'CircuitCycle Metals', supplier: 'Second Spark Components',
    price: 48, production: 24, materialPrice: 24, unlock: 160, requiredPoints: 50, color: '#b09b44',
  },
};
export const upgrades: Record<Upgrade, { name: string; cost: number; description: string }> = {
  takeback: { name: 'Take-back network', cost: 70, description: 'Collect 2 used products after every batch sold. Enables a closed loop.' },
  repair: { name: 'Repair station', cost: 65, description: 'Turn 2 returns into 2 products for $12. Earn 8 CP per repair batch.' },
  efficient: { name: 'Efficient machinery', cost: 90, description: 'Production costs $8 less and equipment wears half as quickly.' },
  durable: { name: 'Design for longevity', cost: 85, description: 'Better products command $5 more each; repairs earn 4 extra CP.' },
};
export const events = [
  { name: 'A fresh start', description: 'Local customers are ready for a different kind of business. All markets are stable.', price: 1, supply: 1, wear: 0, icon: 'sun' },
  { name: 'Buy better, keep longer', description: 'A citywide campaign lifts demand for durable products. Sale prices rise 15%.', price: 1.15, supply: 1, wear: 0, icon: 'trend' },
  { name: 'Supply chain squeeze', description: 'A collection bottleneck raises spot material prices 35%. Existing supply contracts keep their agreed price.', price: 1, supply: 1.35, wear: 0, icon: 'truck' },
  { name: 'Repair is having a moment', description: 'Customers choose repaired goods. Product prices rise 10%. Keep your repair stations busy.', price: 1.1, supply: 1, wear: 0, icon: 'repair' },
  { name: 'A tougher trading season', description: 'Households cut spending. Product prices fall 20%, and a heatwave adds 10 equipment wear at round end.', price: .8, supply: 1, wear: 10, icon: 'cloud' },
  { name: 'The local economy rallies', description: 'New procurement rules favor circular businesses. Product prices rise 20%.', price: 1.2, supply: 1, wear: 0, icon: 'trend' },
  { name: 'Contaminated collections', description: 'Sorting costs rise. Spot materials cost 25% more; supply contracts shield your business.', price: 1, supply: 1.25, wear: 0, icon: 'truck' },
  { name: 'Neighborhood exchange', description: 'Businesses share collection routes. Spot materials cost 20% less this round.', price: 1, supply: .8, wear: 0, icon: 'sun' },
  { name: 'Machines need care', description: 'An unusually busy season adds 15 equipment wear at round end. Budget for maintenance.', price: 1.1, supply: 1, wear: 15, icon: 'repair' },
  { name: 'A cautious market', description: 'Product prices fall 10%. Strong partnerships and efficient operations protect your margins.', price: .9, supply: 1, wear: 0, icon: 'cloud' },
  { name: 'Circular city festival', description: 'The city celebrates resourceful businesses. Product prices rise 25%.', price: 1.25, supply: 1, wear: 0, icon: 'trend' },
  { name: 'Make it last', description: 'Your final round. Leave the network profitable, healthy, and ready for the future.', price: 1.1, supply: 1, wear: 0, icon: 'sun' },
];
export function freshGame(): Game {
  const business = (open: boolean): Business => ({ open, material: open ? 8 : 0, products: 0, returns: 0, scraps: 0, health: 100, upgrades: [], points: 0, circularRounds: 0, closed: false });
  return {
    version: 1, round: 1, cash: 650, points: 0, reputation: 50, nature: 0, actions: 12,
    businesses: { textiles: business(true), furniture: business(false), electronics: business(false) },
    contracts: [], ledger: { round: 1, revenue: 0, expenses: 0, points: 0 }, history: [],
    log: [{ id: 0, round: 1, text: 'Welcome to Green Stitch. Your first 8 fiber units are ready to use.' }],
    serial: 1, status: 'playing', reason: '', loan: false, tutorial: true,
  };
}
export type Action =
  | { type: 'buy' | 'produce' | 'sell' | 'repair' | 'recycle' | 'trade' | 'maintain' | 'unlock'; industry: Industry }
  | { type: 'upgrade'; industry: Industry; upgrade: Upgrade }
  | { type: 'contract'; industry: Industry; kind: 'supply' | 'offtake'; price: number }
  | { type: 'next' }
  | { type: 'loan' }
  | { type: 'regenerate' }
  | { type: 'dismissTutorial' };
export function currentEvent(s: Game) { return events[s.round - 1]; }
export function productPrice(s: Game, i: Industry) {
  return Math.round((definitions[i].price + (s.businesses[i].upgrades.includes('durable') ? 5 : 0)) * currentEvent(s).price);
}
export function materialPrice(s: Game, i: Industry) {
  return s.contracts.find(c => c.industry === i && c.kind === 'supply')?.price ?? Math.round(definitions[i].materialPrice * currentEvent(s).supply);
}
export function wastePrice(s: Game, i: Industry) {
  return s.contracts.find(c => c.industry === i && c.kind === 'offtake')?.price ?? 16;
}
export function closedCount(s: Game) { return industries.filter(i => s.businesses[i].closed).length; }
export function objectives(s: Game) {
  return [
    { name: 'Earn 150 circularity points', value: s.points, target: 150, done: s.points >= 150 },
    { name: 'Build 2 stable circular loops', value: closedCount(s), target: 2, done: closedCount(s) >= 2 },
    { name: 'Keep $900 in capital', value: s.cash, target: 900, done: s.cash >= 900 },
    { name: 'Restore 3 community gardens', value: s.nature, target: 3, done: s.nature >= 3 },
  ];
}
export function applyAction(state: Game, action: Action): Game {
  const s: Game = structuredClone(state);
  const log = (text: string) => {
    s.log.unshift({ id: s.serial++, round: s.round, text });
    s.log = s.log.slice(0, 60);
    return s;
  };
  if (action.type === 'dismissTutorial') { s.tutorial = false; return s; }
  if (s.status !== 'playing') return s;
  const spend = (cost: number) => { s.cash -= cost; s.ledger.expenses += cost; };
  const earn = (amount: number) => { s.cash += amount; s.ledger.revenue += amount; };
  const score = (amount: number, i?: Industry) => {
    s.points += amount; s.ledger.points += amount;
    if (i) s.businesses[i].points += amount;
  };
  if (action.type === 'next') {
    const open = industries.filter(i => s.businesses[i].open);
    const overhead = open.length * 18;
    spend(overhead);
    for (const i of open) {
      const b = s.businesses[i];
      b.health = Math.max(0, b.health - 5 - currentEvent(s).wear);
      const prior = state.businesses[i].points;
      // A loop needs new productive recovery in each qualifying round.
      const priorTotal = s.history.length ? getPriorPoints(s, i) : 0;
      if (b.upgrades.includes('takeback') && b.upgrades.includes('repair') && prior > priorTotal && b.health >= 25 && s.ledger.revenue > s.ledger.expenses) {
        b.circularRounds++;
      } else { b.circularRounds = 0; }
      b.closed = b.circularRounds >= 2;
    }
    const summary = `Round ${s.round}: $${s.ledger.revenue} revenue, $${s.ledger.expenses} costs (including $${overhead} overhead), ${s.ledger.points} CP earned.`;
    s.history.push({ ...s.ledger, industryPoints: { textiles: s.businesses.textiles.points, furniture: s.businesses.furniture.points, electronics: s.businesses.electronics.points } });
    s.contracts = s.contracts.map(c => ({ ...c, remaining: c.remaining - 1 })).filter(c => c.remaining > 0);
    if (s.cash < 0) {
      s.status = 'lost'; s.reason = 'Operating costs exceeded your cash reserve. Your business entered insolvency.';
    } else if (s.round === 12) {
      s.status = objectives(s).every(o => o.done) ? 'won' : 'lost';
      s.reason = s.status === 'won' ? 'You built a profitable, resilient circular business network.' : 'Your campaign has ended. Review your goals and try a different business strategy.';
    } else {
      s.round++; s.actions = 12 + (open.length - 1) * 3;
      s.ledger = { round: s.round, revenue: 0, expenses: 0, points: 0 };
    }
    return log(summary);
  }
  if (action.type === 'loan') {
    if (s.loan) return log('The one-time emergency grant has already been used.');
    s.loan = true; s.cash += 180; s.reputation = Math.max(0, s.reputation - 15);
    return log('Received a one-time $180 resilience grant. Reputation fell 15 points. The grant is financing, not trading revenue.');
  }
  if (s.actions < 1) return log('No actions left this round. Review your accounts and finish the round.');
  if (action.type === 'regenerate') {
    if (s.cash < 35) return log('Community garden restoration costs $35.');
    spend(35); s.nature++; score(5); s.actions--; s.reputation = Math.min(100, s.reputation + 3);
    return log('Restored a community garden with verified compost and native planting. +5 CP, +3 reputation.');
  }
  const i = action.industry;
  const b = s.businesses[i];
  const d = definitions[i];
  if (action.type === 'unlock') {
    if (b.open) return log('This industry is already open.');
    const requiredLoops = i === 'furniture' ? 1 : 2;
    if (closedCount(s) < requiredLoops) return log(`Close ${requiredLoops} stable loops before opening ${d.name}.`);
    if (s.cash < d.unlock || s.points < d.requiredPoints) return log(`Opening ${d.name} needs $${d.unlock} and ${d.requiredPoints} CP.`);
    spend(d.unlock); b.open = true; b.material = 8; s.actions--;
    return log(`${d.name} opened with 8 starter material units. New partnerships are available.`);
  }
  if (!b.open) return log('Open this industry first.');
  if (action.type === 'upgrade') {
    const u = upgrades[action.upgrade];
    if (b.upgrades.includes(action.upgrade)) return log('This upgrade is already installed.');
    if (s.cash < u.cost) return log(`You need $${u.cost} for ${u.name}.`);
    spend(u.cost); b.upgrades.push(action.upgrade); s.actions--;
    return log(`${d.name}: ${u.name} installed. ${u.description}`);
  }
  if (action.type === 'contract') {
    if (s.contracts.some(c => c.industry === i && c.kind === action.kind)) return log('An agreement of this type is already active for this industry.');
    const min = action.kind === 'supply' ? d.materialPrice - Math.floor(s.reputation / 15) : 12;
    const max = action.kind === 'supply' ? d.materialPrice + 10 : 17 + Math.floor(s.reputation / 20);
    if (!Number.isFinite(action.price) || !Number.isInteger(action.price) || action.price < 1) return log('Choose a valid whole-dollar price.');
    s.actions--;
    if (action.price < min || action.price > max) {
      s.reputation = Math.max(0, s.reputation - 2);
      return log(`Offer declined. ${action.price < min ? 'Your offer is below the partner’s accepted range.' : 'Your offer is above the partner’s accepted range.'} One negotiation action used; reputation −2.`);
    }
    const partner = action.kind === 'supply' ? d.supplier : d.partner;
    s.contracts.push({ id: `${i}-${action.kind}`, industry: i, kind: action.kind, price: action.price, remaining: 3, partner });
    s.reputation = Math.min(100, s.reputation + 5);
    return log(`${partner} accepted $${action.price} per ${action.kind === 'supply' ? '4 material units' : '2 scrap units'} for 3 rounds. +5 reputation. Contracts lock prices; batches are traded manually.`);
  }
  let cost = 0;
  switch (action.type) {
    case 'buy': cost = materialPrice(s, i); break;
    case 'produce':
      if (b.material < 4 || b.health < 25) return log('Production needs 4 material units and at least 25% equipment health.');
      cost = d.production - (b.upgrades.includes('efficient') ? 8 : 0); break;
    case 'sell': if (b.products < 4) return log('A customer order needs 4 finished products.'); break;
    case 'repair':
      if (!b.upgrades.includes('repair') || b.returns < 2 || b.health < 25) return log('Repair needs a repair station, 2 returned products, and at least 25% equipment health.');
      cost = 12; break;
    case 'recycle': if (b.returns < 2) return log('Material recovery needs 2 returned products.'); cost = 8; break;
    case 'trade': if (b.scraps < 2) return log('This buyer needs 2 units of production scraps.'); break;
    case 'maintain': if (b.health === 100) return log('Equipment is already in perfect condition.'); cost = 25; break;
  }
  if (s.cash < cost) return log(`This operation needs $${cost}. Trade inventory or use your emergency grant.`);
  spend(cost); s.actions--;
  switch (action.type) {
    case 'buy': b.material += 4; return log(`Purchased 4 ${d.resource} units for $${cost}.`);
    case 'produce': b.material -= 4; b.products += 4; b.scraps += 2; b.health -= b.upgrades.includes('efficient') ? 4 : 8;
      return log(`Produced 4 ${d.product} for $${cost}. Collected 2 scrap units for another business.`);
    case 'sell': {
      const revenue = productPrice(s, i) * 4; b.products -= 4; earn(revenue);
      if (b.upgrades.includes('takeback')) b.returns += 2;
      return log(`Sold 4 ${d.product} for $${revenue}.${b.upgrades.includes('takeback') ? ' Collected 2 used products from the previous customer cycle.' : ' Add take-back to recover used products.'}`);
    }
    case 'repair': {
      const cp = b.upgrades.includes('durable') ? 12 : 8;
      b.returns -= 2; b.products += 2; b.health -= b.upgrades.includes('efficient') ? 2 : 4; score(cp, i);
      return log(`Repaired 2 ${d.product} for $12. +${cp} CP for extending product life.`);
    }
    case 'recycle': b.returns -= 2; b.material += 2; score(3, i);
      return log('Recovered 2 material units for $8. +3 CP. Repair retains more value and earns more points.');
    case 'trade': b.scraps -= 2; earn(wastePrice(s, i)); score(4, i);
      s.reputation = Math.min(100, s.reputation + 1);
      return log(`${d.partner} reused 2 ${d.waste} units. Earned $${wastePrice(s, i)} and 4 CP.`);
    case 'maintain': b.health = Math.min(100, b.health + 45);
      return log(`${d.name} serviced for $25. Equipment health is now ${b.health}%.`);
  }
}
function getPriorPoints(s: Game, i: Industry): number {
  const last = s.history.at(-1);
  return last?.industryPoints?.[i] ?? 0;
}
export function restoreGame(raw: string | null): Game | null {
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as Game;
    if (s.version !== 1 || !Number.isInteger(s.round) || s.round < 1 || s.round > 12 ||
      !['playing', 'won', 'lost'].includes(s.status) || !Number.isFinite(s.cash) ||
      !Number.isFinite(s.points) || !Number.isFinite(s.actions) || !Number.isFinite(s.nature) ||
      !Array.isArray(s.history) || !Array.isArray(s.log) || !Array.isArray(s.contracts) ||
      !s.ledger || !Number.isFinite(s.ledger.expenses) || !Number.isFinite(s.ledger.revenue) ||
      !industries.every(i => s.businesses?.[i] && Array.isArray(s.businesses[i].upgrades) &&
        ['material', 'products', 'returns', 'scraps', 'health', 'points', 'circularRounds'].every(k =>
          Number.isFinite((s.businesses[i] as unknown as Record<string, unknown>)[k])))) return null;
    return s;
  } catch { return null; }
}
