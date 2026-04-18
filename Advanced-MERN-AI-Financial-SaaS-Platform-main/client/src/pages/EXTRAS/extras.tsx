import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  TrendingUp, DollarSign, Calculator, PieChart, Target,
  Globe, Coins, CreditCard, Briefcase, Shield,
  BarChart3, Activity, Landmark, Wallet, Award,
  LineChart, Percent, Receipt, Scale, GraduationCap,
  Home, Car, Heart, Clock, Zap, ArrowUpDown,
  Search, X, ChevronRight, Sparkles, RefreshCw,
  TrendingDown, Bell, Settings, ChevronDown, Menu,
  Newspaper, BarChart2, Star, Info, ExternalLink,
  ArrowUp, ArrowDown, Filter, Eye, BookOpen
} from 'lucide-react';


const C = {
  bg:       '#0f1117',
  bg2:      '#161b27',
  bg3:      '#1e2535',
  bg4:      '#252d40',
  border:   '#2a3347',
  border2:  '#334060',
  accent:   '#22c55e',  // green accent
  accent2:  '#16a34a',
  accent3:  '#15803d',
  accentBg: 'rgba(34,197,94,0.08)',
  accentBg2:'rgba(34,197,94,0.15)',
  red:      '#ef4444',
  redBg:    'rgba(239,68,68,0.1)',
  yellow:   '#f59e0b',
  blue:     '#3b82f6',
  text:     '#f1f5f9',
  text2:    '#94a3b8',
  text3:    '#475569',
  text4:    '#64748b',
};

// ─── FX RATES ─────────────────────────────────────────────────────────────────
const FX_RATES: Record<string, number> = {
  USD: 1, EUR: 0.9241, GBP: 0.7891, JPY: 149.82,
  INR: 83.24, AUD: 1.5312, CAD: 1.3581, CHF: 0.8923,
  SGD: 1.3421, AED: 3.6725, CNY: 7.2415, NZD: 1.6234,
};
const FX_FLAGS: Record<string, string> = {
  USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵',
  INR: '🇮🇳', AUD: '🇦🇺', CAD: '🇨🇦', CHF: '🇨🇭',
  SGD: '🇸🇬', AED: '🇦🇪', CNY: '🇨🇳', NZD: '🇳🇿',
};

// ─── FEATURES ─────────────────────────────────────────────────────────────────
interface Feature {
  id: string; title: string; description: string;
  icon: React.ComponentType<any>; category: string;
  badge?: string; apiEnabled?: boolean;
}

const features: Feature[] = [
  { id: 'stocks',      title: 'Stock Market Tracker',       description: 'Real-time stock prices & interactive charts',       icon: TrendingUp,  category: 'market',      badge: 'LIVE', apiEnabled: true },
  { id: 'crypto',      title: 'Cryptocurrency Dashboard',   description: 'Top crypto assets with live prices & trends',       icon: Coins,       category: 'market',      badge: 'LIVE', apiEnabled: true },
  { id: 'forex',       title: 'Forex Converter & Charts',   description: 'Live currency conversion with trend graphs',        icon: Globe,       category: 'market',      badge: 'LIVE', apiEnabled: true },
  { id: 'commodities', title: 'Commodity Prices',           description: 'Gold, Silver, Oil, Platinum live rates',           icon: Landmark,    category: 'market',      badge: 'LIVE', apiEnabled: true },
  { id: 'news',        title: 'Financial News Feed',        description: 'Latest market news with images & search',          icon: Newspaper,   category: 'market',      badge: 'LIVE', apiEnabled: true },
  { id: 'indices',     title: 'Market Indices',             description: 'Global stock indices tracker & charts',            icon: BarChart3,   category: 'market',      badge: 'LIVE', apiEnabled: true },
  { id: 'sip',         title: 'SIP Calculator',             description: 'Systematic Investment Plan returns with chart',    icon: Calculator,  category: 'calculator' },
  { id: 'emi',         title: 'EMI Calculator',             description: 'Loan EMI with amortization schedule',             icon: Receipt,     category: 'calculator' },
  { id: 'compound',    title: 'Compound Interest',          description: 'Future value with compounding frequency',          icon: Percent,     category: 'calculator' },
  { id: 'tax',         title: 'Tax Calculator',             description: 'New & old regime income tax comparison',           icon: Scale,       category: 'calculator' },
  { id: 'fd',          title: 'Fixed Deposit Calculator',   description: 'FD maturity with quarterly compounding',          icon: Landmark,    category: 'calculator' },
  { id: 'rd',          title: 'Recurring Deposit',          description: 'RD returns with maturity breakdown',               icon: Wallet,      category: 'calculator' },
  { id: 'ppf',         title: 'PPF Calculator',             description: 'Public Provident Fund 15-year corpus',            icon: Shield,      category: 'calculator' },
  { id: 'inflation',   title: 'Inflation Adjuster',         description: 'Real purchasing power over time',                 icon: TrendingDown,category: 'calculator' },
  { id: 'mortgage',    title: 'Mortgage Calculator',        description: 'Home loan EMI with down payment analysis',        icon: Home,        category: 'calculator' },
  { id: 'carloan',     title: 'Car Loan Calculator',        description: 'Vehicle financing with total cost view',          icon: Car,         category: 'calculator' },
  { id: 'retirement',  title: 'Retirement Planner',         description: 'Corpus needed & monthly SIP to retire',          icon: Target,      category: 'planner' },
  { id: 'budget',      title: 'Budget Planner',             description: '50/30/20 rule monthly budget allocator',          icon: PieChart,    category: 'planner' },
  { id: 'goals',       title: 'Financial Goals Tracker',    description: 'Multi-goal savings progress tracker',             icon: Award,       category: 'planner' },
  { id: 'debt',        title: 'Debt Payoff Planner',        description: 'Snowball vs avalanche comparison',                icon: CreditCard,  category: 'planner' },
  { id: 'education',   title: 'Education Fund Planner',     description: 'Child education corpus calculator',               icon: GraduationCap,category:'planner' },
  { id: 'emergency',   title: 'Emergency Fund',             description: '6-month expense buffer calculator',               icon: Heart,       category: 'planner' },
  { id: 'credit',      title: 'Credit Score Simulator',     description: 'Score impact analysis & improvement tips',        icon: Star,        category: 'analytics' },
  { id: 'risk',        title: 'Risk Analyzer',              description: 'Portfolio risk score & recommendations',          icon: Shield,      category: 'analytics' },
  { id: 'portfolio',   title: 'Portfolio Diversification',  description: 'Asset allocation checker & optimizer',           icon: PieChart,    category: 'analytics' },
  { id: 'networth',    title: 'Net Worth Tracker',          description: 'Assets vs liabilities with growth chart',        icon: Briefcase,   category: 'analytics' },
  { id: 'fire',        title: 'FIRE Calculator',            description: 'Financial Independence age & corpus',            icon: Zap,         category: 'analytics' },
  { id: 'savings',     title: 'Savings Rate Optimizer',     description: 'Maximize savings & investment rate',             icon: DollarSign,  category: 'analytics' },
];

// ─── UTILS ────────────────────────────────────────────────────────────────────
const fmt = (n: number): string => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(2)} L`;
  if (n >= 1000)     return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toFixed(0)}`;
};
const fmtUSD = (n: number): string => {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toFixed(2)}`;
};
const randArr = (len: number, base: number, variance: number): number[] =>
  Array.from({ length: len }, (_, i) =>
    +(base + Math.sin(i * 0.7) * variance * 0.6 + (Math.random() - 0.5) * variance * 0.8).toFixed(4)
  );
const genDates = (days: number): string[] => {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    dates.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }
  return dates;
};

// ─── SPARKLINE ────────────────────────────────────────────────────────────────
const Sparkline: React.FC<{ data: number[]; color: string; width?: number; height?: number }> = ({
  data, color, width = 80, height = 32,
}) => {
  const min = Math.min(...data); const max = Math.max(...data); const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * height}`).join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ─── LINE CHART ───────────────────────────────────────────────────────────────
const LineChartSVG: React.FC<{ data: number[]; labels?: string[]; color?: string; height?: number; fill?: boolean }> = ({
  data, labels, color = C.accent, height = 120, fill = true,
}) => {
  const W = 560; const H = height;
  const min = Math.min(...data); const max = Math.max(...data); const range = max - min || 1;
  const pad = { t: 10, b: labels ? 24 : 4, l: 4, r: 4 };
  const cw = W - pad.l - pad.r; const ch = H - pad.t - pad.b;
  const pts = data.map((v, i) => ({
    x: pad.l + (i / (data.length - 1)) * cw,
    y: pad.t + (1 - (v - min) / range) * ch,
  }));
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const fillPath = `${linePath} L${pts[pts.length - 1].x},${H - pad.b} L${pts[0].x},${H - pad.b} Z`;
  const showLabelEvery = Math.ceil(data.length / 6);
  const id = `grad-${color.replace('#', '')}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {fill && <path d={fillPath} fill={`url(#${id})`} />}
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {labels && pts.map((p, i) => i % showLabelEvery === 0 && (
        <text key={i} x={p.x} y={H - 4} textAnchor="middle" fontSize="9" fill={C.text3}>{labels[i]}</text>
      ))}
    </svg>
  );
};

