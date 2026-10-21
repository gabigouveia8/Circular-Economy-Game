import { useEffect, useState, type ReactNode } from 'react';
import {
  ArrowDown, ArrowRight, ArrowUpRight, BookOpen, Check, CheckCircle2,
  ChevronRight, CircleHelp, Coins, Factory, Flower2, Handshake, Leaf,
  LayoutDashboard, LockKeyhole, Menu, Package, Play, Plus, Recycle,
  RotateCcw, ShoppingBag, ShoppingCart, Sprout, TrendingUp, Trophy,
  Wrench, X, Zap, Activity, Shirt, Armchair, Cpu,
} from 'lucide-react';
import {
  applyAction, closedCount, currentEvent, definitions, freshGame, industries,
  materialPrice, objectives, productPrice, restoreGame, upgrades, wastePrice,
  type Action, type Game, type Industry, type Upgrade,
} from './game';

const SAVE_KEY = 'loopworks-campaign-v1';
type Tab = 'Dashboard' | 'Marketplace' | 'Industries' | 'Impact report';
const icons = { textiles: Shirt, furniture: Armchair, electronics: Cpu };
const money = (n: number) => `${n < 0 ? '−' : ''}$${Math.abs(n).toLocaleString()}`;
function getSaved() {
  try { return restoreGame(localStorage.getItem(SAVE_KEY)) ?? freshGame(); }
  catch { return freshGame(); }
}
function Badge({ children, muted = false }: { children: ReactNode; muted?: boolean }) {
  return <span className={`badge ${muted ? 'muted' : ''}`}>{children}</span>;
}
function Progress({ value, max }: { value: number; max: number }) {
  return <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.min(value, max)}><span style={{ width: `${Math.max(0, Math.min(100, value / max * 100))}%` }} /></div>;
}
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const items = Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"] button, [role="dialog"] input, [role="dialog"] a')).filter(e => !e.hasAttribute('disabled'));
        if (e.shiftKey && document.activeElement === items[0]) { e.preventDefault(); items.at(-1)?.focus(); }
        else if (!e.shiftKey && document.activeElement === items.at(-1)) { e.preventDefault(); items[0]?.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    document.querySelector<HTMLElement>('[role="dialog"] button')?.focus();
    return () => { document.removeEventListener('keydown', onKey); previous?.focus(); };
  }, [onClose]);
  return <div className="modal-backdrop"><section className="modal" role="dialog" aria-modal="true" aria-label={title}>
    <div className="modal-heading"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={20} /></button></div>
    {children}
  </section></div>;
}

