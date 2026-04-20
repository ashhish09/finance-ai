import { useState, useRef, useEffect, useCallback } from "react";
import {
  useGetAiCoachQuery,
  useAiChatMutation,
  useVoiceChatMutation,
} from "@/features/ai-coach/aiCoachAPI";

// ─── Types ────────────────────────────────────────────────────────────────────
type Mode = "friendly" | "strict" | "investor";
type Tab = "insights" | "chat" | "voice" | "loan";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  ts: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const MODES: Record<Mode, { label: string; icon: string; color: string; desc: string }> = {
  friendly: { label: "Friendly", icon: "✦", color: "#34d399", desc: "Supportive & encouraging" },
  strict:   { label: "Strict",   icon: "◆", color: "#f87171", desc: "No-nonsense discipline" },
  investor: { label: "Investor", icon: "◈", color: "#a78bfa", desc: "Wealth-building focus" },
};

const QUICK_PROMPTS = [
  "How can I improve my savings rate?",
  "Where am I overspending?",
  "Should I start investing?",
  "Give me a monthly budget plan",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
// 🇮🇳 UPDATED: Full digits with rupee, no rounding
const fmtINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

const fmtINR2 = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

// ─── Rich Message Renderer ────────────────────────────────────────────────────
function RichMessage({ text, modeColor }: { text: string; modeColor: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let tableBuffer: string[] = [];
  let listBuffer: string[] = [];
  let i = 0;

  const flushTable = (key: string) => {
    if (tableBuffer.length < 2) { tableBuffer = []; return; }
    const rows = tableBuffer.map(r => r.split("|").map(c => c.trim()).filter(Boolean));
    const head = rows[0];
    const body = rows.slice(2);
    elements.push(
      <div key={key} style={{ overflowX: "auto", margin: "10px 0" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              {head.map((h, hi) => (
                <th key={hi} style={{
                  padding: "8px 12px", textAlign: "left",
                  background: `${modeColor}18`,
                  color: modeColor,
                  fontWeight: 600, fontSize: 12,
                  textTransform: "uppercase", letterSpacing: "0.06em",
                  borderBottom: `1px solid ${modeColor}30`,
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, ri) => (
              <tr key={ri} style={{ borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
                {row.map((cell, ci) => (
                  <td key={ci} style={{
                    padding: "8px 12px", color: "rgba(255,255,255,0.78)",
                    fontSize: 13, lineHeight: 1.5,
                  }}>
                    <InlineFormat text={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableBuffer = [];
  };

  const flushList = (key: string) => {
    if (!listBuffer.length) return;
    elements.push(
      <ul key={key} style={{ margin: "6px 0", paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
        {listBuffer.map((item, li) => (
          <li key={li} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.55 }}>
            <span style={{ color: modeColor, marginTop: 2, flexShrink: 0, fontSize: 10 }}>◆</span>
            <InlineFormat text={item} />
          </li>
        ))}
      </ul>
    );
    listBuffer = [];
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("|")) {
      if (listBuffer.length) flushList(`list-${i}`);
      tableBuffer.push(line);
      i++; continue;
    } else if (tableBuffer.length) {
      flushTable(`table-${i}`);
    }

    if (/^\d+\.\s/.test(line)) {
      if (listBuffer.length) flushList(`list-${i}`);
      const num = line.match(/^(\d+)\./)?.[1];
      const content = line.replace(/^\d+\.\s*/, "");
      elements.push(
        <div key={`num-${i}`} style={{ display: "flex", gap: 10, margin: "8px 0 4px", alignItems: "flex-start" }}>
          <span style={{
            background: `${modeColor}22`, color: modeColor,
            width: 22, height: 22, borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1,
          }}>{num}</span>
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 1.55 }}>
            <InlineFormat text={content} />
          </span>
        </div>
      );
      i++; continue;
    }

    if (/^[-•*]\s/.test(line)) {
      listBuffer.push(line.replace(/^[-•*]\s*/, ""));
      i++; continue;
    } else if (listBuffer.length) {
      flushList(`list-${i}`);
    }

    if (line.startsWith("### ")) {
      elements.push(
        <p key={`h3-${i}`} style={{ margin: "12px 0 4px", fontSize: 13, fontWeight: 600, color: modeColor, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          {line.replace(/^###\s*/, "")}
        </p>
      );
      i++; continue;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <p key={`h2-${i}`} style={{ margin: "14px 0 6px", fontSize: 15, fontWeight: 700, color: "#fff" }}>
          {line.replace(/^##\s*/, "")}
        </p>
      );
      i++; continue;
    }

    if (/^---+$/.test(line.trim())) {
      elements.push(<div key={`hr-${i}`} style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "10px 0" }} />);
      i++; continue;
    }

    if (!line.trim()) {
      elements.push(<div key={`br-${i}`} style={{ height: 6 }} />);
      i++; continue;
    }

    elements.push(
      <p key={`p-${i}`} style={{ margin: "4px 0", fontSize: 14, color: "rgba(255,255,255,0.82)", lineHeight: 1.65 }}>
        <InlineFormat text={line} />
      </p>
    );
    i++;
  }

  if (tableBuffer.length) flushTable("table-end");
  if (listBuffer.length) flushList("list-end");

  return <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>{elements}</div>;
}

function InlineFormat({ text }: { text: string }) {
  const cleaned = text
    .replace(/^\*\*(Finora AI|AI Coach|Coach)\*\*:\s*/i, "")
    .replace(/^(Finora AI|AI Coach|Coach):\s*/i, "");

  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = regex.exec(cleaned)) !== null) {
    if (m.index > last) parts.push(cleaned.slice(last, m.index));
    const raw = m[0];
    if (raw.startsWith("**")) {
      parts.push(<strong key={m.index} style={{ color: "#fff", fontWeight: 600 }}>{raw.slice(2, -2)}</strong>);
    } else if (raw.startsWith("*")) {
      parts.push(<em key={m.index} style={{ color: "rgba(255,255,255,0.7)", fontStyle: "italic" }}>{raw.slice(1, -1)}</em>);
    } else if (raw.startsWith("`")) {
      parts.push(
        <code key={m.index} style={{
          background: "rgba(255,255,255,0.1)", color: "#fbbf24",
          padding: "1px 6px", borderRadius: 4, fontSize: 12, fontFamily: "monospace",
        }}>{raw.slice(1, -1)}</code>
      );
    }
    last = m.index + raw.length;
  }
  if (last < cleaned.length) parts.push(cleaned.slice(last));
  return <>{parts}</>;
}

// ─── Animated Counter ──────────────────────────────────────────────────────────
function AnimatedCounter({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      setCount(Math.floor(Math.min(start, target)));
      if (start >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <>{count}</>;
}

// ─── Feature Card (Hero Stats) ─────────────────────────────────────────────────
function FeatureCard({ 
  icon, 
  title, 
  value, 
  subtitle, 
  accent, 
  trend,
  isLoading,
  onClick,
}: { 
  icon: string; 
  title: string; 
  value: string | number;
  subtitle?: string;
  accent: string;
  trend?: { direction: "up" | "down"; percent: number };
  isLoading?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        position: "relative",
        background: `linear-gradient(135deg, ${accent}08 0%, ${accent}02 100%)`,
        border: `1.5px solid ${accent}25`,
        borderRadius: 20,
        padding: "24px",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.3s cubic-bezier(0.25,1,0.5,1)",
        overflow: "hidden",
        transform: onClick ? "scale(1)" : "none",
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          (e.currentTarget as HTMLElement).style.transform = "scale(1.02)";
          (e.currentTarget as HTMLElement).style.borderColor = `${accent}50`;
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          (e.currentTarget as HTMLElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLElement).style.borderColor = `${accent}25`;
        }
      }}
    >
      {/* Gradient background glow */}
      <div style={{
        position: "absolute",
        top: -40,
        right: -40,
        width: 200,
        height: 200,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${accent}15 0%, transparent 70%)`,
        filter: "blur(40px)",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: `${accent}12`,
            border: `1px solid ${accent}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
          }}>
            {icon}
          </div>
          {trend && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "4px 8px",
              background: trend.direction === "up" ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              color: trend.direction === "up" ? "#34d399" : "#f87171",
            }}>
              {trend.direction === "up" ? "↗" : "↘"} {trend.percent}%
            </div>
          )}
        </div>

        <p style={{ margin: "0 0 6px", fontSize: 13, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
          {title}
        </p>

        {isLoading ? (
          <div style={{ height: 32, background: "rgba(255,255,255,0.05)", borderRadius: 8, animation: "pulse 2s ease-in-out infinite" }} />
        ) : (
          <>
            <p style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 700, color: accent }}>
              {typeof value === "number" ? fmtINR(value) : value}
            </p>
            {subtitle && (
              <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                {subtitle}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Circular Progress Ring ────────────────────────────────────────────────────
function CircularProgress({ score, label }: { score: number; label: string }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    let frame = 0;
    const timer = setInterval(() => {
      frame++;
      setDisplayed(Math.round((score * frame) / 60));
      if (frame >= 60) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [score]);

  const color = score >= 70 ? "#34d399" : score >= 40 ? "#fbbf24" : "#f87171";
  const r = 48, circ = 2 * Math.PI * r, dash = (displayed / 100) * circ;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ position: "relative", width: 140, height: 140 }}>
        <svg width={140} height={140} style={{ transform: "rotate(-90deg)", filter: "drop-shadow(0 0 20px rgba(0,0,0,0.3))" }}>
          <circle cx={70} cy={70} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={9} />
          <circle cx={70} cy={70} r={r} fill="none" stroke={color} strokeWidth={9}
            strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
            style={{ 
              filter: `drop-shadow(0 0 12px ${color}60)`,
              transition: "stroke-dasharray 0.3s ease-out"
            }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 42, fontWeight: 700, color, lineHeight: 1 }}>{displayed}</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", marginTop: 4 }}>/ 100</span>
        </div>
      </div>
      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>
        {label}
      </span>
    </div>
  );
}

// ─── Insight Feature Card ──────────────────────────────────────────────────────
function InsightCard({ text }: { text: string }) {
  const isAlert = text.includes("🚨") || text.includes("⚠️");
  const isGood = text.includes("✅") || text.includes("🎯");
  const emoji = text.match(/^[\p{Emoji}]/u)?.[0] ?? "•";
  const content = text.replace(/^[\p{Emoji}\s]*/u, "");

  const accentColor = isAlert ? "#f87171" : isGood ? "#34d399" : "#60a5fa";

  return (
    <div style={{
      position: "relative",
      background: `linear-gradient(135deg, ${accentColor}08 0%, ${accentColor}02 100%)`,
      border: `1.5px solid ${accentColor}25`,
      borderRadius: 18,
      padding: "24px",
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.25,1,0.5,1)",
      overflow: "hidden",
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLElement).style.transform = "scale(1.02)";
      (e.currentTarget as HTMLElement).style.borderColor = `${accentColor}50`;
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLElement).style.transform = "scale(1)";
      (e.currentTarget as HTMLElement).style.borderColor = `${accentColor}25`;
    }}
    >
      {/* Gradient background glow */}
      <div style={{
        position: "absolute",
        top: -40,
        right: -40,
        width: 180,
        height: 180,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${accentColor}15 0%, transparent 70%)`,
        filter: "blur(40px)",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: `${accentColor}15`,
            border: `1px solid ${accentColor}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            flexShrink: 0,
          }}>
            {emoji}
          </div>
        </div>
        <p style={{ 
          margin: "0 0 8px", 
          fontSize: 13, 
          color: accentColor, 
          textTransform: "uppercase", 
          letterSpacing: "0.1em",
          fontWeight: 700,
        }}>
          {isAlert ? "⚠️ Alert" : isGood ? "✨ Great" : "📊 Insight"}
        </p>
        <p style={{ 
          margin: 0, 
          fontSize: 14, 
          color: "rgba(255,255,255,0.8)", 
          lineHeight: 1.7,
        }}>
          {content}
        </p>
      </div>
    </div>
  );
}

// ─── Expense Ratio Bar ─────────────────────────────────────────────────────────
function ExpenseRatioBar({ ratio, modeColor }: { ratio: number; modeColor: string }) {
  const status = ratio > 80 ? "warning" : ratio > 60 ? "caution" : "healthy";
  const statusColor = status === "warning" ? "#ef4444" : status === "caution" ? "#fbbf24" : "#34d399";
  const statusText = status === "warning" ? "High spending" : status === "caution" ? "Moderate spending" : "Excellent control";

  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: "1.5px solid rgba(255,255,255,0.08)",
      borderRadius: 18,
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      gap: 16,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
          Expense Ratio
        </span>
        <div style={{
          fontSize: 20,
          fontWeight: 700,
          color: statusColor,
          display: "flex",
          alignItems: "baseline",
          gap: 6,
        }}>
          {ratio}%
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 400 }}>{statusText}</span>
        </div>
      </div>
      <div style={{ position: "relative", height: 12, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div style={{
          height: "100%",
          borderRadius: 99,
          width: `${Math.min(ratio, 100)}%`,
          background: statusColor,
          transition: "width 1.2s cubic-bezier(0.25,1,0.5,1)",
          boxShadow: `0 0 16px ${statusColor}60`,
        }} />
      </div>
    </div>
  );
}

// ─── Loan Calculator ──────────────────────────────────────────────────────────
function LoanCalculator({ modeColor }: { modeColor: string }) {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(60);
  const [missedMonths, setMissedMonths] = useState(0);
  const [penaltyRate, setPenaltyRate] = useState(2);

  const monthlyRate = rate / 100 / 12;
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenure) /
    (Math.pow(1 + monthlyRate, tenure) - 1);
  const totalPayable = emi * tenure;
  const totalInterest = totalPayable - principal;
  const penaltyAmount = missedMonths * emi * (penaltyRate / 100);
  const missedInterest = missedMonths * emi * (rate / 100 / 12) * 12;
  const totalCostIfMissed = totalPayable + penaltyAmount + missedInterest;

  const schedule: { month: number; emi: number; principal: number; interest: number; balance: number }[] = [];
  let balance = principal;
  for (let m = 1; m <= Math.min(tenure, 12); m++) {
    const int = balance * monthlyRate;
    const prin = emi - int;
    balance -= prin;
    schedule.push({ month: m, emi, principal: prin, interest: int, balance: Math.max(0, balance) });
  }

  const Slider = ({ label, value, min, max, step, onChange, fmt }: any) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 13 }}>
        <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>{label}</span>
        <span style={{ color: modeColor, fontWeight: 700, fontSize: 14 }}>{fmt(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: modeColor }} />
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Controls */}
      <div style={{
        background: "rgba(255,255,255,0.03)", border: "1.5px solid rgba(255,255,255,0.08)",
        borderRadius: 20, padding: "28px",
      }}>
        <p style={{ margin: "0 0 24px", fontSize: 14, color: modeColor, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em" }}>
          ⚙️ Loan Parameters
        </p>
        <Slider label="Loan Amount" value={principal} min={10000} max={5000000} step={5000}
          onChange={setPrincipal} fmt={(v: number) => fmtINR(v)} />
        <Slider label="Annual Interest Rate" value={rate} min={1} max={30} step={0.1}
          onChange={setRate} fmt={(v: number) => `${v.toFixed(1)}%`} />
        <Slider label="Tenure (months)" value={tenure} min={6} max={360} step={6}
          onChange={setTenure} fmt={(v: number) => `${v} mo`} />

        <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "24px 0" }} />
        <p style={{ margin: "0 0 16px", fontSize: 12, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
          ⚠️ Missed Payment Simulator
        </p>
        <Slider label="Missed EMIs" value={missedMonths} min={0} max={12} step={1}
          onChange={setMissedMonths} fmt={(v: number) => `${v} months`} />
        <Slider label="Penalty Rate" value={penaltyRate} min={0} max={10} step={0.5}
          onChange={setPenaltyRate} fmt={(v: number) => `${v}%`} />
      </div>

      {/* Summary cards - Feature style */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
        <FeatureCard 
          icon="💳" 
          title="Monthly EMI" 
          value={fmtINR2(emi)} 
          accent="#60a5fa"
        />
        <FeatureCard 
          icon="📊" 
          title="Total Interest" 
          value={fmtINR(totalInterest)} 
          accent="#f87171"
        />
        <FeatureCard 
          icon="💰" 
          title="Total Payable" 
          value={fmtINR(totalPayable)} 
          accent="#fbbf24"
        />
        <FeatureCard 
          icon="📈" 
          title="Interest Ratio" 
          value={`${((totalInterest / totalPayable) * 100).toFixed(1)}%`}
          accent="#a78bfa"
        />
      </div>

      {/* Missed payment impact */}
      {missedMonths > 0 && (
        <div style={{
          background: "linear-gradient(135deg, rgba(248,113,113,0.08) 0%, rgba(248,113,113,0.02) 100%)",
          border: "1.5px solid rgba(248,113,113,0.25)",
          borderRadius: 20, padding: "28px",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "radial-gradient(circle, #f8717160 0%, transparent 70%)",
            filter: "blur(40px)",
            pointerEvents: "none",
          }} />
          <p style={{ margin: "0 0 20px", fontSize: 15, color: "#f87171", fontWeight: 700 }}>
            🚨 Impact of {missedMonths} Missed Payment{missedMonths > 1 ? "s" : ""}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, position: "relative", zIndex: 1 }}>
            {[
              { label: "Penalty Charges", value: fmtINR2(penaltyAmount) },
              { label: "Extra Interest", value: fmtINR2(missedInterest) },
              { label: "Total Extra Cost", value: fmtINR2(penaltyAmount + missedInterest) },
              { label: "New Total Cost", value: fmtINR(totalCostIfMissed) },
            ].map(({ label, value }) => (
              <div key={label} style={{
                background: "rgba(248,113,113,0.08)",
                border: "1px solid rgba(248,113,113,0.15)",
                borderRadius: 12,
                padding: "14px 16px",
              }}>
                <p style={{ margin: 0, fontSize: 11, color: "rgba(248,113,113,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                  {label}
                </p>
                <p style={{ margin: "6px 0 0", fontSize: 18, fontWeight: 700, color: "#f87171" }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Amortization table */}
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1.5px solid rgba(255,255,255,0.07)", borderRadius: 20, overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
            📋 Amortization Schedule
          </span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                {["Month", "EMI", "Principal", "Interest", "Balance"].map(h => (
                  <th key={h} style={{
                    padding: "14px 18px", textAlign: "right", fontWeight: 700, fontSize: 11,
                    color: modeColor, textTransform: "uppercase", letterSpacing: "0.08em",
                    background: `${modeColor}0d`,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {schedule.map(row => (
                <tr key={row.month} style={{ borderBottom: "0.5px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "12px 18px", textAlign: "right", color: modeColor, fontWeight: 700 }}>{row.month}</td>
                  <td style={{ padding: "12px 18px", textAlign: "right", color: "rgba(255,255,255,0.6)" }}>{fmtINR2(row.emi)}</td>
                  <td style={{ padding: "12px 18px", textAlign: "right", color: "#34d399", fontWeight: 600 }}>{fmtINR2(row.principal)}</td>
                  <td style={{ padding: "12px 18px", textAlign: "right", color: "#f87171", fontWeight: 600 }}>{fmtINR2(row.interest)}</td>
                  <td style={{ padding: "12px 18px", textAlign: "right", color: "rgba(255,255,255,0.4)" }}>{fmtINR2(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const AiCoach = () => {
  const [tab, setTab] = useState<Tab>("insights");
  const [mode, setMode] = useState<Mode>("friendly");
  const [chatInput, setChatInput] = useState("");
  const [voiceInput, setVoiceInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [voiceReply, setVoiceReply] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRecognition);
  }, []);

  const { data: coachData, isLoading: insightsLoading, refetch } = useGetAiCoachQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [sendChat, { isLoading: chatLoading }] = useAiChatMutation();
  const [sendVoice, { isLoading: voiceLoading }] = useVoiceChatMutation();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, chatLoading]);

  const toggleListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    let finalTranscript = "";

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += t;
        else interim = t;
      }
      setVoiceInput((prev) => finalTranscript || prev + interim);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => {
      setIsListening(false);
      if (finalTranscript) setVoiceInput(finalTranscript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isListening]);

  const handleChat = useCallback(async () => {
    const msg = chatInput.trim();
    if (!msg || chatLoading) return;
    setChatInput("");
    setChatHistory(h => [...h, { role: "user", text: msg, ts: Date.now() }]);
    try {
      const res = await sendChat({ message: msg, mode }).unwrap();
      setChatHistory(h => [...h, { role: "assistant", text: res.reply, ts: Date.now() }]);
    } catch {
      setChatHistory(h => [...h, { role: "assistant", text: "Something went wrong. Please try again.", ts: Date.now() }]);
    }
  }, [chatInput, chatLoading, mode, sendChat]);

  const handleVoice = useCallback(async () => {
    const msg = voiceInput.trim();
    if (!msg || voiceLoading) return;
    setVoiceReply(null);
    try {
      const res = await sendVoice({ message: msg, mode }).unwrap();
      setVoiceReply(res.reply);
    } catch {
      setVoiceReply("Something went wrong. Please try again.");
    }
  }, [voiceInput, voiceLoading, mode, sendVoice]);

  const insights = coachData?.data;
  const modeColor = MODES[mode].color;

  const TABS = [
    { id: "insights" as Tab, label: "Insights", icon: "◈" },
    { id: "chat"     as Tab, label: "AI Chat",  icon: "◎" },
    { id: "voice"    as Tab, label: "Voice",    icon: "◉" },
    { id: "loan"     as Tab, label: "Loan Calc",icon: "◇" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0a0f 0%, #0d1117 60%, #0a0f1a 100%)",
      color: "#fff",
      fontFamily: "'Outfit', 'DM Sans', system-ui, sans-serif",
      padding: "2.5rem 1.5rem 5rem",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 24, marginBottom: "2.5rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: `linear-gradient(135deg, ${modeColor}18 0%, ${modeColor}08 100%)`,
                border: `1.5px solid ${modeColor}35`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, transition: "all 0.3s",
              }}>{MODES[mode].icon}</div>
              <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em" }}>AI Coach</h1>
            </div>
            <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.35)" }}>
              {MODES[mode].desc} · Powered by Gemini
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(Object.entries(MODES) as [Mode, typeof MODES[Mode]][]).map(([m, cfg]) => (
              <button key={m} onClick={() => setMode(m)} style={{
                padding: "10px 18px", borderRadius: 12,
                border: mode === m ? `1.5px solid ${cfg.color}50` : "1.5px solid rgba(255,255,255,0.08)",
                background: mode === m ? `${cfg.color}15` : "rgba(255,255,255,0.03)",
                color: mode === m ? cfg.color : "rgba(255,255,255,0.4)",
                cursor: "pointer", fontSize: 13, fontWeight: mode === m ? 700 : 500, transition: "all 0.2s",
              }}>
                {cfg.icon} {cfg.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{
          display: "flex", gap: 3,
          background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.07)",
          borderRadius: 14, padding: 5, marginBottom: "2.25rem", width: "fit-content",
        }}>
          {TABS.map(({ id, label, icon }) => (
            <button key={id} onClick={() => setTab(id)} style={{
              padding: "10px 22px", borderRadius: 10, border: "none",
              background: tab === id ? `${modeColor}16` : "transparent",
              color: tab === id ? modeColor : "rgba(255,255,255,0.35)",
              cursor: "pointer", fontSize: 13, fontWeight: tab === id ? 700 : 500, transition: "all 0.2s",
              outline: tab === id ? `1.5px solid ${modeColor}28` : "none",
            }}>
              {icon} {label}
            </button>
          ))}
        </div>

        {/* ════════════════ INSIGHTS ════════════════════════════════════════════ */}
        {tab === "insights" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {insightsLoading ? (
              <div style={{ textAlign: "center", padding: "6rem", color: "rgba(255,255,255,0.25)", fontSize: 14 }}>
                <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.3 }}>◈</div>
                Analyzing your finances…
              </div>
            ) : !insights ? (
              <div style={{ textAlign: "center", padding: "6rem", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
                Failed to load.{" "}
                <button onClick={() => refetch()} style={{ background: "none", border: "none", color: modeColor, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
                  ↻ Retry
                </button>
              </div>
            ) : (
              <>
                {/* Top section: Score + Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 32, alignItems: "start" }}>
                  <CircularProgress score={insights.score} label="Financial Score" />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
                    <FeatureCard
                      icon="💵"
                      title="Total Income"
                      value={insights.summary?.income ?? 0}
                      accent="#34d399"
                      trend={{ direction: "up", percent: 8 }}
                    />
                    <FeatureCard
                      icon="📊"
                      title="Total Expense"
                      value={insights.summary?.expense ?? 0}
                      accent="#f87171"
                      trend={{ direction: "down", percent: 3 }}
                    />
                    <FeatureCard
                      icon="🎯"
                      title="Total Savings"
                      value={insights.summary?.savings ?? 0}
                      subtitle={(insights.summary as any).savingsRate ? `${(insights.summary as any).savingsRate}% rate` : undefined}
                      accent="#60a5fa"
                      trend={{ direction: "up", percent: 12 }}
                    />
                    {insights.topCategory && (
                      <FeatureCard
                        icon="🛒"
                        title="Top Spend"
                        value={insights.topCategory.name}
                        subtitle={fmtINR(insights.topCategory.amount)}
                        accent="#fbbf24"
                      />
                    )}
                  </div>
                </div>

                {/* Expense ratio */}
                {(insights.summary as any)?.expenseRatio !== undefined && (
                  <ExpenseRatioBar ratio={(insights.summary as any).expenseRatio} modeColor={modeColor} />
                )}

                {/* Insights as features */}
                <div>
                  <h3 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 800, color: "rgba(255,255,255,0.95)", letterSpacing: "-0.02em" }}>
                    ✨ Key Insights
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                    {insights.insights.map((ins, i) => (
                      <InsightCard key={i} text={ins} />
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => refetch()}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "12px 28px",
                    border: `1.5px solid ${modeColor}35`, 
                    borderRadius: 12,
                    background: `${modeColor}12`,
                    color: modeColor,
                    cursor: "pointer", 
                    fontSize: 13,
                    fontWeight: 600,
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = `${modeColor}18`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = `${modeColor}12`;
                  }}
                >
                  ↻ Refresh Insights
                </button>
              </>
            )}
          </div>
        )}

        {/* ════════════════ CHAT ═══════════════════════════════════════════════ */}
        {tab === "chat" && (
          <div>
            <div style={{
              background: "rgba(255,255,255,0.02)", border: "1.5px solid rgba(255,255,255,0.07)",
              borderRadius: 20, padding: "20px",
              minHeight: 380, maxHeight: 520, overflowY: "auto",
              display: "flex", flexDirection: "column", gap: 16, marginBottom: 16,
            }}>
              {chatHistory.length === 0 && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, padding: "2rem 0" }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: 16,
                    background: `${modeColor}12`, border: `1.5px solid ${modeColor}28`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32,
                  }}>◎</div>
                  <p style={{ margin: 0, color: "rgba(255,255,255,0.25)", fontSize: 14, textAlign: "center", maxWidth: 300 }}>
                    Ask your AI Coach anything about your finances
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
                    {QUICK_PROMPTS.map(p => (
                      <button key={p} onClick={() => setChatInput(p)} style={{
                        padding: "8px 14px", borderRadius: 8,
                        border: `1px solid ${modeColor}28`, background: `${modeColor}08`,
                        color: `${modeColor}cc`, cursor: "pointer", fontSize: 12, fontWeight: 500,
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = `${modeColor}15`;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = `${modeColor}08`;
                      }}
                      >{p}</button>
                    ))}
                  </div>
                </div>
              )}

              {chatHistory.map(msg => (
                <div key={msg.ts} style={{
                  display: "flex", flexDirection: "column", gap: 6,
                  alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                }}>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.18)", paddingInline: 4 }}>
                    {msg.role === "user" ? "You" : "AI Coach"}
                  </span>
                  <div style={{
                    maxWidth: msg.role === "assistant" ? "90%" : "75%",
                    padding: "14px 18px",
                    borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    background: msg.role === "user" ? `${modeColor}15` : "rgba(255,255,255,0.05)",
                    border: msg.role === "user" ? `1px solid ${modeColor}25` : "1px solid rgba(255,255,255,0.08)",
                  }}>
                    {msg.role === "assistant"
                      ? <RichMessage text={msg.text} modeColor={modeColor} />
                      : <p style={{ margin: 0, fontSize: 14, color: "#fff", lineHeight: 1.6 }}>{msg.text}</p>
                    }
                  </div>
                </div>
              ))}

              {chatLoading && (
                <div style={{ alignSelf: "flex-start" }}>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.18)", paddingInline: 4, display: "block", marginBottom: 6 }}>AI Coach</span>
                  <div style={{
                    padding: "14px 18px", borderRadius: "18px 18px 18px 4px",
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex", gap: 6, alignItems: "center",
                  }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: 8, height: 8, borderRadius: "50%", background: modeColor,
                        animation: "pulse 1.4s ease-in-out infinite",
                        animationDelay: `${i * 0.2}s`,
                      }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleChat()}
                placeholder="Ask your AI Coach…"
                disabled={chatLoading}
                style={{
                  flex: 1, padding: "14px 18px", borderRadius: 12,
                  border: "1.5px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 14, outline: "none",
                  transition: "all 0.2s",
                }}
                onFocus={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                }}
                onBlur={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                }}
              />
              <button onClick={handleChat} disabled={chatLoading || !chatInput.trim()} style={{
                padding: "14px 28px", borderRadius: 12,
                border: `1.5px solid ${modeColor}40`, background: `${modeColor}15`,
                color: modeColor, cursor: "pointer", fontSize: 14, fontWeight: 700,
                opacity: chatLoading || !chatInput.trim() ? 0.4 : 1, transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!chatLoading && chatInput.trim()) {
                  (e.currentTarget as HTMLElement).style.background = `${modeColor}20`;
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = `${modeColor}15`;
              }}
              >
                Send ↗
              </button>
            </div>
          </div>
        )}

        {/* ════════════════ VOICE ══════════════════════════════════════════════ */}
        {tab === "voice" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", justifyContent: "center", padding: "2rem 0" }}>
              <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {isListening && [1, 2, 3].map(i => (
                  <div key={i} style={{
                    position: "absolute", width: 90 + i * 35, height: 90 + i * 35,
                    borderRadius: "50%", border: `1.5px solid ${modeColor}${["25", "18", "0a"][i - 1]}`,
                    animation: "ping 1.8s ease-out infinite", animationDelay: `${i * 0.3}s`,
                  }} />
                ))}
                <button
                  onClick={toggleListening}
                  disabled={!speechSupported}
                  title={speechSupported ? (isListening ? "Click to stop" : "Click to speak") : "Speech not supported"}
                  style={{
                    width: 100, height: 100, borderRadius: "50%",
                    background: isListening ? `${modeColor}20` : "rgba(255,255,255,0.06)",
                    border: `2.5px solid ${isListening ? modeColor : "rgba(255,255,255,0.12)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 40, cursor: speechSupported ? "pointer" : "not-allowed",
                    transition: "all 0.3s",
                    boxShadow: isListening ? `0 0 50px ${modeColor}40` : "0 0 30px rgba(0,0,0,0.2)",
                    color: isListening ? modeColor : "rgba(255,255,255,0.6)",
                  }}
                >
                  {isListening ? "⏹" : "🎤"}
                </button>
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              {!speechSupported ? (
                <p style={{ color: "#f87171", fontSize: 13, margin: 0, fontWeight: 500 }}>
                  ⚠️ Speech recognition not supported. Use Chrome or Edge.
                </p>
              ) : isListening ? (
                <p style={{ color: modeColor, fontSize: 14, margin: 0, fontWeight: 600 }}>
                  🎤 Listening… speak now, click ⏹ to stop
                </p>
              ) : (
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, margin: 0 }}>
                  Click the mic to speak, or type below
                </p>
              )}
            </div>

            <textarea
              rows={3}
              value={voiceInput}
              onChange={e => setVoiceInput(e.target.value)}
              disabled={voiceLoading}
              placeholder="Your spoken text will appear here…"
              style={{
                width: "100%", padding: "16px 18px", borderRadius: 14,
                border: "1.5px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.04)", color: "#fff",
                fontSize: 14, resize: "none", outline: "none",
                boxSizing: "border-box", lineHeight: 1.65, transition: "all 0.2s",
              }}
              onFocus={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)";
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
              }}
              onBlur={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
              }}
            />

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => { setVoiceInput(""); setVoiceReply(null); }} style={{
                padding: "12px 24px", borderRadius: 12, flex: "none",
                border: "1.5px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)",
                color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 13, fontWeight: 600,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
              }}
              >
                Clear
              </button>
              <button onClick={handleVoice} disabled={voiceLoading || !voiceInput.trim()} style={{
                padding: "12px", borderRadius: 12, flex: 1,
                border: `1.5px solid ${modeColor}35`, background: `${modeColor}12`,
                color: modeColor, cursor: "pointer", fontSize: 15, fontWeight: 700,
                opacity: voiceLoading || !voiceInput.trim() ? 0.4 : 1, transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!voiceLoading && voiceInput.trim()) {
                  (e.currentTarget as HTMLElement).style.background = `${modeColor}18`;
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = `${modeColor}12`;
              }}
              >
                {voiceLoading ? "Processing…" : "◉ Get AI Reply"}
              </button>
            </div>

            {voiceReply && (
              <div style={{
                background: `${modeColor}08`, border: `1.5px solid ${modeColor}20`,
                borderRadius: 18, padding: "24px", position: "relative", overflow: "hidden",
              }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${modeColor}80, transparent)` }} />
                <span style={{ fontSize: 11, color: `${modeColor}70`, textTransform: "uppercase", letterSpacing: "0.12em", display: "block", marginBottom: 14, fontWeight: 700 }}>
                  💬 AI Coach says
                </span>
                <RichMessage text={voiceReply} modeColor={modeColor} />
              </div>
            )}
          </div>
        )}

        {/* ════════════════ LOAN CALCULATOR ════════════════════════════════════ */}
        {tab === "loan" && <LoanCalculator modeColor={modeColor} />}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        @keyframes pulse {
          0%, 100% { transform: scale(0.6); opacity: 0.4; }
          50% { transform: scale(1); opacity: 1; }
        }
        @keyframes ping {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        textarea::placeholder, input::placeholder { color: rgba(255,255,255,0.15) !important; }
        input[type=range] { height: 5px; cursor: pointer; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18); }
      `}</style>
    </div>
  );
};

export default AiCoach;