// ─── DONUT CHART ──────────────────────────────────────────────────────────────
const DonutChart: React.FC<{ data: { label: string; value: number; color: string }[]; size?: number }> = ({ data, size = 120 }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  let cum = 0;
  const slices = data.map(d => {
    const pct = d.value / total; const start = cum; cum += pct;
    return { ...d, start, end: cum };
  });
  const r = 45; const cx = size / 2; const cy = size / 2;
  const arc = (s: number, e: number) => {
    const sa = s * 2 * Math.PI - Math.PI / 2; const ea = e * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(sa); const y1 = cy + r * Math.sin(sa);
    const x2 = cx + r * Math.cos(ea); const y2 = cy + r * Math.sin(ea);
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${e - s > 0.5 ? 1 : 0} 1 ${x2} ${y2} Z`;
  };
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, i) => <path key={i} d={arc(s.start, s.end)} fill={s.color} stroke={C.bg2} strokeWidth="2" />)}
      <circle cx={cx} cy={cy} r={r * 0.6} fill={C.bg2} />
    </svg>
  );
};

// ─── BAR CHART ────────────────────────────────────────────────────────────────
const BarChart: React.FC<{ data: number[]; labels: string[]; color?: string; height?: number }> = ({
  data, labels, color = C.accent, height = 140,
}) => {
  const max = Math.max(...data);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height, padding: '8px 0' }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
          <div style={{ fontSize: 9, color: C.text3, textAlign: 'center' }}>
            {v >= 100000 ? `${(v / 100000).toFixed(1)}L` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
          </div>
          <div style={{ width: '100%', background: color, borderRadius: '3px 3px 0 0', height: `${Math.max(4, (v / max) * (height - 40))}px`, opacity: 0.7 + 0.3 * (i / data.length), transition: 'height 0.5s ease' }} />
          <div style={{ fontSize: 9, color: C.text3, textAlign: 'center', lineHeight: 1.2 }}>{labels[i]}</div>
        </div>
      ))}
    </div>
  );
};

// ─── SLIDER ───────────────────────────────────────────────────────────────────
const Slider: React.FC<{ label: string; value: number; min: number; max: number; step?: number; display: string; onChange: (v: number) => void }> = ({
  label, value, min, max, step = 1, display, onChange,
}) => (
  <div style={{ marginBottom: 18 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
      <span style={{ fontSize: 13, color: C.text2 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: C.accent, background: C.accentBg, padding: '2px 10px', borderRadius: 6, border: `1px solid ${C.accent3}` }}>{display}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} style={{ width: '100%', accentColor: C.accent, cursor: 'pointer' }} />
  </div>
);

// ─── RESULT CARD ──────────────────────────────────────────────────────────────
const ResultCard: React.FC<{ label: string; value: string; primary?: boolean; positive?: boolean }> = ({ label, value, primary, positive }) => (
  <div style={{
    background: primary ? C.accentBg : C.bg3,
    border: `1px solid ${primary ? C.accent3 : C.border}`,
    borderRadius: 12, padding: '14px 16px', textAlign: 'center',
  }}>
    <div style={{ fontSize: 11, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 18, fontWeight: 800, color: primary ? C.accent : positive === false ? C.red : C.text, fontFamily: 'monospace' }}>{value}</div>
  </div>
);

// ─── MODAL ────────────────────────────────────────────────────────────────────
const Modal: React.FC<{ title: string; subtitle?: string; icon: React.ReactNode; onClose: () => void; children: React.ReactNode }> = ({
  title, subtitle, icon, onClose, children,
}) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }} onClick={onClose}>
    <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 20, width: '100%', maxWidth: 700, maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', animation: 'slideUp 0.25s ease' }} onClick={e => e.stopPropagation()}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: `1px solid ${C.border}`, background: C.bg3 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, background: C.accentBg2, border: `1px solid ${C.accent3}`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: C.text }}>{title}</h3>
            {subtitle && <p style={{ margin: '2px 0 0', fontSize: 12, color: C.text3 }}>{subtitle}</p>}
          </div>
        </div>
        <button onClick={onClose} style={{ width: 36, height: 36, background: C.bg4, border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.text2 }}>
          <X size={16} />
        </button>
      </div>
      <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>{children}</div>
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// STOCK TRACKER
// ══════════════════════════════════════════════════════════════════════════════
const StockModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const allStocks = [
    { sym: 'RELIANCE', name: 'Reliance Industries', price: 2456.75, chg: 23.40, pct: 0.96, cap: '₹16.6T', pe: 28.4, sector: 'Energy', data: randArr(30, 2400, 120) },
    { sym: 'TCS',      name: 'Tata Consultancy',    price: 3678.90, chg: -15.20, pct: -0.41, cap: '₹13.3T', pe: 31.2, sector: 'IT', data: randArr(30, 3650, 100) },
    { sym: 'INFY',     name: 'Infosys Ltd',         price: 1543.25, chg: 8.75, pct: 0.57, cap: '₹6.4T', pe: 24.1, sector: 'IT', data: randArr(30, 1520, 60) },
    { sym: 'HDFCBANK', name: 'HDFC Bank',           price: 1678.50, chg: 12.30, pct: 0.74, cap: '₹12.5T', pe: 19.8, sector: 'Banking', data: randArr(30, 1640, 70) },
    { sym: 'ICICI',    name: 'ICICI Bank',          price: 987.65,  chg: -5.40, pct: -0.54, cap: '₹6.9T', pe: 17.3, sector: 'Banking', data: randArr(30, 980, 40) },
    { sym: 'WIPRO',    name: 'Wipro Ltd',           price: 452.30,  chg: 3.20, pct: 0.71, cap: '₹2.4T', pe: 20.5, sector: 'IT', data: randArr(30, 445, 20) },
    { sym: 'BAJFINANCE', name: 'Bajaj Finance',     price: 6780.00, chg: 45.20, pct: 0.67, cap: '₹4.1T', pe: 35.2, sector: 'Finance', data: randArr(30, 6700, 200) },
    { sym: 'TATAMOTORS', name: 'Tata Motors',       price: 892.45,  chg: -8.60, pct: -0.95, cap: '₹3.2T', pe: 12.4, sector: 'Auto', data: randArr(30, 900, 40) },
  ];
  const [searchQ, setSearchQ] = useState('');
  const [selected, setSelected] = useState(0);
  const filtered = allStocks.filter(s => s.sym.toLowerCase().includes(searchQ.toLowerCase()) || s.name.toLowerCase().includes(searchQ.toLowerCase()));
  const s = filtered[selected] || allStocks[0];
  const dates = genDates(30);

  return (
    <Modal title="Stock Market Tracker" subtitle="NSE/BSE Live Prices" icon={<TrendingUp size={20} color={C.accent} />} onClose={onClose}>
      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.text3 }} />
        <input value={searchQ} onChange={e => { setSearchQ(e.target.value); setSelected(0); }} placeholder="Search stocks…" style={{ width: '100%', padding: '10px 12px 10px 36px', background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
      </div>
      {/* Stock chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {filtered.map((st, i) => (
          <button key={i} onClick={() => setSelected(i)} style={{ padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, background: selected === i ? C.accentBg2 : C.bg3, border: `1px solid ${selected === i ? C.accent : C.border}`, color: selected === i ? C.accent : C.text2 }}>
            {st.sym}
          </button>
        ))}
      </div>
      {/* Main price area */}
      <div style={{ background: C.bg3, borderRadius: 14, padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 13, color: C.text3, marginBottom: 4 }}>{s.name} · {s.sector}</div>
            <div style={{ fontSize: 34, fontWeight: 900, color: C.text, fontFamily: 'monospace', letterSpacing: '-1px' }}>₹{s.price.toFixed(2)}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, color: s.chg >= 0 ? C.accent : C.red, fontWeight: 600 }}>
                {s.chg >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                {s.chg >= 0 ? '+' : ''}{s.chg.toFixed(2)} ({s.pct >= 0 ? '+' : ''}{s.pct.toFixed(2)}%)
              </span>
              <span style={{ fontSize: 12, color: C.text3 }}>Today</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', padding: '5px 12px', borderRadius: 8, fontSize: 12, color: C.accent, fontWeight: 600 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.accent, animation: 'pulse 2s infinite' }} /> LIVE
            </div>
            <div style={{ fontSize: 12, color: C.text3 }}>Mkt Cap: {s.cap}</div>
            <div style={{ fontSize: 12, color: C.text3 }}>P/E: {s.pe}</div>
          </div>
        </div>
        <LineChartSVG data={s.data} labels={dates.filter((_, i) => i % 5 === 0)} color={s.chg >= 0 ? C.accent : C.red} height={140} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
        {[['52W High', '₹2,875'], ['52W Low', '₹1,987'], ['Volume', '4.2M'], ['Div Yield', '1.4%']].map(([l, v]) => (
          <div key={l} style={{ background: C.bg4, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, color: C.text3, marginBottom: 4 }}>{l}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{v}</div>
          </div>
        ))}
      </div>
    </Modal>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// CRYPTO DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
const CryptoModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const cryptos = [
    { name: 'Bitcoin', sym: 'BTC', price: 43256.78, chg: 3.45, cap: 845e9, vol: 28e9, data: randArr(30, 42000, 3000), color: '#f59e0b' },
    { name: 'Ethereum', sym: 'ETH', price: 2345.67, chg: -1.23, cap: 282e9, vol: 14e9, data: randArr(30, 2300, 200), color: '#8b5cf6' },
    { name: 'Solana', sym: 'SOL', price: 98.45, chg: 2.34, cap: 42.3e9, vol: 3.2e9, data: randArr(30, 95, 12), color: '#06b6d4' },
    { name: 'Cardano', sym: 'ADA', price: 0.5234, chg: 5.67, cap: 18.5e9, vol: 1.1e9, data: randArr(30, 0.50, 0.06), color: '#3b82f6' },
    { name: 'Polygon', sym: 'MATIC', price: 0.8912, chg: -2.10, cap: 8.3e9, vol: 0.7e9, data: randArr(30, 0.87, 0.08), color: '#a855f7' },
    { name: 'Chainlink', sym: 'LINK', price: 14.23, chg: 4.56, cap: 8.1e9, vol: 0.9e9, data: randArr(30, 13.5, 1.5), color: '#3b82f6' },
  ];
  const [sel, setSel] = useState(0);
  const c = cryptos[sel]; const dates = genDates(30);
  return (
    <Modal title="Cryptocurrency Dashboard" subtitle="Top Digital Assets" icon={<Coins size={20} color={C.accent} />} onClose={onClose}>
      <div style={{ background: C.bg3, borderRadius: 14, padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 36, height: 36, background: `${c.color}22`, border: `1px solid ${c.color}44`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: c.color }}>{c.sym.slice(0,2)}</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{c.name}</div>
                <div style={{ fontSize: 12, color: C.text3 }}>{c.sym} · {fmtUSD(c.cap)}</div>
              </div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: C.text, fontFamily: 'monospace' }}>${c.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: 14, color: c.chg >= 0 ? C.accent : C.red, fontWeight: 600 }}>
              {c.chg >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />} {c.chg >= 0 ? '+' : ''}{c.chg.toFixed(2)}%
            </div>
          </div>
          <div style={{ fontSize: 12, color: C.text3, textAlign: 'right' }}>
            <div>Vol: {fmtUSD(c.vol)}</div>
          </div>
        </div>
        <LineChartSVG data={c.data} labels={dates.filter((_, i) => i % 5 === 0)} color={c.chg >= 0 ? C.accent : C.red} height={130} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {cryptos.map((cr, i) => (
          <div key={i} onClick={() => setSel(i)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: sel === i ? C.accentBg : C.bg3, border: `1px solid ${sel === i ? C.accent3 : C.border}`, borderRadius: 10, cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 34, height: 34, background: `${cr.color}22`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: cr.color }}>{cr.sym.slice(0,2)}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{cr.name}</div>
                <div style={{ fontSize: 11, color: C.text3 }}>{cr.sym} · {fmtUSD(cr.cap)}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Sparkline data={cr.data} color={cr.chg >= 0 ? C.accent : C.red} />
              <div style={{ textAlign: 'right', minWidth: 80 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>${cr.price < 1 ? cr.price.toFixed(4) : cr.price.toLocaleString()}</div>
                <div style={{ fontSize: 12, color: cr.chg >= 0 ? C.accent : C.red }}>{cr.chg >= 0 ? '+' : ''}{cr.chg.toFixed(2)}%</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// NEWS FEED — Enhanced with images, search, categories
// ══════════════════════════════════════════════════════════════════════════════
const newsData = [
  {
    cat: 'Markets', title: 'Nifty 50 hits fresh 3-month high as FII buying resumes in banking, IT stocks',
    time: '2 hrs ago', impact: '+0.82%', up: true, source: 'Economic Times',
    img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop',
    excerpt: 'Foreign institutional investors poured over ₹4,200 crore into Indian equities today, driving Nifty to its highest level in three months.',
    tags: ['Nifty', 'FII', 'Banking'],
  },
  {
    cat: 'RBI Policy', title: 'RBI expected to hold repo rate at 6.5% in upcoming MPC meeting, say economists',
    time: '3 hrs ago', impact: 'Neutral', up: true, source: 'Mint',
    img: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&h=200&fit=crop',
    excerpt: 'A poll of 20 economists unanimously predicts the central bank will keep rates steady, citing sticky inflation above the 4% target.',
    tags: ['RBI', 'Repo Rate', 'MPC'],
  },
  {
    cat: 'IT Sector', title: 'TCS, Infosys shares surge on strong Q3 guidance from US client spending revival',
    time: '4 hrs ago', impact: '+1.4%', up: true, source: 'Business Standard',
    img: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&h=200&fit=crop',
    excerpt: 'India\'s top IT companies are seeing deal wins accelerate as US tech budgets open up heading into 2025.',
    tags: ['TCS', 'Infosys', 'IT'],
  },
  {
    cat: 'Oil & Gas', title: 'Crude rises to $77 as OPEC+ signals extended production cuts through Q1 2025',
    time: '5 hrs ago', impact: '-0.6%', up: false, source: 'Reuters',
    img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=200&fit=crop',
    excerpt: 'Brent crude climbed past $77/barrel after Saudi Arabia and Russia confirmed supply cuts will continue well into next year.',
    tags: ['Crude Oil', 'OPEC', 'Energy'],
  },
  {
    cat: 'Crypto', title: 'Bitcoin breaks $43,000 resistance level; altcoins follow with 5–8% gains',
    time: '6 hrs ago', impact: '+3.48%', up: true, source: 'CoinDesk',
    img: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=400&h=200&fit=crop',
    excerpt: 'Spot Bitcoin ETF optimism continues to fuel the rally as institutional buyers stack sats ahead of the April halving.',
    tags: ['Bitcoin', 'ETF', 'Altcoins'],
  },
  {
    cat: 'Economy', title: 'India GDP growth revised upward to 7.2% for FY25 by World Bank amid strong domestic demand',
    time: '9 hrs ago', impact: 'Positive', up: true, source: 'Bloomberg',
    img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=200&fit=crop',
    excerpt: 'World Bank upgrades India\'s growth forecast, citing resilient consumer spending and record capital expenditure by the government.',
    tags: ['GDP', 'India', 'Economy'],
  },
  {
    cat: 'Banking', title: 'HDFC Bank Q3 net profit rises 34% YoY; asset quality stable with NPA at 1.26%',
    time: '11 hrs ago', impact: '+2.1%', up: true, source: 'Economic Times',
    img: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=400&h=200&fit=crop',
    excerpt: 'India\'s largest private bank reports stellar results with net interest income growing 24% as credit demand stays robust.',
    tags: ['HDFC Bank', 'Q3', 'NPA'],
  },
  {
    cat: 'Auto', title: 'Tata Motors EV sales hit new record in December; market share up 4% to 64%',
    time: '12 hrs ago', impact: '+1.7%', up: true, source: 'Autocar India',
    img: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=200&fit=crop',
    excerpt: 'Tata Motors sold over 24,000 electric vehicles in December alone, cementing its dominant position in India\'s fast-growing EV market.',
    tags: ['Tata Motors', 'EV', 'Auto'],
  },
];

const catColors: Record<string, string> = {
  Markets: C.accent, 'RBI Policy': C.yellow, 'IT Sector': C.blue,
  'Oil & Gas': '#94a3b8', Crypto: '#a855f7', IPO: '#34d399',
  Economy: C.accent, Banking: C.blue, Auto: '#f97316', FMCG: '#fb7185',
};

const NewsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('All');
  const [featured, setFeatured] = useState(newsData[0]);
  const allTags = ['All', 'Markets', 'RBI Policy', 'IT Sector', 'Oil & Gas', 'Crypto', 'Economy', 'Banking', 'Auto'];

  const filtered = newsData.filter(n => {
    const matchCat = activeTag === 'All' || n.cat === activeTag;
    const matchSearch = search === '' || n.title.toLowerCase().includes(search.toLowerCase()) || n.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <Modal title="Financial News Feed" subtitle="Real-time market news & analysis" icon={<Newspaper size={20} color={C.accent} />} onClose={onClose}>
      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 14 }}>
        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.text3 }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search news, stocks, topics…" style={{ width: '100%', padding: '10px 12px 10px 36px', background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.text3 }}><X size={13} /></button>}
      </div>

      {/* Category pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {allTags.map(tag => (
          <button key={tag} onClick={() => setActiveTag(tag)} style={{ padding: '5px 12px', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', background: activeTag === tag ? C.accentBg2 : C.bg3, border: `1px solid ${activeTag === tag ? C.accent : C.border}`, color: activeTag === tag ? C.accent : C.text3 }}>
            {tag}
          </button>
        ))}
      </div>

      {/* Featured article */}
      {filtered.length > 0 && (
        <div style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 16, border: `1px solid ${C.border}`, cursor: 'pointer' }} onClick={() => setFeatured(filtered[0])}>
          <div style={{ position: 'relative', height: 180 }}>
            <img src={filtered[0].img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: catColors[filtered[0].cat] || C.accent, background: `${catColors[filtered[0].cat] || C.accent}22`, padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{filtered[0].cat}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{filtered[0].source} · {filtered[0].time}</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1.4 }}>{filtered[0].title}</div>
            </div>
          </div>
          <div style={{ background: C.bg3, padding: '12px 18px' }}>
            <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.6, marginBottom: 10 }}>{filtered[0].excerpt}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {filtered[0].tags.map(t => <span key={t} style={{ fontSize: 11, color: C.text3, background: C.bg4, padding: '2px 8px', borderRadius: 10, border: `1px solid ${C.border}` }}>{t}</span>)}
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: filtered[0].up ? C.accent : C.red, background: filtered[0].up ? C.accentBg : C.redBg, padding: '4px 10px', borderRadius: 6 }}>{filtered[0].impact}</span>
            </div>
          </div>
        </div>
      )}

      {/* News list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.slice(1).map((n, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', cursor: 'pointer' }}>
            <div style={{ width: 100, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
              <img src={n.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent, rgba(30,37,53,0.3))' }} />
            </div>
            <div style={{ padding: '12px 14px 12px 0', flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: catColors[n.cat] || C.accent, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{n.cat}</span>
                <span style={{ fontSize: 11, color: C.text3 }}>{n.source}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, lineHeight: 1.4, marginBottom: 6 }}>{n.title}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: C.text3 }}>{n.time}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: n.up ? C.accent : C.red }}>{n.impact}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: C.text3 }}>
          <Newspaper size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
          <div style={{ fontSize: 15 }}>No news found for "{search}"</div>
        </div>
      )}
    </Modal>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// FOREX
// ══════════════════════════════════════════════════════════════════════════════
const ForexModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [amount, setAmount] = useState(1000);
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('INR');
  const currencies = Object.keys(FX_RATES);
  const rate = FX_RATES[to] / FX_RATES[from];
  const converted = amount * rate;
  const dates = genDates(30);
  const trendData = randArr(30, rate, rate * 0.02);
  const majors = [
    { pair: 'USD/INR', rate: (FX_RATES.INR / FX_RATES.USD).toFixed(2), chg: '+0.12', up: true },
    { pair: 'EUR/INR', rate: (FX_RATES.INR / FX_RATES.EUR).toFixed(2), chg: '+0.32', up: true },
    { pair: 'GBP/INR', rate: (FX_RATES.INR / FX_RATES.GBP).toFixed(2), chg: '-0.54', up: false },
    { pair: 'JPY/INR', rate: (FX_RATES.INR / FX_RATES.JPY).toFixed(4), chg: '+0.001', up: true },
    { pair: 'AUD/INR', rate: (FX_RATES.INR / FX_RATES.AUD).toFixed(2), chg: '-0.18', up: false },
    { pair: 'SGD/INR', rate: (FX_RATES.INR / FX_RATES.SGD).toFixed(2), chg: '+0.09', up: true },
  ];
  return (
    <Modal title="Forex Converter & Charts" subtitle="Live Exchange Rates" icon={<Globe size={20} color={C.accent} />} onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'flex-end', marginBottom: 16 }}>
        <div>
          <label style={{ fontSize: 11, color: C.text3, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Amount</label>
          <input type="number" value={amount} onChange={e => setAmount(+e.target.value)} style={{ width: '100%', padding: '12px 14px', background: C.bg3, border: `1px solid ${C.border2}`, borderRadius: 10, color: C.text, fontSize: 18, fontWeight: 700, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' }} />
          <label style={{ fontSize: 11, color: C.text3, display: 'block', margin: '10px 0 6px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>From</label>
          <select value={from} onChange={e => setFrom(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: C.bg3, border: `1px solid ${C.border2}`, borderRadius: 10, color: C.text, fontSize: 14, outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}>
            {currencies.map(c => <option key={c} value={c}>{FX_FLAGS[c]} {c}</option>)}
          </select>
        </div>
        <div style={{ paddingBottom: 12 }}>
          <button onClick={() => { setFrom(to); setTo(from); }} style={{ width: 40, height: 40, background: C.accentBg, border: `1px solid ${C.accent3}`, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.accent }}>
            <ArrowUpDown size={16} />
          </button>
        </div>
        <div>
          <label style={{ fontSize: 11, color: C.text3, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Converted</label>
          <div style={{ padding: '12px 14px', background: C.accentBg, border: `1px solid ${C.accent3}`, borderRadius: 10, fontSize: 18, fontWeight: 700, fontFamily: 'monospace', color: C.accent }}>
            {converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
          </div>
          <label style={{ fontSize: 11, color: C.text3, display: 'block', margin: '10px 0 6px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>To</label>
          <select value={to} onChange={e => setTo(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: C.bg3, border: `1px solid ${C.border2}`, borderRadius: 10, color: C.text, fontSize: 14, outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}>
            {currencies.map(c => <option key={c} value={c}>{FX_FLAGS[c]} {c}</option>)}
          </select>
        </div>
      </div>
      <div style={{ background: C.accentBg, border: `1px solid ${C.accent3}`, borderRadius: 10, padding: '12px 16px', textAlign: 'center', marginBottom: 20, fontSize: 14, color: C.text2 }}>
        1 <strong style={{ color: C.accent }}>{from}</strong> = <strong style={{ color: C.accent }}>{rate.toFixed(4)}</strong> {to} &nbsp;·&nbsp;
        1 <strong style={{ color: C.accent }}>{to}</strong> = <strong style={{ color: C.accent }}>{(1 / rate).toFixed(4)}</strong> {from}
      </div>
      <div style={{ background: C.bg3, borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: C.text3, marginBottom: 8 }}>{from}/{to} — 30-Day Trend</div>
        <LineChartSVG data={trendData} labels={dates.filter((_, i) => i % 5 === 0)} color={C.accent} height={110} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {majors.map(m => (
          <div key={m.pair} style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{m.pair}</div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.accent, fontFamily: 'monospace' }}>{m.rate}</div>
              <div style={{ fontSize: 11, color: m.up ? C.accent : C.red }}>{m.chg}</div>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// COMMODITIES
// ══════════════════════════════════════════════════════════════════════════════
const CommoditiesModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const items = [
    { name: 'Gold', icon: '🥇', unit: 'per 10g', price: '₹62,450', usd: '$2,031/oz', chg: '+0.34%', up: true, data: randArr(30, 62000, 1500) },
    { name: 'Silver', icon: '🥈', unit: 'per kg', price: '₹74,200', usd: '$23.8/oz', chg: '-0.18%', up: false, data: randArr(30, 73500, 2000) },
    { name: 'Crude Oil', icon: '🛢️', unit: 'per barrel', price: '$77.45', usd: 'WTI', chg: '+1.20%', up: true, data: randArr(30, 76, 4) },
    { name: 'Natural Gas', icon: '🔥', unit: 'per MMBtu', price: '$2.81', usd: 'Henry Hub', chg: '-2.30%', up: false, data: randArr(30, 2.8, 0.3) },
    { name: 'Platinum', icon: '💎', unit: 'per oz', price: '$924', usd: 'spot', chg: '+0.56%', up: true, data: randArr(30, 920, 30) },
    { name: 'Copper', icon: '🔶', unit: 'per lb', price: '$3.82', usd: 'COMEX', chg: '+0.89%', up: true, data: randArr(30, 3.78, 0.12) },
  ];
  return (
    <Modal title="Commodity Prices" subtitle="Live global commodity rates" icon={<Landmark size={20} color={C.accent} />} onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {items.map(item => (
          <div key={item.name} style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{item.name}</span>
                </div>
                <div style={{ fontSize: 11, color: C.text3 }}>{item.unit} · {item.usd}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.text, fontFamily: 'monospace' }}>{item.price}</div>
                <div style={{ fontSize: 12, color: item.up ? C.accent : C.red }}>{item.chg}</div>
              </div>
            </div>
            <Sparkline data={item.data} color={item.up ? C.accent : C.red} width={220} height={40} />
          </div>
        ))}
      </div>
    </Modal>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// INDICES
// ══════════════════════════════════════════════════════════════════════════════
const IndicesModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const indices = [
    { name: 'Nifty 50', region: '🇮🇳 India', value: '20,156.25', chg: '+163.4', pct: '+0.82%', up: true, data: randArr(30, 20000, 400) },
    { name: 'Sensex', region: '🇮🇳 India', value: '67,234.10', chg: '+501.2', pct: '+0.75%', up: true, data: randArr(30, 67000, 1000) },
    { name: 'S&P 500', region: '🇺🇸 USA', value: '4,783.45', chg: '+18.3', pct: '+0.38%', up: true, data: randArr(30, 4750, 120) },
    { name: 'Nasdaq', region: '🇺🇸 USA', value: '14,972.77', chg: '-45.6', pct: '-0.30%', up: false, data: randArr(30, 15000, 400) },
    { name: 'FTSE 100', region: '🇬🇧 UK', value: '7,634.90', chg: '+23.1', pct: '+0.30%', up: true, data: randArr(30, 7600, 150) },
    { name: 'Nikkei 225', region: '🇯🇵 Japan', value: '33,288.29', chg: '-112.4', pct: '-0.34%', up: false, data: randArr(30, 33400, 600) },
  ];
  const dates = genDates(30);
  const [sel, setSel] = useState(0);
  const idx = indices[sel];
  return (
    <Modal title="Global Market Indices" subtitle="Real-time index tracking" icon={<BarChart3 size={20} color={C.accent} />} onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        {indices.map((idx, i) => (
          <div key={i} onClick={() => setSel(i)} style={{ background: sel === i ? C.accentBg : C.bg3, border: `1px solid ${sel === i ? C.accent : C.border}`, borderRadius: 10, padding: '12px 14px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{idx.name}</div>
              <div style={{ fontSize: 11, color: C.text3 }}>{idx.region}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: sel === i ? C.accent : C.text }}>{idx.value}</div>
              <div style={{ fontSize: 11, color: idx.up ? C.accent : C.red }}>{idx.pct}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ background: C.bg3, borderRadius: 12, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{idx.name} — 30-Day Chart</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: idx.up ? C.accent : C.red }}>{idx.pct}</div>
        </div>
        <LineChartSVG data={idx.data} labels={dates.filter((_, i) => i % 5 === 0)} color={idx.up ? C.accent : C.red} height={140} />
      </div>
    </Modal>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// CALCULATORS — SIP, EMI, Compound, Tax, FD, RD, PPF, Inflation, Mortgage, Car
// ══════════════════════════════════════════════════════════════════════════════
const SIPModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [mi, setMi] = useState(5000); const [er, setEr] = useState(12); const [tp, setTp] = useState(10);
  const r = er / 12 / 100; const n = tp * 12;
  const fv = mi * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
  const inv = mi * n; const ret = fv - inv;
  const barData = [3, 5, 7, 10, 15].map(y => { const mn = y * 12; return Math.round(mi * (((Math.pow(1 + r, mn) - 1) / r) * (1 + r))); });
  return (
    <Modal title="SIP Calculator" subtitle="Systematic Investment Plan returns" icon={<Calculator size={20} color={C.accent} />} onClose={onClose}>
      <Slider label="Monthly Investment (₹)" value={mi} min={500} max={100000} step={500} display={`₹${mi.toLocaleString('en-IN')}`} onChange={setMi} />
      <Slider label="Expected Annual Return (%)" value={er} min={1} max={30} step={0.5} display={`${er}%`} onChange={setEr} />
      <Slider label="Investment Period (Years)" value={tp} min={1} max={40} step={1} display={`${tp} yrs`} onChange={setTp} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
        <ResultCard label="Future Value" value={fmt(fv)} primary />
        <ResultCard label="Invested" value={fmt(inv)} />
        <ResultCard label="Returns" value={fmt(ret)} positive />
      </div>
      <div style={{ background: C.bg3, borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 12, color: C.text3, marginBottom: 8 }}>Corpus by Duration at {er}% return</div>
        <BarChart data={barData} labels={['3yr', '5yr', '7yr', '10yr', '15yr']} color={C.accent} height={120} />
      </div>
    </Modal>
  );
};

const EMIModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [la, setLa] = useState(5000000); const [ir, setIr] = useState(8.5); const [tn, setTn] = useState(20);
  const r = ir / 12 / 100; const n = tn * 12;
  const emi = la * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  const tot = emi * n; const interest = tot - la;
  const principalPct = Math.round((la / tot) * 100);
  return (
    <Modal title="EMI Calculator" subtitle="Loan installment & amortization" icon={<Receipt size={20} color={C.accent} />} onClose={onClose}>
      <Slider label="Loan Amount (₹)" value={la} min={100000} max={10000000} step={100000} display={fmt(la)} onChange={setLa} />
      <Slider label="Interest Rate (% p.a.)" value={ir} min={5} max={24} step={0.1} display={`${ir.toFixed(1)}%`} onChange={setIr} />
      <Slider label="Loan Tenure (Years)" value={tn} min={1} max={30} step={1} display={`${tn} yrs`} onChange={setTn} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
        <ResultCard label="Monthly EMI" value={`₹${Math.round(emi).toLocaleString('en-IN')}`} primary />
        <ResultCard label="Total Interest" value={fmt(interest)} />
        <ResultCard label="Total Payment" value={fmt(tot)} />
      </div>
      <div style={{ background: C.bg3, borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 12, color: C.text3, marginBottom: 8 }}>Principal vs Interest</div>
        <div style={{ height: 16, borderRadius: 8, overflow: 'hidden', display: 'flex', marginBottom: 10 }}>
          <div style={{ width: `${principalPct}%`, background: C.accent }} />
          <div style={{ flex: 1, background: C.red }} />
        </div>
        <div style={{ display: 'flex', gap: 20, fontSize: 12 }}>
          <span style={{ color: C.accent }}>■ Principal {principalPct}%</span>
          <span style={{ color: C.red }}>■ Interest {100 - principalPct}%</span>
        </div>
      </div>
    </Modal>
  );
};

const CompoundModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [p, setP] = useState(100000); const [rate, setRate] = useState(10); const [t, setT] = useState(10); const [freq, setFreq] = useState(4);
  const fa = p * Math.pow(1 + rate / (freq * 100), freq * t);
  const yearData = Array.from({ length: t }, (_, i) => Math.round(p * Math.pow(1 + rate / (freq * 100), freq * (i + 1))));
  return (
    <Modal title="Compound Interest Calculator" subtitle="Future value with compounding" icon={<Percent size={20} color={C.accent} />} onClose={onClose}>
      <Slider label="Principal (₹)" value={p} min={10000} max={5000000} step={10000} display={fmt(p)} onChange={setP} />
      <Slider label="Interest Rate (% p.a.)" value={rate} min={1} max={30} step={0.5} display={`${rate}%`} onChange={setRate} />
      <Slider label="Time Period (Years)" value={t} min={1} max={40} step={1} display={`${t} yrs`} onChange={setT} />
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: C.text2, marginBottom: 8 }}>Compounding Frequency</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[{ v: 1, l: 'Annual' }, { v: 4, l: 'Quarterly' }, { v: 12, l: 'Monthly' }, { v: 365, l: 'Daily' }].map(f => (
            <button key={f.v} onClick={() => setFreq(f.v)} style={{ flex: 1, padding: '8px 4px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, background: freq === f.v ? C.accentBg2 : C.bg3, border: `1px solid ${freq === f.v ? C.accent : C.border}`, color: freq === f.v ? C.accent : C.text3 }}>{f.l}</button>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
        <ResultCard label="Final Amount" value={fmt(fa)} primary />
        <ResultCard label="Interest Earned" value={fmt(fa - p)} positive />
        <ResultCard label="Growth" value={`${(fa / p).toFixed(2)}x`} />
      </div>
      <div style={{ background: C.bg3, borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 12, color: C.text3, marginBottom: 8 }}>Yearly Growth</div>
        <BarChart data={yearData} labels={Array.from({ length: t }, (_, i) => `Yr${i + 1}`)} color={C.accent} height={120} />
      </div>
    </Modal>
  );
};

const TaxModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [income, setIncome] = useState(1000000); const [regime, setRegime] = useState<'new' | 'old'>('new');
  const calcTaxNew = (inc: number) => { let tax = 0; if (inc > 1500000) tax = 150000 + (inc - 1500000) * 0.30; else if (inc > 1200000) tax = 90000 + (inc - 1200000) * 0.20; else if (inc > 900000) tax = 45000 + (inc - 900000) * 0.15; else if (inc > 600000) tax = 15000 + (inc - 600000) * 0.10; else if (inc > 300000) tax = (inc - 300000) * 0.05; return tax * 1.04; };
  const calcTaxOld = (inc: number) => { const taxable = inc - 150000 - 50000; let tax = 0; if (taxable > 1000000) tax = 112500 + (taxable - 1000000) * 0.30; else if (taxable > 500000) tax = 12500 + (taxable - 500000) * 0.20; else if (taxable > 250000) tax = (taxable - 250000) * 0.05; return tax * 1.04; };
  const tax = regime === 'new' ? calcTaxNew(income) : calcTaxOld(income);
  const inhand = (income - tax) / 12;
  return (
    <Modal title="Income Tax Calculator" subtitle="FY 2024-25" icon={<Scale size={20} color={C.accent} />} onClose={onClose}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['new', 'old'] as const).map(r => (
          <button key={r} onClick={() => setRegime(r)} style={{ flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600, background: regime === r ? C.accentBg2 : C.bg3, border: `1px solid ${regime === r ? C.accent : C.border}`, color: regime === r ? C.accent : C.text2 }}>
            {r === 'new' ? '✦ New Regime' : '◇ Old Regime'}
          </button>
        ))}
      </div>
      <Slider label="Annual Gross Income (₹)" value={income} min={300000} max={5000000} step={50000} display={fmt(income)} onChange={setIncome} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <ResultCard label="Total Tax" value={fmt(tax)} />
        <ResultCard label="Effective Rate" value={`${((tax / income) * 100).toFixed(1)}%`} primary />
        <ResultCard label="Monthly In-Hand" value={fmt(inhand)} positive />
      </div>
    </Modal>
  );
};

const FDModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [p, setP] = useState(500000); const [rate, setRate] = useState(7); const [t, setT] = useState(3);
  const mv = p * Math.pow(1 + rate / (4 * 100), 4 * t);
  return (
    <Modal title="Fixed Deposit Calculator" subtitle="FD maturity with quarterly compounding" icon={<Landmark size={20} color={C.accent} />} onClose={onClose}>
      <Slider label="Principal (₹)" value={p} min={10000} max={5000000} step={10000} display={fmt(p)} onChange={setP} />
      <Slider label="Interest Rate (% p.a.)" value={rate} min={4} max={9} step={0.25} display={`${rate}%`} onChange={setRate} />
      <Slider label="Duration (Years)" value={t} min={1} max={10} step={0.5} display={`${t} yrs`} onChange={setT} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <ResultCard label="Maturity Value" value={fmt(mv)} primary />
        <ResultCard label="Interest Earned" value={fmt(mv - p)} positive />
        <ResultCard label="Effective Rate" value={`${((Math.pow(1 + rate / (4 * 100), 4) - 1) * 100).toFixed(2)}%`} />
      </div>
    </Modal>
  );
};

const RDModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [mi, setMi] = useState(5000); const [rate, setRate] = useState(6.5); const [t, setT] = useState(2);
  const n = t * 12; const r = rate / (4 * 100);
  const mv = mi * ((Math.pow(1 + r, n) - 1) / (1 - Math.pow(1 + r, -1 / 3)));
  const inv = mi * n;
  return (
    <Modal title="Recurring Deposit Calculator" subtitle="RD maturity value & returns" icon={<Wallet size={20} color={C.accent} />} onClose={onClose}>
      <Slider label="Monthly Deposit (₹)" value={mi} min={500} max={50000} step={500} display={`₹${mi.toLocaleString('en-IN')}`} onChange={setMi} />
      <Slider label="Interest Rate (% p.a.)" value={rate} min={4} max={9} step={0.25} display={`${rate}%`} onChange={setRate} />
      <Slider label="Duration (Years)" value={t} min={1} max={10} step={1} display={`${t} yrs`} onChange={setT} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <ResultCard label="Maturity Value" value={fmt(mv)} primary />
        <ResultCard label="Deposited" value={fmt(inv)} />
        <ResultCard label="Interest" value={fmt(mv - inv)} positive />
      </div>
    </Modal>
  );
};

const PPFModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [yearly, setYearly] = useState(150000);
  const rate = 7.1; const years = 15;
  let corpus = 0;
  for (let i = 0; i < years; i++) corpus = (corpus + yearly) * (1 + rate / 100);
  const invested = yearly * years;
  return (
    <Modal title="PPF Calculator" subtitle="Public Provident Fund — 15 year lock-in" icon={<Shield size={20} color={C.accent} />} onClose={onClose}>
      <div style={{ background: C.accentBg, border: `1px solid ${C.accent3}`, borderRadius: 10, padding: '10px 16px', marginBottom: 20, fontSize: 13, color: C.text2 }}>
        PPF rate: <strong style={{ color: C.accent }}>7.1% p.a.</strong> · Lock-in: <strong style={{ color: C.accent }}>15 years</strong> · EEE Tax Status
      </div>
      <Slider label="Yearly Investment (₹)" value={yearly} min={500} max={150000} step={500} display={`₹${yearly.toLocaleString('en-IN')}`} onChange={setYearly} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <ResultCard label="Maturity Corpus" value={fmt(corpus)} primary />
        <ResultCard label="Total Invested" value={fmt(invested)} />
        <ResultCard label="Tax-Free Returns" value={fmt(corpus - invested)} positive />
      </div>
    </Modal>
  );
};

const InflationModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [amount, setAmount] = useState(100000); const [inflRate, setInflRate] = useState(6); const [years, setYears] = useState(10);
  const futureVal = amount * Math.pow(1 + inflRate / 100, years);
  const realVal = amount / Math.pow(1 + inflRate / 100, years);
  return (
    <Modal title="Inflation Adjuster" subtitle="Real purchasing power calculator" icon={<TrendingDown size={20} color={C.accent} />} onClose={onClose}>
      <Slider label="Current Amount (₹)" value={amount} min={10000} max={5000000} step={10000} display={fmt(amount)} onChange={setAmount} />
      <Slider label="Inflation Rate (% p.a.)" value={inflRate} min={2} max={15} step={0.5} display={`${inflRate}%`} onChange={setInflRate} />
      <Slider label="Years Ahead" value={years} min={1} max={40} step={1} display={`${years} yrs`} onChange={setYears} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <ResultCard label="Future Cost" value={fmt(futureVal)} primary />
        <ResultCard label="Today's Real Value" value={fmt(realVal)} positive={false} />
      </div>
      <div style={{ background: C.bg3, borderRadius: 10, padding: 12, marginTop: 14, fontSize: 13, color: C.text3, lineHeight: 1.6 }}>
        At <strong style={{ color: C.accent }}>{inflRate}%</strong> inflation, purchasing power halves every <strong style={{ color: C.accent }}>{(Math.log(2) / Math.log(1 + inflRate / 100)).toFixed(1)} years</strong>.
      </div>
    </Modal>
  );
};

const MortgageModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [price, setPrice] = useState(8000000); const [down, setDown] = useState(20); const [rate, setRate] = useState(8.5); const [tenure, setTenure] = useState(20);
  const loan = price * (1 - down / 100); const r = rate / 12 / 100; const n = tenure * 12;
  const emi = loan * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  const totalPay = emi * n; const interest = totalPay - loan;
  return (
    <Modal title="Mortgage Calculator" subtitle="Home loan EMI & cost analysis" icon={<Home size={20} color={C.accent} />} onClose={onClose}>
      <Slider label="Property Value (₹)" value={price} min={1000000} max={50000000} step={500000} display={fmt(price)} onChange={setPrice} />
      <Slider label="Down Payment (%)" value={down} min={10} max={50} step={5} display={`${down}% (${fmt(price * down / 100)})`} onChange={setDown} />
      <Slider label="Interest Rate (% p.a.)" value={rate} min={6} max={15} step={0.1} display={`${rate.toFixed(1)}%`} onChange={setRate} />
      <Slider label="Loan Tenure (Years)" value={tenure} min={5} max={30} step={1} display={`${tenure} yrs`} onChange={setTenure} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <ResultCard label="Loan Amount" value={fmt(loan)} />
        <ResultCard label="Monthly EMI" value={`₹${Math.round(emi).toLocaleString('en-IN')}`} primary />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <ResultCard label="Total Interest" value={fmt(interest)} positive={false} />
        <ResultCard label="Total Cost" value={fmt(totalPay + price * down / 100)} />
      </div>
    </Modal>
  );
};

const CarLoanModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [price, setPrice] = useState(1200000); const [down, setDown] = useState(20); const [rate, setRate] = useState(9.5); const [tenure, setTenure] = useState(5);
  const loan = price * (1 - down / 100); const r = rate / 12 / 100; const n = tenure * 12;
  const emi = loan * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  return (
    <Modal title="Car Loan Calculator" subtitle="Vehicle financing cost analysis" icon={<Car size={20} color={C.accent} />} onClose={onClose}>
      <Slider label="Car Price (₹)" value={price} min={300000} max={10000000} step={100000} display={fmt(price)} onChange={setPrice} />
      <Slider label="Down Payment (%)" value={down} min={10} max={60} step={5} display={`${down}%`} onChange={setDown} />
      <Slider label="Interest Rate (% p.a.)" value={rate} min={7} max={20} step={0.5} display={`${rate}%`} onChange={setRate} />
      <Slider label="Loan Tenure (Years)" value={tenure} min={1} max={7} step={1} display={`${tenure} yrs`} onChange={setTenure} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <ResultCard label="Loan Amount" value={fmt(loan)} />
        <ResultCard label="Monthly EMI" value={`₹${Math.round(emi).toLocaleString('en-IN')}`} primary />
        <ResultCard label="Total Interest" value={fmt(emi * n - loan)} positive={false} />
      </div>
    </Modal>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// PLANNERS
// ══════════════════════════════════════════════════════════════════════════════
const RetirementModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [age, setAge] = useState(30); const [retireAge, setRetireAge] = useState(60); const [monthlyExp, setMonthlyExp] = useState(60000); const [savings, setSavings] = useState(500000); const [returnRate, setReturnRate] = useState(12);
  const years = retireAge - age;
  const monthlyRetireExp = monthlyExp * Math.pow(1.06, years);
  const corpus = monthlyRetireExp * 12 * 25;
  const r = returnRate / 12 / 100; const n = years * 12;
  const fvSavings = savings * Math.pow(1 + returnRate / 100, years);
  const shortfall = Math.max(0, corpus - fvSavings);
  const sipNeeded = shortfall > 0 ? shortfall * r / (Math.pow(1 + r, n) - 1) : 0;
  return (
    <Modal title="Retirement Planner" subtitle="Plan your retirement corpus" icon={<Target size={20} color={C.accent} />} onClose={onClose}>
      <Slider label="Current Age" value={age} min={20} max={55} step={1} display={`${age} yrs`} onChange={setAge} />
      <Slider label="Retirement Age" value={retireAge} min={45} max={70} step={1} display={`${retireAge} yrs`} onChange={setRetireAge} />
      <Slider label="Monthly Expenses (₹)" value={monthlyExp} min={20000} max={300000} step={5000} display={`₹${monthlyExp.toLocaleString('en-IN')}`} onChange={setMonthlyExp} />
      <Slider label="Current Savings (₹)" value={savings} min={0} max={10000000} step={100000} display={fmt(savings)} onChange={setSavings} />
      <Slider label="Expected Return (% p.a.)" value={returnRate} min={6} max={18} step={0.5} display={`${returnRate}%`} onChange={setReturnRate} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <ResultCard label="Corpus Required" value={fmt(corpus)} primary />
        <ResultCard label="Monthly SIP Needed" value={`₹${Math.round(sipNeeded).toLocaleString('en-IN')}`} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <ResultCard label="Years to Retire" value={`${years} yrs`} />
        <ResultCard label="Adj. Expenses/mo" value={`₹${Math.round(monthlyRetireExp).toLocaleString('en-IN')}`} positive={false} />
      </div>
    </Modal>
  );
};

const BudgetModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [income, setIncome] = useState(100000);
  const needs = Math.round(income * 0.50); const wants = Math.round(income * 0.30); const savings = Math.round(income * 0.20);
  const categories = [
    { name: 'Housing / Rent', budget: Math.round(needs * 0.4), spent: Math.round(needs * 0.38) },
    { name: 'Food & Groceries', budget: Math.round(needs * 0.25), spent: Math.round(needs * 0.28) },
    { name: 'Transport', budget: Math.round(needs * 0.15), spent: Math.round(needs * 0.12) },
    { name: 'Entertainment', budget: Math.round(wants * 0.4), spent: Math.round(wants * 0.45) },
    { name: 'Shopping', budget: Math.round(wants * 0.6), spent: Math.round(wants * 0.55) },
  ];
  return (
    <Modal title="Budget Planner" subtitle="50/30/20 Rule monthly allocator" icon={<PieChart size={20} color={C.accent} />} onClose={onClose}>
      <Slider label="Monthly Income (₹)" value={income} min={20000} max={1000000} step={5000} display={`₹${income.toLocaleString('en-IN')}`} onChange={setIncome} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
        <ResultCard label="Needs (50%)" value={fmt(needs)} />
        <ResultCard label="Wants (30%)" value={fmt(wants)} />
        <ResultCard label="Savings (20%)" value={fmt(savings)} primary />
      </div>
      {categories.map(cat => {
        const pct = Math.min(100, Math.round((cat.spent / cat.budget) * 100)); const over = cat.spent > cat.budget;
        return (
          <div key={cat.name} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 13, color: C.text2 }}>{cat.name}</span>
              <span style={{ fontSize: 12, color: over ? C.red : C.text3 }}>₹{cat.spent.toLocaleString()} / ₹{cat.budget.toLocaleString()}</span>
            </div>
            <div style={{ height: 8, background: C.border, borderRadius: 4 }}>
              <div style={{ height: 8, width: `${pct}%`, background: over ? C.red : C.accent, borderRadius: 4, transition: 'width 0.4s' }} />
            </div>
          </div>
        );
      })}
    </Modal>
  );
};

const GoalsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const goals = [
    { name: '🏠 Home Purchase', target: 8000000, saved: 2200000, monthly: 25000, deadline: '2027' },
    { name: '🎓 Child Education', target: 5000000, saved: 1800000, monthly: 8000, deadline: '2030' },
    { name: '🌴 Retirement', target: 30000000, saved: 8500000, monthly: 30000, deadline: '2045' },
    { name: '🚨 Emergency Fund', target: 600000, saved: 580000, monthly: 5000, deadline: 'Done' },
    { name: '✈️ Europe Trip', target: 400000, saved: 120000, monthly: 15000, deadline: '2025' },
  ];
  return (
    <Modal title="Financial Goals Tracker" subtitle="Multi-goal savings progress" icon={<Award size={20} color={C.accent} />} onClose={onClose}>
      {goals.map((g, i) => {
        const pct = Math.round((g.saved / g.target) * 100);
        return (
          <div key={i} style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 18px', marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{g.name}</div>
                <div style={{ fontSize: 12, color: C.text3 }}>Target: {fmt(g.target)} · SIP: ₹{g.monthly.toLocaleString()} · By {g.deadline}</div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: pct >= 100 ? C.accent : C.text }}>{pct}%</div>
            </div>
            <div style={{ height: 10, background: C.border, borderRadius: 5, marginBottom: 8 }}>
              <div style={{ height: 10, width: `${Math.min(100, pct)}%`, background: pct >= 100 ? C.accent : `linear-gradient(90deg,${C.accent3},${C.accent})`, borderRadius: 5, transition: 'width 0.6s' }} />
            </div>
            <div style={{ fontSize: 12, color: C.text3 }}>Saved: {fmt(g.saved)} · Remaining: {fmt(g.target - g.saved)}</div>
          </div>
        );
      })}
    </Modal>
  );
};

const DebtModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [extra, setExtra] = useState(5000); const [method, setMethod] = useState<'snowball' | 'avalanche'>('avalanche');
  const debts = [
    { name: 'Credit Card', balance: 80000, rate: 36, minPayment: 3200 },
    { name: 'Personal Loan', balance: 250000, rate: 14, minPayment: 6000 },
    { name: 'Car Loan', balance: 350000, rate: 9.5, minPayment: 7500 },
  ];
  const totalDebt = debts.reduce((s, d) => s + d.balance, 0);
  const totalMin = debts.reduce((s, d) => s + d.minPayment, 0);
  const months = Math.ceil(totalDebt / (totalMin + extra) * 1.3);
  return (
    <Modal title="Debt Payoff Planner" subtitle="Snowball vs Avalanche strategy" icon={<CreditCard size={20} color={C.accent} />} onClose={onClose}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['snowball', 'avalanche'] as const).map(m => (
          <button key={m} onClick={() => setMethod(m)} style={{ flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, background: method === m ? C.accentBg2 : C.bg3, border: `1px solid ${method === m ? C.accent : C.border}`, color: method === m ? C.accent : C.text2 }}>
            {m === 'snowball' ? '❄️ Snowball' : '🏔 Avalanche'}
          </button>
        ))}
      </div>
      {debts.map(d => (
        <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 10, marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{d.name}</div>
            <div style={{ fontSize: 12, color: C.text3 }}>Min: ₹{d.minPayment.toLocaleString()}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>₹{d.balance.toLocaleString()}</div>
            <div style={{ fontSize: 12, color: C.red }}>{d.rate}% p.a.</div>
          </div>
        </div>
      ))}
      <Slider label="Extra Monthly Payment (₹)" value={extra} min={0} max={50000} step={500} display={`₹${extra.toLocaleString()}`} onChange={setExtra} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <ResultCard label="Total Debt" value={fmt(totalDebt)} />
        <ResultCard label="Months to Pay Off" value={`${months} mo`} primary />
        <ResultCard label="Interest Saved" value={fmt(extra * months * 0.4)} positive />
      </div>
    </Modal>
  );
};

const EmergencyModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [exp, setExp] = useState(60000); const [months, setMonths] = useState(6); const [saved, setSaved] = useState(100000);
  const target = exp * months; const pct = Math.round((saved / target) * 100);
  return (
    <Modal title="Emergency Fund Calculator" subtitle="Build your financial safety net" icon={<Heart size={20} color={C.accent} />} onClose={onClose}>
      <Slider label="Monthly Expenses (₹)" value={exp} min={20000} max={200000} step={5000} display={`₹${exp.toLocaleString('en-IN')}`} onChange={setExp} />
      <Slider label="Months of Coverage" value={months} min={3} max={12} step={1} display={`${months} months`} onChange={setMonths} />
      <Slider label="Already Saved (₹)" value={saved} min={0} max={target} step={10000} display={fmt(saved)} onChange={setSaved} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <ResultCard label="Target Fund" value={fmt(target)} primary />
        <ResultCard label="Still Needed" value={fmt(Math.max(0, target - saved))} positive={saved >= target} />
      </div>
      <div style={{ background: C.bg3, borderRadius: 12, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: C.text2 }}>Progress</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: pct >= 100 ? C.accent : C.text }}>{Math.min(100, pct)}%</span>
        </div>
        <div style={{ height: 16, background: C.border, borderRadius: 8 }}>
          <div style={{ height: 16, width: `${Math.min(100, pct)}%`, background: pct >= 100 ? C.accent : `linear-gradient(90deg,${C.accent3},${C.accent})`, borderRadius: 8, transition: 'width 0.6s' }} />
        </div>
      </div>
    </Modal>
  );
};

const EducationModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [childAge, setChildAge] = useState(3); const [educationAge, setEducationAge] = useState(18); const [cost, setCost] = useState(2000000); const [returnRate, setReturnRate] = useState(12);
  const years = educationAge - childAge; const futureCost = cost * Math.pow(1.07, years);
  const r = returnRate / 12 / 100; const n = years * 12;
  const sip = futureCost * r / (Math.pow(1 + r, n) - 1);
  return (
    <Modal title="Education Fund Planner" subtitle="Child education corpus planning" icon={<GraduationCap size={20} color={C.accent} />} onClose={onClose}>
      <Slider label="Child's Current Age" value={childAge} min={0} max={15} step={1} display={`${childAge} yrs`} onChange={setChildAge} />
      <Slider label="Age at Education Start" value={educationAge} min={16} max={22} step={1} display={`${educationAge} yrs`} onChange={setEducationAge} />
      <Slider label="Current Education Cost (₹)" value={cost} min={500000} max={10000000} step={100000} display={fmt(cost)} onChange={setCost} />
      <Slider label="Expected Return (% p.a.)" value={returnRate} min={6} max={18} step={0.5} display={`${returnRate}%`} onChange={setReturnRate} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <ResultCard label="Years to Plan" value={`${years} yrs`} />
        <ResultCard label="Future Cost" value={fmt(futureCost)} primary />
        <ResultCard label="Monthly SIP" value={`₹${Math.round(sip).toLocaleString('en-IN')}`} />
      </div>
    </Modal>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ══════════════════════════════════════════════════════════════════════════════
const CreditModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [score, setScore] = useState(720); const [utilization, setUtilization] = useState(30); const [latePayments, setLatePayments] = useState(0);
  const adjScore = Math.max(300, Math.min(900, score - utilization * 1.5 - latePayments * 50));
  const band = adjScore >= 800 ? { label: 'Excellent', color: C.accent } : adjScore >= 700 ? { label: 'Good', color: '#84cc16' } : adjScore >= 600 ? { label: 'Fair', color: C.yellow } : { label: 'Poor', color: C.red };
  return (
    <Modal title="Credit Score Simulator" subtitle="Score impact analysis" icon={<Star size={20} color={C.accent} />} onClose={onClose}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 56, fontWeight: 900, color: band.color, fontFamily: 'monospace', lineHeight: 1 }}>{Math.round(adjScore)}</div>
        <div style={{ fontSize: 16, color: band.color, marginTop: 6, fontWeight: 700 }}>{band.label}</div>
        <div style={{ fontSize: 12, color: C.text3, marginTop: 4 }}>Out of 900 · CIBIL Scale</div>
      </div>
      <Slider label="Base Credit Score" value={score} min={300} max={900} step={10} display={`${score}`} onChange={setScore} />
      <Slider label="Credit Utilization (%)" value={utilization} min={0} max={100} step={5} display={`${utilization}%`} onChange={setUtilization} />
      <Slider label="Late Payments (last 2 yrs)" value={latePayments} min={0} max={5} step={1} display={`${latePayments}`} onChange={setLatePayments} />
    </Modal>
  );
};

const RiskModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [equity, setEquity] = useState(60); const [debt, setDebt] = useState(30);
  const gold = Math.max(0, 100 - equity - debt);
  const riskScore = Math.round(equity * 0.1 * 10) / 10;
  const expectedReturn = equity * 0.12 + debt * 0.07 + gold * 0.08;
  const riskLabel = riskScore >= 7 ? 'Aggressive' : riskScore >= 5 ? 'Moderate' : 'Conservative';
  const segments = [{ label: 'Equity', pct: equity, color: C.accent }, { label: 'Debt', pct: debt, color: C.blue }, { label: 'Gold', pct: gold, color: C.yellow }];
  return (
    <Modal title="Investment Risk Analyzer" subtitle="Portfolio risk & return assessment" icon={<Shield size={20} color={C.accent} />} onClose={onClose}>
      <Slider label="Equity Allocation (%)" value={equity} min={0} max={100} step={5} display={`${equity}%`} onChange={v => { setEquity(v); if (v + debt > 100) setDebt(100 - v); }} />
      <Slider label="Debt Allocation (%)" value={debt} min={0} max={100 - equity} step={5} display={`${debt}%`} onChange={setDebt} />
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <DonutChart data={segments.filter(s => s.pct > 0)} size={140} />
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 20 }}>
        {segments.map(s => <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color }} /><span style={{ color: C.text3 }}>{s.label}: <strong style={{ color: s.color }}>{s.pct}%</strong></span></div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <ResultCard label="Risk Score" value={`${riskScore}/10`} />
        <ResultCard label="Risk Profile" value={riskLabel} primary />
        <ResultCard label="Expected Return" value={`${expectedReturn.toFixed(1)}% p.a.`} positive />
      </div>
    </Modal>
  );
};

const PortfolioModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [equity, setEquity] = useState(55); const [largeCapPct, setLargeCapPct] = useState(60);
  const largeCap = Math.round(equity * largeCapPct / 100); const midSmall = equity - largeCap;
  const debt = Math.min(35, Math.max(0, 80 - equity)); const gold = Math.max(0, 100 - equity - debt - 5); const intl = 5;
  const score = equity <= 40 ? 'Conservative' : equity <= 65 ? 'Balanced' : 'Aggressive';
  const segments = [{ label: 'Large Cap', pct: largeCap, color: C.accent }, { label: 'Mid/Small', pct: midSmall, color: C.accent3 }, { label: 'Debt', pct: debt, color: C.blue }, { label: 'Gold', pct: gold, color: C.yellow }, { label: 'International', pct: intl, color: '#8b5cf6' }].filter(s => s.pct > 0);
  return (
    <Modal title="Portfolio Diversification" subtitle="Asset allocation optimizer" icon={<PieChart size={20} color={C.accent} />} onClose={onClose}>
      <Slider label="Total Equity Allocation (%)" value={equity} min={20} max={90} step={5} display={`${equity}%`} onChange={setEquity} />
      <Slider label="Large Cap within Equity (%)" value={largeCapPct} min={30} max={80} step={5} display={`${largeCapPct}%`} onChange={setLargeCapPct} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20 }}>
        <DonutChart data={segments} size={140} />
        <div style={{ flex: 1 }}>
          {segments.map(s => (
            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.text2 }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color }} />{s.label}</span>
              <span style={{ fontWeight: 700, color: s.color }}>{s.pct}%</span>
            </div>
          ))}
          <div style={{ marginTop: 10, padding: '8px 12px', background: C.accentBg, borderRadius: 8, textAlign: 'center', fontSize: 13, fontWeight: 700, color: C.accent }}>Profile: {score}</div>
        </div>
      </div>
    </Modal>
  );
};

const NetWorthModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [equity, setEquity] = useState(2500000); const [mf, setMf] = useState(1800000); const [fd, setFd] = useState(500000); const [property, setProperty] = useState(8000000);
  const [homeLoan, setHomeLoan] = useState(5000000); const [carLoan, setCarLoan] = useState(400000);
  const totalAssets = equity + mf + fd + property; const totalLiab = homeLoan + carLoan; const netWorth = totalAssets - totalLiab;
  return (
    <Modal title="Net Worth Tracker" subtitle="Assets vs Liabilities" icon={<Briefcase size={20} color={C.accent} />} onClose={onClose}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Assets</div>
      <Slider label="Stocks / Equity" value={equity} min={0} max={10000000} step={100000} display={fmt(equity)} onChange={setEquity} />
      <Slider label="Mutual Funds" value={mf} min={0} max={10000000} step={100000} display={fmt(mf)} onChange={setMf} />
      <Slider label="Fixed Deposits" value={fd} min={0} max={5000000} step={50000} display={fmt(fd)} onChange={setFd} />
      <Slider label="Property Value" value={property} min={0} max={50000000} step={500000} display={fmt(property)} onChange={setProperty} />
      <div style={{ fontSize: 12, fontWeight: 700, color: C.red, marginBottom: 10, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Liabilities</div>
      <Slider label="Home Loan Outstanding" value={homeLoan} min={0} max={10000000} step={100000} display={fmt(homeLoan)} onChange={setHomeLoan} />
      <Slider label="Car Loan Outstanding" value={carLoan} min={0} max={2000000} step={50000} display={fmt(carLoan)} onChange={setCarLoan} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <ResultCard label="Total Assets" value={fmt(totalAssets)} positive />
        <ResultCard label="Total Liabilities" value={fmt(totalLiab)} positive={false} />
        <ResultCard label="Net Worth" value={fmt(netWorth)} primary />
      </div>
    </Modal>
  );
};

const FIREModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [age, setAge] = useState(30); const [monthlyExp, setMonthlyExp] = useState(60000); const [savings, setSavings] = useState(2500000); const [monthlyInv, setMonthlyInv] = useState(30000); const [ret, setRet] = useState(12);
  const corpus = monthlyExp * 12 * 25; const r = ret / 100;
  let yr = 0, curr = savings;
  while (curr < corpus && yr < 600) { curr = curr * (1 + r / 12) + monthlyInv; yr++; }
  const yrsToFire = Math.round(yr / 12); const fireAge = age + yrsToFire;
  const projData = Array.from({ length: Math.min(yrsToFire + 2, 35) }, (_, i) => Math.round(savings * Math.pow(1 + r, i) + monthlyInv * 12 * ((Math.pow(1 + r, i) - 1) / r)));
  return (
    <Modal title="FIRE Calculator" subtitle="Financial Independence, Retire Early" icon={<Zap size={20} color={C.accent} />} onClose={onClose}>
      <Slider label="Current Age" value={age} min={20} max={55} step={1} display={`${age}`} onChange={setAge} />
      <Slider label="Monthly Expenses (₹)" value={monthlyExp} min={20000} max={300000} step={5000} display={`₹${monthlyExp.toLocaleString()}`} onChange={setMonthlyExp} />
      <Slider label="Current Savings (₹)" value={savings} min={0} max={10000000} step={100000} display={fmt(savings)} onChange={setSavings} />
      <Slider label="Monthly Investment (₹)" value={monthlyInv} min={5000} max={200000} step={5000} display={`₹${monthlyInv.toLocaleString()}`} onChange={setMonthlyInv} />
      <Slider label="Expected Return (% p.a.)" value={ret} min={6} max={20} step={0.5} display={`${ret}%`} onChange={setRet} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
        <ResultCard label="FIRE Corpus (25x)" value={fmt(corpus)} primary />
        <ResultCard label="FIRE Age" value={`${fireAge} yrs`} />
        <ResultCard label="Years to FIRE" value={`${yrsToFire} yrs`} positive />
      </div>
      <div style={{ background: C.bg3, borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 12, color: C.text3, marginBottom: 8 }}>Corpus Growth Trajectory</div>
        <LineChartSVG data={projData} labels={projData.map((_, i) => i % 5 === 0 ? `Yr${i}` : '')} color={C.accent} height={120} />
      </div>
    </Modal>
  );
};

const SavingsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [income, setIncome] = useState(100000); const [housing, setHousing] = useState(25000); const [food, setFood] = useState(12000); const [transport, setTransport] = useState(6000); const [entertainment, setEntertainment] = useState(8000);
  const totalExp = housing + food + transport + entertainment; const savings = income - totalExp;
  const savingsRate = Math.round((savings / income) * 100); const investedAt12 = savings * 12 * 10 * 1.3;
  return (
    <Modal title="Savings Rate Optimizer" subtitle="Maximize your savings potential" icon={<DollarSign size={20} color={C.accent} />} onClose={onClose}>
      <Slider label="Monthly Income (₹)" value={income} min={30000} max={500000} step={5000} display={`₹${income.toLocaleString()}`} onChange={setIncome} />
      <Slider label="Housing / Rent (₹)" value={housing} min={5000} max={100000} step={1000} display={`₹${housing.toLocaleString()}`} onChange={setHousing} />
      <Slider label="Food & Groceries (₹)" value={food} min={3000} max={50000} step={500} display={`₹${food.toLocaleString()}`} onChange={setFood} />
      <Slider label="Transport (₹)" value={transport} min={1000} max={30000} step={500} display={`₹${transport.toLocaleString()}`} onChange={setTransport} />
      <Slider label="Entertainment (₹)" value={entertainment} min={0} max={50000} step={500} display={`₹${entertainment.toLocaleString()}`} onChange={setEntertainment} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <ResultCard label="Monthly Savings" value={fmt(savings)} primary />
        <ResultCard label="Savings Rate" value={`${savingsRate}%`} positive={savingsRate >= 20} />
        <ResultCard label="10yr Corpus" value={fmt(investedAt12)} />
      </div>
    </Modal>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MODAL REGISTRY
// ══════════════════════════════════════════════════════════════════════════════
const MODAL_MAP: Record<string, React.FC<{ onClose: () => void }>> = {
  stocks: StockModal, crypto: CryptoModal, forex: ForexModal,
  commodities: CommoditiesModal, news: NewsModal, indices: IndicesModal,
  sip: SIPModal, emi: EMIModal, compound: CompoundModal, tax: TaxModal,
  fd: FDModal, rd: RDModal, ppf: PPFModal, inflation: InflationModal,
  mortgage: MortgageModal, carloan: CarLoanModal,
  retirement: RetirementModal, budget: BudgetModal, goals: GoalsModal,
  debt: DebtModal, education: EducationModal, emergency: EmergencyModal,
  credit: CreditModal, risk: RiskModal, portfolio: PortfolioModal,
  networth: NetWorthModal, fire: FIREModal, savings: SavingsModal,
};

// ══════════════════════════════════════════════════════════════════════════════
// CATEGORY CONFIG
// ══════════════════════════════════════════════════════════════════════════════
const categoryMeta: Record<string, { label: string; emoji: string; desc: string }> = {
  market:     { label: 'Market Data',   emoji: '📡', desc: 'Live prices, charts & news' },
  calculator: { label: 'Calculators',   emoji: '🧮', desc: 'Smart financial calculations' },
  planner:    { label: 'Planners',      emoji: '🎯', desc: 'Goal-based financial planning' },
  analytics:  { label: 'Analytics',     emoji: '🔬', desc: 'Portfolio insights & scores' },
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
const Extras: React.FC = () => {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const cats = ['all', 'market', 'calculator', 'planner', 'analytics'];
  const filtered = features.filter(f => {
    const matchCat = category === 'all' || f.category === category;
    const matchSearch = f.title.toLowerCase().includes(search.toLowerCase()) || f.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const ActiveModal = activeFeature ? MODAL_MAP[activeFeature] : null;

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        input[type=range] { -webkit-appearance: none; appearance: none; height: 4px; border-radius: 2px; outline: none; background: ${C.border}; cursor: pointer; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: ${C.accent}; cursor: pointer; box-shadow: 0 0 0 3px ${C.accentBg}; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: ${C.border2}; border-radius: 2px; }
        select option { background: ${C.bg3}; }
        .tool-card:hover { border-color: ${C.accent3} !important; transform: translateY(-3px); box-shadow: 0 8px 32px rgba(34,197,94,0.1); }
        .tool-card { transition: all 0.2s ease !important; }
      `}</style>

      {/* HEADER */}
      <div style={{ background: C.bg2, borderBottom: `1px solid ${C.border}`, padding: '0 32px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, background: '#1a3a2a', border: `1px solid ${C.accent3}`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} color={C.accent} />
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>Moneymind</span>
            <span style={{ fontSize: 11, color: C.accent, background: C.accentBg, padding: '2px 8px', borderRadius: 4, border: `1px solid ${C.accent3}`, fontWeight: 600 }}>EXTRAS</span>
          </div>
          <div style={{ display: 'flex', gap: 24, fontSize: 12, color: C.text3 }}>
            {[['28', 'Tools'], ['6', 'Live'], ['4', 'Categories']].map(([v, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.accent, lineHeight: 1 }}>{v}</div>
                <div style={{ marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HERO */}
      <div style={{ background: `linear-gradient(180deg, ${C.bg2} 0%, ${C.bg} 100%)`, padding: '48px 32px 40px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 32, marginBottom: 32 }}>
            <div>
              <h1 style={{ fontSize: 44, fontWeight: 900, margin: '0 0 10px', color: C.text, letterSpacing: '-1.5px', lineHeight: 1 }}>
                Financial Tools <span style={{ color: C.accent }}>Suite</span>
              </h1>
              <p style={{ fontSize: 16, color: C.text2, margin: 0, maxWidth: 480, lineHeight: 1.6 }}>
                28+ professional tools — live market data, smart calculators, goal planners & portfolio analytics.
              </p>
            </div>
            {/* Stats row */}
            <div style={{ display: 'flex', gap: 16 }}>
              {[{ v: '₹2.4Cr', l: 'Max corpus calc' }, { v: '12+', l: 'Currencies' }, { v: '6', l: 'Live feeds' }].map(s => (
                <div key={s.l} style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 18px', textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: C.accent }}>{s.v}</div>
                  <div style={{ fontSize: 11, color: C.text3, marginTop: 3 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Search + filters row */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 320px', maxWidth: 480 }}>
              <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: C.text3, pointerEvents: 'none' }} />
              <input type="text" placeholder="Search tools, calculators, planners…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: '12px 14px 12px 42px', background: C.bg3, border: `1px solid ${C.border2}`, borderRadius: 12, color: C.text, fontSize: 14, outline: 'none' }}
                onFocus={e => (e.target.style.borderColor = C.accent3)}
                onBlur={e => (e.target.style.borderColor = C.border2)} />
              {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.text3 }}><X size={14} /></button>}
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {cats.map(cat => {
                const meta = categoryMeta[cat];
                const count = cat === 'all' ? features.length : features.filter(f => f.category === cat).length;
                return (
                  <button key={cat} onClick={() => setCategory(cat)} style={{
                    display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px',
                    background: category === cat ? C.accentBg2 : C.bg3,
                    border: `1px solid ${category === cat ? C.accent : C.border}`,
                    borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                    color: category === cat ? C.accent : C.text3,
                  }}>
                    {meta && <span>{meta.emoji}</span>}
                    {meta ? meta.label : 'All'}
                    <span style={{ fontSize: 11, background: category === cat ? 'rgba(34,197,94,0.2)' : C.border, padding: '1px 7px', borderRadius: 10, color: category === cat ? C.accent : C.text3, fontWeight: 700 }}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* GRID */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '36px 32px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: C.text3 }}>
            <Search size={40} style={{ marginBottom: 16, opacity: 0.3 }} />
            <div style={{ fontSize: 18, fontWeight: 600, color: C.text2 }}>No tools found</div>
            <div style={{ fontSize: 14, marginTop: 8 }}>Try a different search term</div>
          </div>
        ) : (
          (category === 'all' ? ['market', 'calculator', 'planner', 'analytics'] : [category]).map(cat => {
            const catFeatures = filtered.filter(f => f.category === cat);
            if (catFeatures.length === 0) return null;
            const meta = categoryMeta[cat];
            return (
              <div key={cat} style={{ marginBottom: 48 }}>
                {/* Section header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 22 }}>{meta.emoji}</span>
                    <div>
                      <h2 style={{ fontSize: 17, fontWeight: 700, color: C.text, margin: 0, lineHeight: 1 }}>{meta.label}</h2>
                      <div style={{ fontSize: 12, color: C.text3, marginTop: 2 }}>{meta.desc}</div>
                    </div>
                  </div>
                  <div style={{ height: 1, flex: 1, background: C.border }} />
                  <span style={{ fontSize: 12, color: C.text3, background: C.bg3, padding: '4px 10px', borderRadius: 6, border: `1px solid ${C.border}` }}>{catFeatures.length} tools</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16 }}>
                  {catFeatures.map(feature => {
                    const Icon = feature.icon;
                    const hasModal = !!MODAL_MAP[feature.id];
                    const isHovered = hoveredId === feature.id;
                    return (
                      <div
                        key={feature.id}
                        className="tool-card"
                        onClick={() => hasModal && setActiveFeature(feature.id)}
                        onMouseEnter={() => setHoveredId(feature.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        style={{
                          position: 'relative', padding: '20px', background: C.bg2,
                          border: `1px solid ${C.border}`, borderRadius: 14,
                          cursor: hasModal ? 'pointer' : 'default',
                        }}
                      >
                        {/* Top accent bar */}
                        <div style={{ position: 'absolute', top: 0, left: 20, right: 20, height: 2, background: hasModal ? `linear-gradient(90deg, ${C.accent3}, ${C.accent})` : C.border, borderRadius: '0 0 4px 4px', opacity: isHovered ? 1 : 0.4, transition: 'opacity 0.2s' }} />

                        {feature.badge && (
                          <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: C.accent, fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 5, letterSpacing: '0.8px' }}>
                            <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.accent, animation: 'pulse 2s infinite' }} />
                            {feature.badge}
                          </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
                          <div style={{ width: 44, height: 44, background: isHovered ? C.accentBg2 : C.bg3, border: `1px solid ${isHovered ? C.accent3 : C.border}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                            <Icon size={20} color={isHovered ? C.accent : C.text3} />
                          </div>
                          <div>
                            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: '0 0 4px', paddingRight: feature.badge ? 60 : 0 }}>{feature.title}</h3>
                            <p style={{ fontSize: 12, color: C.text3, margin: 0, lineHeight: 1.5 }}>{feature.description}</p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                          <span style={{ fontSize: 11, color: C.text3, background: C.bg3, padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.5px', border: `1px solid ${C.border}` }}>
                            {feature.category}
                          </span>
                          {hasModal && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: isHovered ? C.accent : C.text3, fontWeight: 600, transition: 'color 0.2s' }}>
                              Open <ChevronRight size={13} />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ACTIVE MODAL */}
      {ActiveModal && <ActiveModal onClose={() => setActiveFeature(null)} />}
    </div>
  );
};

export default Extras;