export default function App() {
  const [game, setGame] = useState<Game>(getSaved);
  const [tab, setTab] = useState<Tab>('Dashboard');
  const [selected, setSelected] = useState<Industry>('textiles');
  const [dialog, setDialog] = useState<'help' | 'round' | 'reset' | null>(null);
  const [offer, setOffer] = useState(26);
  const [kind, setKind] = useState<'supply' | 'offtake'>('supply');
  const [saveError, setSaveError] = useState(false);
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(game)); setSaveError(false); }
    catch { setSaveError(true); }
  }, [game]);
  const run = (action: Action) => setGame(s => applyAction(s, action));
  const navigate = (next: Tab) => { setTab(next); setMobile(false); };
  const b = game.businesses[selected];
  const d = definitions[selected];
  const IndustryIcon = icons[selected];
  const profit = game.ledger.revenue - game.ledger.expenses;
  const inactive = game.status !== 'playing' || game.actions === 0;
  const openCount = industries.filter(i => game.businesses[i].open).length;
  const actionButton = (action: Action, label: string, disabled = false, secondary = false) =>
    <button className={secondary ? 'button secondary' : 'button'} disabled={inactive || disabled} onClick={() => run(action)}>{label}</button>;
  const nextGoal = !b.upgrades.includes('takeback') ? 'Install a take-back network to bring products home.'
    : !b.upgrades.includes('repair') ? 'Install a repair station, then restore your first returned products.'
    : b.returns >= 2 ? 'Repair returned products: preserve their value and earn circularity points.'
    : b.products >= 4 ? 'Sell a batch of 4 products to earn revenue and recover used products.'
    : b.material >= 4 ? 'Produce a batch, then sell it to keep your business moving.'
    : 'Buy recovered materials from a partner in the marketplace.';

  return <div className="app-shell">
    <aside className={`sidebar ${mobile ? 'mobile-open' : ''}`}>
      <a className="brand" href="#" onClick={e => { e.preventDefault(); navigate('Dashboard'); }}><span className="brand-icon"><Recycle size={27} strokeWidth={1.7} /></span><span>loopworks<span className="brand-caption">MAKE VALUE GO ROUND</span></span></a>
      <div className="workspace"><span className="workspace-avatar">GS</span><div><strong>Green Stitch Studio</strong><small>Your circular enterprise</small></div><ChevronRight size={14} /></div>
      <div className="nav-label">WORKSPACE</div>
      <nav aria-label="Main navigation">{([
        ['Dashboard', LayoutDashboard], ['Marketplace', Handshake], ['Industries', Factory], ['Impact report', Leaf],
      ] as const).map(([name, Icon]) => <button key={name} className={`nav-item ${tab === name ? 'active' : ''}`} onClick={() => navigate(name)}><Icon size={19} /><span>{name}</span>{tab === name && <span className="nav-dot" />}</button>)}</nav>
      <div className="campaign-box"><span className="eyebrow">YOUR CAMPAIGN</span><div className="campaign-title"><Sprout size={18} /><strong>A more circular city</strong></div><p>Small decisions. Lasting change.</p><Progress value={game.round - 1} max={12} /><div className="campaign-meta"><span>Round {game.round} of 12</span><span>{Math.round((game.round - 1) / 12 * 100)}%</span></div></div>
      <div className="sidebar-bottom"><button onClick={() => setDialog('help')}><CircleHelp size={17} />How to play</button><div className="profile"><span className="profile-icon">Y</span><div><strong>You, the changemaker</strong><small>Business builder</small></div><span className="online-dot" /></div></div>
    </aside>

    <div className="main-shell">
      <div className="topbar"><div><button className="icon-button mobile-menu" aria-label="Toggle navigation" onClick={() => setMobile(!mobile)}><Menu size={21} /></button><span>Workspace</span><ChevronRight size={13} /><strong>{tab}</strong></div><div><span className="save-state"><span className="online-dot" />{saveError ? 'Browser save unavailable' : 'Progress saved locally'}</span><button className="icon-button" aria-label="Game guide" onClick={() => setDialog('help')}><BookOpen size={18} /></button></div></div>
      <main>
        <header className="page-heading"><div><div className="eyebrow">BUSINESS AS UNUSUAL</div><h1>{tab === 'Dashboard' ? 'Good business. Full circle.' : tab === 'Marketplace' ? 'Better together.' : tab === 'Industries' ? 'Grow your circular world.' : 'Every loop makes a difference.'}</h1><p>{tab === 'Dashboard' ? 'Build your business. Connect the dots. Keep value in motion.' : tab === 'Marketplace' ? 'Find your next partner. Turn someone’s leftovers into your next opportunity.' : tab === 'Industries' ? 'Connect new industries and create value across your network.' : 'Track the business, the materials, and the change you’re making.'}</p></div><div className="heading-actions"><span className="round-label"><span className="online-dot" />Round {game.round}<span>/ 12</span></span><button className="button" disabled={game.status !== 'playing'} onClick={() => setDialog('round')}>Finish round <ArrowRight size={15} /></button></div></header>

        <section className="stats-grid" aria-label="Business metrics">
          {[
            { label: 'Available capital', value: money(game.cash), sub: `${money(openCount * 18)} overhead due at round end`, icon: Coins, accent: false },
            { label: 'Circularity points', value: game.points.toString(), suffix: 'CP', sub: 'Earned by keeping value in use', icon: Recycle, accent: true },
            { label: 'Round profit', value: `${profit >= 0 ? '+' : '−'}$${Math.abs(profit)}`, sub: 'Before round-end overhead', icon: TrendingUp, accent: false },
            { label: 'Circular loops', value: `${closedCount(game)}`, suffix: `/ ${openCount}`, sub: 'Healthy, profitable & connected', icon: RefreshIcon, accent: false },
          ].map(({ label, value, suffix, sub, icon: Icon, accent }) => <article className={`stat-card ${accent ? 'accent' : ''}`} key={label}><div className="stat-label">{label}<Icon size={17} /></div><div className="stat-value">{value}<span>{suffix}</span></div><small>{sub}</small></article>)}
        </section>

        <div className="event-banner"><span className="event-symbol"><Zap size={21} /></span><div><div className="event-title">{currentEvent(game).name}<span>WORLD EVENT</span></div><p>{currentEvent(game).description}</p></div><span className="event-round">ROUND {String(game.round).padStart(2, '0')}</span></div>

        {tab === 'Dashboard' && <>
          <div className="dashboard-grid">
            <div className="primary-column">
              <section className="panel system-panel"><div className="panel-heading"><div><h2>Your circular system</h2><p>A little less take–make–waste. A lot more possibility.</p></div><Badge><span className="online-dot" />{openCount} {openCount === 1 ? 'industry' : 'industries'} active</Badge></div>
                <div className="industry-tabs" role="tablist" aria-label="Select business">{industries.filter(i => game.businesses[i].open).map(i => { const Icon = icons[i]; return <button role="tab" aria-selected={selected === i} className={selected === i ? 'chosen' : ''} key={i} onClick={() => setSelected(i)}><Icon size={15} />{definitions[i].name}</button>; })}</div>
                <div className="system-intro"><div className="business-symbol"><IndustryIcon size={24} /></div><div><h3>{d.name}</h3><p>{b.closed ? 'A working loop. Keep it healthy.' : 'Build the connections that bring materials back.'}</p></div><Badge muted={!b.closed}>{b.closed ? 'Loop connected' : 'Loop in progress'}</Badge></div>
                <div className="material-flow">
                  {[
                    { name: 'Materials', count: b.material, icon: Package, caption: d.resource },
                    { name: 'Products', count: b.products, icon: IndustryIcon, caption: d.product },
                    { name: 'Returns', count: b.returns, icon: RotateCcw, caption: b.upgrades.includes('takeback') ? 'Take-back connected' : 'Take-back not installed' },
                    { name: 'Byproducts', count: b.scraps, icon: Recycle, caption: d.waste },
                  ].map(({ name, count, icon: Icon, caption }, idx) => <div className="flow-piece" key={name}><div className={`flow-node node-${idx}`}><Icon size={22} /><strong>{count}<small>units</small></strong><b>{name}</b><span>{caption}</span></div>{idx < 3 && <ArrowRight size={16} className="flow-arrow" />}</div>)}
                </div>
                <div className="return-path"><span>↳</span><div /><Recycle size={13} /><span>{b.upgrades.includes('repair') ? 'Repair & recover → back into use' : 'Connect repair to close the loop'}</span><div /><span>↵</span></div>
                <div className="system-footer"><span><span className={`online-dot ${b.health < 25 ? 'danger-dot' : ''}`} />Equipment health <b>{b.health}%</b></span><div className="mini-health"><Progress value={b.health} max={100} /></div><button onClick={() => run({ type: 'maintain', industry: selected })} disabled={inactive || b.health === 100 || game.cash < 25}><Wrench size={13} />Service · $25</button></div>
              </section>
              <section className="panel operations-panel"><div className="panel-heading"><div><h2>Make your next move</h2><p>{nextGoal}</p></div><Badge muted><Zap size={12} />{game.actions} actions left</Badge></div>
                <div className="operation-grid">
                  <Operation icon={<Factory size={19} />} title="Produce a batch" detail={`4 materials → 4 ${d.product} + 2 scraps`} cost={`$${d.production - (b.upgrades.includes('efficient') ? 8 : 0)}`} disabled={inactive || b.material < 4 || b.health < 25 || game.cash < d.production - (b.upgrades.includes('efficient') ? 8 : 0)} onClick={() => run({ type: 'produce', industry: selected })} />
                  <Operation icon={<ShoppingBag size={19} />} title="Fill customer order" detail={`Sell 4 ${d.product}${b.upgrades.includes('takeback') ? ' · collect 2 returns' : ''}`} cost={`+$${productPrice(game, selected) * 4}`} disabled={inactive || b.products < 4} onClick={() => run({ type: 'sell', industry: selected })} />
                  <Operation icon={<Wrench size={19} />} title="Repair & reuse" detail={`2 returns → 2 products · +${b.upgrades.includes('durable') ? 12 : 8} CP`} cost="$12" disabled={inactive || !b.upgrades.includes('repair') || b.returns < 2 || b.health < 25 || game.cash < 12} onClick={() => run({ type: 'repair', industry: selected })} />
                  <Operation icon={<Recycle size={19} />} title="Recover materials" detail="2 returns → 2 materials · +3 CP" cost="$8" disabled={inactive || b.returns < 2 || game.cash < 8} onClick={() => run({ type: 'recycle', industry: selected })} />
                </div>
                <div className="operation-note"><CircleHelp size={13} />Every operation uses 1 action. Repair preserves more value than recycling.</div>
              </section>
              <section className="panel upgrades-panel"><div className="panel-heading"><div><h2>Invest in what comes next</h2><p>Better design. Stronger loops. A more resilient business.</p></div><Wrench size={18} className="soft-icon" /></div><div className="upgrade-grid">{(Object.keys(upgrades) as Upgrade[]).map(u => <article className={`upgrade ${b.upgrades.includes(u) ? 'installed' : ''}`} key={u}><div className="upgrade-title"><h3>{upgrades[u].name}</h3>{b.upgrades.includes(u) ? <CheckCircle2 size={17} /> : <Plus size={17} />}</div><p>{upgrades[u].description}</p>{actionButton({ type: 'upgrade', industry: selected, upgrade: u }, b.upgrades.includes(u) ? 'Installed' : `Install · $${upgrades[u].cost}`, b.upgrades.includes(u) || game.cash < upgrades[u].cost, true)}</article>)}</div></section>
            </div>
            <div className="secondary-column">
              <section className="mission-card"><div className="mission-top"><span className="eyebrow">THE BIGGER PICTURE</span><Sprout size={24} /></div><h2>A business that<br />comes full circle.</h2><p>Reach all four goals by the end of round 12. Grow thoughtfully, and keep your loops alive.</p><div className="mission-goals">{objectives(game).map(o => <div key={o.name}><div className="goal-title">{o.done ? <CheckCircle2 size={14} /> : <span className="goal-circle" />}<span>{o.name}</span></div><Progress value={o.value} max={o.target} /><small>{o.value.toLocaleString()} / {o.target.toLocaleString()}</small></div>)}</div><button onClick={() => navigate('Impact report')}>See your impact <ArrowUpRight size={15} /></button></section>
              <section className="panel partner-card"><div className="panel-heading"><h2>Opportunity knocks</h2><Handshake size={18} /></div><span className="partner-avatar">{d.partner.split(' ').map(w => w[0]).join('').slice(0, 2)}</span><h3>{d.partner}</h3><p>“Your {d.waste} could be our next raw material.”</p><div className="partner-price"><span>Buying 2 scrap units</span><b>{money(wastePrice(game, selected))}</b></div>{actionButton({ type: 'trade', industry: selected }, 'Trade byproducts · +4 CP', b.scraps < 2)}<button className="text-link" onClick={() => navigate('Marketplace')}>Meet your next partner <ArrowRight size={14} /></button></section>
              <section className="panel garden-card"><div className="garden-icon"><Flower2 size={26} /></div><h3>Give something back.</h3><p>Fund compost, native planting, and a community garden. Restore nature alongside your business.</p>{actionButton({ type: 'regenerate' }, 'Restore a garden · $35', game.cash < 35, true)}<small>{game.nature} gardens restored · +5 CP each</small></section>
            </div>
          </div>
          <section className="panel activity-panel"><div className="panel-heading"><h2>Recently in your business</h2><Activity size={17} /></div>{game.log.slice(0, 4).map(l => <div className="activity-row" key={l.id}><span className="activity-dot" /><p>{l.text}</p><small>R{l.round}</small></div>)}</section>
        </>}

        {tab === 'Marketplace' && <>
          <section className="panel"><div className="panel-heading"><div><h2>A network, not a supply chain.</h2><p>Spot trades are always available. Negotiate 3-round contracts to lock better prices.</p></div><Badge><Handshake size={13} />Reputation {game.reputation}/100</Badge></div><div className="industry-tabs">{industries.filter(i => game.businesses[i].open).map(i => <button className={selected === i ? 'chosen' : ''} key={i} onClick={() => { setSelected(i); setOffer(definitions[i].materialPrice - 2); }}>{definitions[i].name}</button>)}</div>
            <div className="market-grid"><article className="market-card"><div className="market-icon"><Package size={28} /></div><Badge muted>RECOVERED MATERIALS</Badge><h3>{d.supplier}</h3><p>Sorted {d.resource}, ready for another productive life.</p><div className="market-price">{money(materialPrice(game, selected))}<span> / 4 units</span></div><div className="market-stock">Your stock <b>{b.material} units</b></div>{actionButton({ type: 'buy', industry: selected }, 'Buy material batch', game.cash < materialPrice(game, selected))}</article>
            <article className="market-card"><div className="market-icon warm"><Recycle size={28} /></div><Badge muted>BYPRODUCT BUYER</Badge><h3>{d.partner}</h3><p>Your {d.waste} become valuable inputs for a different business.</p><div className="market-price">{money(wastePrice(game, selected))}<span> / 2 scrap units</span></div><div className="market-stock">Your scraps <b>{b.scraps} units</b></div>{actionButton({ type: 'trade', industry: selected }, 'Sell byproduct batch · +4 CP', b.scraps < 2)}</article></div>
          </section>
          <div className="two-column"><section className="panel negotiation-panel"><div className="panel-heading"><div><h2>Make a deal</h2><p>One action per offer. Trust gives you room to negotiate.</p></div><Handshake size={21} /></div><div className="segmented"><button className={kind === 'supply' ? 'chosen' : ''} onClick={() => { setKind('supply'); setOffer(d.materialPrice - 2); }}>Supply contract</button><button className={kind === 'offtake' ? 'chosen' : ''} onClick={() => { setKind('offtake'); setOffer(18); }}>Byproduct contract</button></div><p>{kind === 'supply' ? `Offer ${d.supplier} a price per 4 material units. Higher prices are easier to accept.` : `Offer ${d.partner} a price per 2 scrap units. Lower prices are easier to accept.`}</p><label className="offer-label">Your offer per batch<div><span>$</span><input aria-label="Contract offer price" type="number" min={1} max={200} value={offer} onChange={e => setOffer(Number(e.target.value))} /></div></label><div className="negotiation-hint">Partner’s likely range: {kind === 'supply' ? `$${d.materialPrice - Math.floor(game.reputation / 15)}–$${d.materialPrice + 10}` : `$12–$${17 + Math.floor(game.reputation / 20)}`}. Rejected offers cost 2 reputation.</div>{actionButton({ type: 'contract', industry: selected, kind, price: offer }, 'Propose 3-round agreement', game.contracts.some(c => c.industry === selected && c.kind === kind))}<p className="fine-print">No automatic deliveries or fees. Contracts fix batch prices for this round and the next two; you choose when to trade.</p></section>
          <section className="panel"><div className="panel-heading"><h2>Your active partnerships</h2><Badge muted>{game.contracts.length}</Badge></div>{game.contracts.length === 0 ? <div className="empty-state"><Handshake size={35} /><h3>Great businesses have good neighbors.</h3><p>Your first agreement starts with a conversation. Propose a fair offer to build trust.</p></div> : game.contracts.map(c => <div className="contract-row" key={c.id}><span className="contract-check"><Check size={17} /></span><div><h3>{c.partner}</h3><p>{definitions[c.industry].name} · {c.kind === 'supply' ? 'Supply' : 'Byproducts'}</p><small>{c.remaining} rounds remaining</small></div><b>{money(c.price)}<small>/ batch</small></b></div>)}</section></div>
        </>}

        {tab === 'Industries' && <><section className="panel"><div className="panel-heading"><div><h2>Different industries. Shared possibilities.</h2><p>Every workshop opens with 8 material units. Running costs: $18 per industry per round.</p></div><Badge>{openCount} of 3 unlocked</Badge></div><div className="industries-grid">{industries.map(i => { const def = definitions[i]; const biz = game.businesses[i]; const Icon = icons[i]; return <article className={`industry-card ${!biz.open ? 'locked' : ''}`} key={i}><div className={`industry-art art-${i}`}><Icon size={66} strokeWidth={1} /><span>{i === 'textiles' ? '01' : i === 'furniture' ? '02' : '03'}</span><Badge>{biz.open ? 'ACTIVE INDUSTRY' : 'NEXT OPPORTUNITY'}</Badge></div><div className="industry-card-body"><h3>{def.name}</h3><p>{i === 'textiles' ? 'Give fabric a second life. Design, repair, and recover clothing.' : i === 'furniture' ? 'Craft lasting furniture from reclaimed timber. Repair before replacing.' : 'Restore used devices. Recover valuable components and keep electronics in use.'}</p><div className="industry-facts"><span>Product price <b>{money(productPrice(game, i))} / unit</b></span><span>Production <b>{money(def.production)} / batch</b></span><span>Loop status <b>{biz.closed ? 'Connected' : biz.open ? `${biz.circularRounds}/2 rounds` : 'Not started'}</b></span></div>{biz.open ? <button className="button secondary" onClick={() => { setSelected(i); navigate('Dashboard'); }}>Manage business <ArrowRight size={14} /></button> : actionButton({ type: 'unlock', industry: i }, `Open · $${def.unlock} + ${def.requiredPoints} CP`, game.cash < def.unlock || game.points < def.requiredPoints || closedCount(game) < (i === 'furniture' ? 1 : 2))}{!biz.open && <small className="unlock-note"><LockKeyhole size={11} />Needs {i === 'furniture' ? 1 : 2} stable loops · CP is not spent</small>}</div></article>; })}</div></section><section className="principle-banner"><Recycle size={34} /><div><h2>Closing a loop is a beginning.</h2><p>A stable loop needs take-back, repair, new circularity points, healthy equipment, and a profitable network for two consecutive rounds. Miss a condition and you’ll need to rebuild its streak.</p></div></section></>}

        {tab === 'Impact report' && <><div className="two-column"><section className="panel"><div className="panel-heading"><h2>Your campaign goals</h2><Trophy size={20} /></div>{objectives(game).map(o => <div className="report-goal" key={o.name}><div><span>{o.done ? <CheckCircle2 size={17} /> : <Leaf size={17} />}{o.name}</span><b>{o.value} / {o.target}</b></div><Progress value={o.value} max={o.target} /></div>)}<p className="fine-print">All four goals are checked after round 12 overhead and equipment wear. A loop must still be healthy at the finish.</p></section><section className="panel"><div className="panel-heading"><h2>Business health</h2><TrendingUp size={20} /></div><div className="finance-row"><span>This round’s revenue</span><b>{money(game.ledger.revenue)}</b></div><div className="finance-row"><span>This round’s costs so far</span><b>{money(game.ledger.expenses)}</b></div><div className="finance-row"><span>Upcoming overhead</span><b>{money(openCount * 18)}</b></div><div className="finance-row total"><span>Projected round profit</span><b>{money(profit - openCount * 18)}</b></div><div className="finance-row"><span>Partner reputation</span><b>{game.reputation}/100</b></div><div className="finance-row"><span>Emergency grant</span><button className="button secondary small" disabled={game.loan || game.status !== 'playing'} onClick={() => run({ type: 'loan' })}>{game.loan ? 'Already used' : 'Claim $180 · −15 reputation'}</button></div><p className="fine-print">One grant per campaign. Does not count toward round trading profit.</p></section></div>
          <section className="panel history-panel"><div className="panel-heading"><div><h2>Your business over time</h2><p>Profit after operating costs, upgrades, and overhead.</p></div></div>{game.history.length === 0 ? <div className="empty-state"><TrendingUp size={30} /><p>Finish your first round to see your financial history.</p></div> : <><div className="chart" aria-label="Profit by round">{game.history.map(h => { const p = h.revenue - h.expenses; return <div className="chart-column" key={h.round}><span>{money(p)}</span><div className={`chart-bar ${p < 0 ? 'negative' : ''}`} style={{ height: `${Math.max(5, Math.min(150, Math.abs(p) / 4))}px` }} /><small>R{h.round}</small></div>; })}</div><div className="table-scroll"><table><thead><tr><th>Round</th><th>Revenue</th><th>Costs</th><th>Net profit</th><th>Circularity</th></tr></thead><tbody>{game.history.map(h => <tr key={h.round}><td>{h.round}</td><td>{money(h.revenue)}</td><td>{money(h.expenses)}</td><td className={h.revenue >= h.expenses ? 'positive' : 'negative-text'}>{money(h.revenue - h.expenses)}</td><td>+{h.points} CP</td></tr>)}</tbody></table></div></>}</section>
          <section className="panel"><div className="panel-heading"><h2>Full activity ledger</h2></div>{game.log.map(l => <div className="activity-row" key={l.id}><span className="activity-dot" /><p>{l.text}</p><small>R{l.round}</small></div>)}</section>
        </>}
        <footer><span><Leaf size={13} />A little more circular. A little more possible.</span><div><button onClick={() => setDialog('help')}>Game guide</button><span>·</span><button onClick={() => setDialog('reset')}>New campaign</button></div></footer>
      </main>
      <div className="game-status" role="status" aria-live="polite"><span className="status-icon"><Activity size={16} /></span><span key={game.serial}>{game.log[0]?.text}</span><span className="status-actions"><Zap size={13} />{game.actions} actions</span></div>
    </div>

    {(game.tutorial || dialog === 'help') && <Modal title="Welcome to LoopWorks" onClose={() => { if (game.tutorial) run({ type: 'dismissTutorial' }); setDialog(null); }}><div className="welcome-graphic"><Recycle size={45} /><span>MAKE VALUE GO ROUND</span></div><h3 className="welcome-title">Build something worth keeping.</h3><p className="modal-intro">You have 12 rounds to build a profitable circular business network. Start with a textile studio, then grow into furniture and electronics.</p><div className="tutorial-steps"><div><span>01</span><p><b>Make it work.</b> Produce 4 products, then sell them. Each action uses 1 of your round’s actions.</p></div><div><span>02</span><p><b>Bring it back.</b> Install take-back and repair. Sales collect 2 returns; repair keeps them in use and earns points.</p></div><div><span>03</span><p><b>Make connections.</b> Trade scraps, negotiate supply prices, and open new industries. Two profitable circular rounds close a loop.</p></div><div><span>04</span><p><b>Keep adapting.</b> Maintain equipment, budget for $18 overhead per industry, and restore gardens. All four campaign goals must hold at the end.</p></div></div><div className="tutorial-tip"><Sprout size={18} /><p><b>A good first round:</b> install take-back and repair, produce and sell twice, repair twice, sell the repaired batch, trade scraps, and service equipment. Leave room in your budget for overhead.</p></div><p className="fine-print">Single-player with simulated partners. Educational quantities and impact points are game abstractions. Progress saves on this browser.</p><button className="button full-width" onClick={() => { run({ type: 'dismissTutorial' }); setDialog(null); }}>Let’s build a better business <ArrowRight size={16} /></button></Modal>}

    {dialog === 'round' && <Modal title={`Close round ${game.round}?`} onClose={() => setDialog(null)}><p className="modal-intro">Unused actions don’t carry over. Operating costs and equipment wear apply when you finish.</p><div className="round-summary"><div><span>Actions remaining</span><b>{game.actions}</b></div><div><span>Round revenue</span><b>{money(game.ledger.revenue)}</b></div><div><span>Expenses so far</span><b>{money(game.ledger.expenses)}</b></div><div><span>Overhead due</span><b>{money(openCount * 18)}</b></div><div className="total"><span>Closing cash balance</span><b>{money(game.cash - openCount * 18)}</b></div></div><div className="tutorial-tip"><Wrench size={18} /><p>Every open industry loses {5 + currentEvent(game).wear}% equipment health. Loops need at least 25% health after this wear and new recovery points to remain connected.</p></div>{game.cash < openCount * 18 && <p className="warning">You cannot cover overhead. Claim the emergency grant in Impact report or sell inventory before ending this round.</p>}<div className="modal-buttons"><button className="button secondary" onClick={() => setDialog(null)}>Keep working</button><button className="button" onClick={() => { run({ type: 'next' }); setDialog(null); }}>{game.round === 12 ? 'Finish campaign' : 'Start next round'}<ArrowRight size={15} /></button></div></Modal>}

    {dialog === 'reset' && <Modal title="Start a new campaign?" onClose={() => setDialog(null)}><p className="modal-intro">Your current campaign and its saved progress will be replaced. This cannot be undone.</p><div className="modal-buttons"><button className="button secondary" onClick={() => setDialog(null)}>Keep playing</button><button className="button" onClick={() => { setGame(freshGame()); setSelected('textiles'); setTab('Dashboard'); setDialog(null); }}>Start fresh</button></div></Modal>}

    {game.status !== 'playing' && dialog !== 'reset' && <div className="outcome-banner"><div><Trophy size={28} /><div><strong>{game.status === 'won' ? 'You made it come full circle.' : 'Your campaign is complete.'}</strong><p>{game.reason}</p></div></div><span>{objectives(game).filter(o => o.done).length}/4 goals achieved</span><button className="button" onClick={() => setDialog('reset')}>Play again <RotateCcw size={15} /></button></div>}
  </div>;
}
function Operation({ icon, title, detail, cost, disabled, onClick }: { icon: ReactNode; title: string; detail: string; cost: string; disabled: boolean; onClick: () => void }) {
  return <button className="operation" disabled={disabled} onClick={onClick}><span className="operation-icon">{icon}</span><span className="operation-copy"><strong>{title}</strong><small>{detail}</small></span><span className={`operation-cost ${cost.startsWith('+') ? 'positive' : ''}`}>{cost}<ArrowUpRight size={13} /></span></button>;
}
function RefreshIcon({ size = 18 }: { size?: number }) { return <Recycle size={size} />; }
