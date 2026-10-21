import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyAction as act, freshGame, objectives, restoreGame, materialPrice, wastePrice } from './game.ts';
const a = (type, extra = {}) => ({ type, industry: 'textiles', ...extra });

test('production and sales conserve inventory and account for cash', () => {
  const start = freshGame();
  const made = act(start, a('produce'));
  assert.equal(start.businesses.textiles.material, 8);
  assert.equal(made.businesses.textiles.material, 4);
  assert.equal(made.businesses.textiles.products, 4);
  assert.equal(made.businesses.textiles.scraps, 2);
  const sold = act(made, a('sell'));
  assert.equal(sold.cash, 650 - 24 + 4 * 42);
  assert.equal(sold.ledger.revenue, 168);
  assert.equal(sold.actions, 10);
});

test('invalid operations do not consume cash, inventory, actions, or award points', () => {
  const start = { ...freshGame(), cash: 0 };
  for (const type of ['buy', 'produce', 'sell', 'repair', 'trade', 'recycle', 'unlock']) {
    const after = act(start, a(type));
    assert.equal(after.cash, 0);
    assert.equal(after.actions, 12);
    assert.equal(after.points, 0);
  }
});

test('take-back and repair support reuse; a return cannot be scored twice', () => {
  let s = freshGame();
  s = act(s, a('upgrade', { upgrade: 'takeback' }));
  s = act(s, a('upgrade', { upgrade: 'repair' }));
  s = act(s, a('produce')); s = act(s, a('sell'));
  assert.equal(s.businesses.textiles.returns, 2);
  s = act(s, a('repair'));
  assert.equal(s.businesses.textiles.returns, 0);
  assert.equal(s.businesses.textiles.products, 2);
  assert.equal(s.points, 8);
  assert.equal(act(s, a('repair')).points, 8);
});

test('fair contracts lock prices, expire, and cannot be duplicated', () => {
  let s = act(freshGame(), a('contract', { kind: 'supply', price: 26 }));
  assert.equal(s.contracts.length, 1);
  assert.equal(materialPrice({ ...s, round: 3 }, 'textiles'), 26);
  assert.equal(act(s, a('contract', { kind: 'supply', price: 27 })).contracts.length, 1);
  s = act(s, { type: 'next' }); s = act(s, { type: 'next' });
  assert.equal(s.contracts[0].remaining, 1);
  s = act(s, { type: 'next' });
  assert.equal(s.contracts.length, 0);
  const rejected = act(freshGame(), a('contract', { kind: 'offtake', price: 99 }));
  assert.equal(rejected.contracts.length, 0);
  assert.equal(rejected.reputation, 48);
  assert.equal(rejected.actions, 11);
  const accepted = act(freshGame(), a('contract', { kind: 'offtake', price: 19 }));
  assert.equal(wastePrice(accepted, 'textiles'), 19);
});

test('actions are limited and renew only after overhead and wear', () => {
  const s = { ...freshGame(), actions: 0 };
  assert.equal(act(s, a('produce')).businesses.textiles.products, 0);
  const next = act(s, { type: 'next' });
  assert.equal(next.actions, 12);
  assert.equal(next.cash, 632);
  assert.equal(next.businesses.textiles.health, 95);
  assert.equal(next.history[0].expenses, 18);
});

test('maintenance and efficient production affect actual equipment wear', () => {
  let s = freshGame();
  s.businesses.textiles.health = 20;
  assert.equal(act(s, a('produce')).businesses.textiles.products, 0);
  s = act(s, a('maintain'));
  assert.equal(s.businesses.textiles.health, 65);
  s = act(s, a('upgrade', { upgrade: 'efficient' }));
  const cash = s.cash;
  s = act(s, a('produce'));
  assert.equal(s.businesses.textiles.health, 61);
  assert.equal(s.cash, cash - 16);
});

test('loop streaks require productive recovery and break without it', () => {
  let s = freshGame();
  s.businesses.textiles.upgrades = ['takeback', 'repair'];
  for (let round = 0; round < 2; round++) {
    s.businesses.textiles.returns = 2;
    s = act(s, a('repair'));
    s.ledger.revenue = 100;
    s = act(s, { type: 'next' });
  }
  assert.equal(s.businesses.textiles.closed, true);
  s.ledger.revenue = 100;
  s = act(s, { type: 'next' });
  assert.equal(s.businesses.textiles.closed, false);
  assert.equal(s.businesses.textiles.circularRounds, 0);
});

test('bankruptcy ends the campaign and further operations are blocked', () => {
  let s = { ...freshGame(), cash: 5 };
  s = act(s, { type: 'next' });
  assert.equal(s.status, 'lost');
  assert.equal(s.cash, -13);
  assert.deepEqual(act(s, a('produce')), s);
});

test('grant is one-time financing, not operating revenue', () => {
  const s = act(freshGame(), { type: 'loan' });
  assert.equal(s.cash, 830);
  assert.equal(s.ledger.revenue, 0);
  assert.equal(s.reputation, 35);
  assert.equal(act(s, { type: 'loan' }).cash, 830);
});

test('saved campaign round-trips; malformed saves are rejected', () => {
  assert.deepEqual(restoreGame(JSON.stringify(freshGame())), freshGame());
  for (const raw of ['broken', '{}', 'null', '{"version":1,"round":99}']) assert.equal(restoreGame(raw), null);
});

test('a complete twelve-round campaign is winnable with actual game actions', () => {
  let s = freshGame();
  const doAction = (type, industry = 'textiles', extra = {}) => { s = act(s, { type, industry, ...extra }); };
  for (let round = 1; round <= 12; round++) {
    if (round === 1) {
      doAction('upgrade', 'textiles', { upgrade: 'takeback' });
      doAction('upgrade', 'textiles', { upgrade: 'repair' });
    }
    if (round === 3) {
      doAction('unlock', 'furniture');
      doAction('upgrade', 'furniture', { upgrade: 'takeback' });
      doAction('upgrade', 'furniture', { upgrade: 'repair' });
    }
    if (round >= 7 && s.nature < 3) doAction('regenerate');
    let turns = 0;
    while (s.actions > 0 && turns++ < 25) {
      const available = ['textiles', ...(s.businesses.furniture.open ? ['furniture'] : [])];
      const i = available[turns % available.length];
      const b = s.businesses[i];
      if (b.health < 50) doAction('maintain', i);
      else if (b.products >= 4) doAction('sell', i);
      else if (b.returns >= 2) doAction('repair', i);
      else if (b.scraps >= 2) doAction('trade', i);
      else if (b.material >= 4) doAction('produce', i);
      else doAction('buy', i);
    }
    doAction('next');
  }
  assert.equal(s.history.length, 12);
  assert.equal(s.status, 'won');
  assert.ok(objectives(s).every(o => o.done));
  assert.deepEqual(act(s, { type: 'next' }), s);
});

test('simply waiting through the campaign does not win', () => {
  let s = freshGame();
  for (let i = 0; i < 12; i++) s = act(s, { type: 'next' });
  assert.equal(s.status, 'lost');
  assert.equal(s.points, 0);
});

test('expansion requires a stable prior loop as well as points and cash', () => {
  const s = { ...freshGame(), points: 100 };
  assert.equal(act(s, a('unlock', { industry: 'furniture' })).businesses.furniture.open, false);
  s.businesses.textiles.closed = true;
  const expanded = act(s, a('unlock', { industry: 'furniture' }));
  assert.equal(expanded.businesses.furniture.open, true);
  assert.equal(expanded.points, 100);
  assert.equal(expanded.businesses.furniture.material, 8);
  assert.equal(act(expanded, a('unlock', { industry: 'electronics' })).businesses.electronics.open, false);
});
