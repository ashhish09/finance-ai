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
const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const fmtUSD2 = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

// ─── Rich Message Renderer ────────────────────────────────────────────────────
// Converts markdown-like AI responses into clean structured HTML elements
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
    const body = rows.slice(2); // skip separator row
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

    // Table row
    if (line.startsWith("|")) {
      if (listBuffer.length) flushList(`list-${i}`);
      tableBuffer.push(line);
      i++; continue;
    } else if (tableBuffer.length) {
      flushTable(`table-${i}`);
    }

    // Numbered list item (e.g. "1. **Title**")
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

    // Bullet list
    if (/^[-•*]\s/.test(line)) {
      listBuffer.push(line.replace(/^[-•*]\s*/, ""));
      i++; continue;
    } else if (listBuffer.length) {
      flushList(`list-${i}`);
    }

    // Heading (### or ##)
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

    // Divider
    if (/^---+$/.test(line.trim())) {
      elements.push(<div key={`hr-${i}`} style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "10px 0" }} />);
      i++; continue;
    }

    // Empty line
    if (!line.trim()) {
      elements.push(<div key={`br-${i}`} style={{ height: 6 }} />);
      i++; continue;
    }

    // Normal paragraph
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

// Inline: **bold**, *italic*, `code`, remove markdown artifacts
function InlineFormat({ text }: { text: string }) {
  // Strip "**Finora AI:**" or "**AI Coach:**" prefix patterns
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

// ─── Score Ring ───────────────────────────────────────────────────────────────
function AnimatedScore({ score }: { score: number }) {
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
  const r = 52, circ = 2 * Math.PI * r, dash = (displayed / 100) * circ;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: 136, height: 136 }}>
        <svg width={136} height={136} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={68} cy={68} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10} />
          <circle cx={68} cy={68} r={r} fill="none" stroke={color} strokeWidth={10}
            strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 8px ${color}80)` }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 32, fontWeight: 700, color, lineHeight: 1 }}>{displayed}</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em" }}>/100</span>
        </div>
      </div>
      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Financial Score</span>
    </div>
  );
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent: string }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)",
      borderRadius: 16, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 4,
      borderLeft: `3px solid ${accent}`,
    }}>
      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.12em" }}>{label}</span>
      <span style={{ fontSize: 20, fontWeight: 600, color: "#fff", letterSpacing: "-0.02em" }}>{value}</span>
      {sub && <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{sub}</span>}
    </div>
  );
}

function InsightPill({ text }: { text: string }) {
  const isAlert = text.includes("🚨") || text.includes("⚠️");
  const isGood = text.includes("✅") || text.includes("🎯");
  const emoji = text.match(/^[\p{Emoji}]/u)?.[0] ?? "•";
  const content = text.replace(/^[\p{Emoji}\s]*/u, "");
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 14,
      padding: "14px 18px",
      background: isAlert ? "rgba(248,113,113,0.06)" : isGood ? "rgba(52,211,153,0.06)" : "rgba(255,255,255,0.03)",
      border: `0.5px solid ${isAlert ? "rgba(248,113,113,0.2)" : isGood ? "rgba(52,211,153,0.2)" : "rgba(255,255,255,0.07)"}`,
      borderRadius: 12,
    }}>
      <span style={{
        fontSize: 16, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
        background: isAlert ? "rgba(248,113,113,0.12)" : isGood ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.06)",
        borderRadius: 8, flexShrink: 0,
      }}>{emoji}</span>
      <span style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, paddingTop: 4 }}>{content}</span>
    </div>
  );
}

// ─── Loan Calculator ──────────────────────────────────────────────────────────
function LoanCalculator({ modeColor }: { modeColor: string }) {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(60); // months
  const [missedMonths, setMissedMonths] = useState(0);
  const [penaltyRate, setPenaltyRate] = useState(2); // % extra on missed EMI

  const monthlyRate = rate / 100 / 12;
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenure) /
    (Math.pow(1 + monthlyRate, tenure) - 1);
  const totalPayable = emi * tenure;
  const totalInterest = totalPayable - principal;
  const penaltyAmount = missedMonths * emi * (penaltyRate / 100);
  const missedInterest = missedMonths * emi * (rate / 100 / 12) * 12;
  const totalCostIfMissed = totalPayable + penaltyAmount + missedInterest;

  // Amortization (first 12 months)
  const schedule: { month: number; emi: number; principal: number; interest: number; balance: number }[] = [];
  let balance = principal;
  for (let m = 1; m <= Math.min(tenure, 12); m++) {
    const int = balance * monthlyRate;
    const prin = emi - int;
    balance -= prin;
    schedule.push({ month: m, emi, principal: prin, interest: int, balance: Math.max(0, balance) });
  }

  const Slider = ({ label, value, min, max, step, onChange, fmt }: any) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
        <span style={{ color: "rgba(255,255,255,0.5)" }}>{label}</span>
        <span style={{ color: modeColor, fontWeight: 600 }}>{fmt(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: modeColor }} />
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Controls */}
      <div style={{
        background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)",
        borderRadius: 18, padding: "22px 24px",
      }}>
        <p style={{ margin: "0 0 18px", fontSize: 13, color: modeColor, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Loan Parameters
        </p>
        <Slider label="Loan Amount" value={principal} min={10000} max={5000000} step={5000}
          onChange={setPrincipal} fmt={(v: number) => fmtUSD(v)} />
        <Slider label="Annual Interest Rate" value={rate} min={1} max={30} step={0.1}
          onChange={setRate} fmt={(v: number) => `${v.toFixed(1)}%`} />
        <Slider label="Tenure (months)" value={tenure} min={6} max={360} step={6}
          onChange={setTenure} fmt={(v: number) => `${v} mo (${Math.round(v / 12 * 10) / 10} yr)`} />

        <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "20px 0" }} />
        <p style={{ margin: "0 0 14px", fontSize: 12, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Missed Payment Simulator
        </p>
        <Slider label="Missed EMIs" value={missedMonths} min={0} max={12} step={1}
          onChange={setMissedMonths} fmt={(v: number) => `${v} months`} />
        <Slider label="Penalty Rate (on missed EMI)" value={penaltyRate} min={0} max={10} step={0.5}
          onChange={setPenaltyRate} fmt={(v: number) => `${v}%`} />
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
        {[
          { label: "Monthly EMI", value: fmtUSD2(emi), accent: modeColor },
          { label: "Total Interest", value: fmtUSD(totalInterest), accent: "#f87171" },
          { label: "Total Payable", value: fmtUSD(totalPayable), accent: "#fbbf24" },
          { label: "Interest Ratio", value: `${((totalInterest / totalPayable) * 100).toFixed(1)}%`, accent: "#a78bfa" },
        ].map(({ label, value, accent }) => (
          <div key={label} style={{
            background: "rgba(255,255,255,0.04)", border: `0.5px solid ${accent}30`,
            borderRadius: 14, padding: "16px 18px", borderLeft: `3px solid ${accent}`,
          }}>
            <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</p>
            <p style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 700, color: accent }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Missed payment impact */}
      {missedMonths > 0 && (
        <div style={{
          background: "rgba(248,113,113,0.07)", border: "0.5px solid rgba(248,113,113,0.25)",
          borderRadius: 16, padding: "18px 20px",
        }}>
          <p style={{ margin: "0 0 14px", fontSize: 13, color: "#f87171", fontWeight: 600 }}>
            🚨 Impact of {missedMonths} Missed Payment{missedMonths > 1 ? "s" : ""}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { label: "Penalty Charges", value: fmtUSD2(penaltyAmount) },
              { label: "Extra Interest", value: fmtUSD2(missedInterest) },
              { label: "Total Extra Cost", value: fmtUSD2(penaltyAmount + missedInterest) },
              { label: "New Total Cost", value: fmtUSD(totalCostIfMissed) },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={{ margin: 0, fontSize: 11, color: "rgba(248,113,113,0.6)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
                <p style={{ margin: "2px 0 0", fontSize: 16, fontWeight: 600, color: "#f87171" }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Amortization table */}
      <div style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Amortization Schedule (First {Math.min(tenure, 12)} months)
          </span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                {["Month", "EMI", "Principal", "Interest", "Balance"].map(h => (
                  <th key={h} style={{
                    padding: "10px 14px", textAlign: "right", fontWeight: 600, fontSize: 11,
                    color: modeColor, textTransform: "uppercase", letterSpacing: "0.06em",
                    background: `${modeColor}0d`,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {schedule.map(row => (
                <tr key={row.month} style={{ borderBottom: "0.5px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "9px 14px", textAlign: "right", color: modeColor, fontWeight: 600 }}>{row.month}</td>
                  <td style={{ padding: "9px 14px", textAlign: "right", color: "rgba(255,255,255,0.7)" }}>{fmtUSD2(row.emi)}</td>
                  <td style={{ padding: "9px 14px", textAlign: "right", color: "#34d399" }}>{fmtUSD2(row.principal)}</td>
                  <td style={{ padding: "9px 14px", textAlign: "right", color: "#f87171" }}>{fmtUSD2(row.interest)}</td>
                  <td style={{ padding: "9px 14px", textAlign: "right", color: "rgba(255,255,255,0.5)" }}>{fmtUSD2(row.balance)}</td>
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

  // Check speech API support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRecognition);
  }, []);

  // ── API ──────────────────────────────────────────────────────────────────────
  const { data: coachData, isLoading: insightsLoading, refetch } = useGetAiCoachQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [sendChat, { isLoading: chatLoading }] = useAiChatMutation();
  const [sendVoice, { isLoading: voiceLoading }] = useVoiceChatMutation();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, chatLoading]);

  // ── Speech to text ────────────────────────────────────────────────────────
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

  // ── Chat ─────────────────────────────────────────────────────────────────
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

  // ── Voice submit ─────────────────────────────────────────────────────────
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
      fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
      padding: "2rem 1.5rem 5rem",
    }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: "2.25rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 11,
                background: `${modeColor}18`, border: `1px solid ${modeColor}35`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, transition: "all 0.3s",
              }}>{MODES[mode].icon}</div>
              <h1 style={{ margin: 0, fontSize: 27, fontWeight: 700, letterSpacing: "-0.03em" }}>AI Coach</h1>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.38)" }}>
              {MODES[mode].desc} · Powered by Gemini
            </p>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {(Object.entries(MODES) as [Mode, typeof MODES[Mode]][]).map(([m, cfg]) => (
              <button key={m} onClick={() => setMode(m)} style={{
                padding: "8px 16px", borderRadius: 999,
                border: mode === m ? `1px solid ${cfg.color}50` : "1px solid rgba(255,255,255,0.08)",
                background: mode === m ? `${cfg.color}14` : "rgba(255,255,255,0.04)",
                color: mode === m ? cfg.color : "rgba(255,255,255,0.45)",
                cursor: "pointer", fontSize: 13, fontWeight: mode === m ? 600 : 400, transition: "all 0.2s",
              }}>
                {cfg.icon} {cfg.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{
          display: "flex", gap: 2,
          background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.07)",
          borderRadius: 14, padding: 4, marginBottom: "1.75rem", width: "fit-content",
        }}>
          {TABS.map(({ id, label, icon }) => (
            <button key={id} onClick={() => setTab(id)} style={{
              padding: "9px 20px", borderRadius: 10, border: "none",
              background: tab === id ? `${modeColor}18` : "transparent",
              color: tab === id ? modeColor : "rgba(255,255,255,0.4)",
              cursor: "pointer", fontSize: 13, fontWeight: tab === id ? 600 : 400, transition: "all 0.2s",
              outline: tab === id ? `1px solid ${modeColor}28` : "none",
            }}>
              {icon} {label}
            </button>
          ))}
        </div>

        {/* ════════════════ INSIGHTS ════════════════════════════════════════════ */}
        {tab === "insights" && (
          <div>
            {insightsLoading ? (
              <div style={{ textAlign: "center", padding: "5rem", color: "rgba(255,255,255,0.25)", fontSize: 14 }}>
                <div style={{ fontSize: 36, marginBottom: 14, opacity: 0.4 }}>◈</div>Analyzing your finances…
              </div>
            ) : !insights ? (
              <div style={{ textAlign: "center", padding: "5rem", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
                Failed to load.{" "}
                <button onClick={() => refetch()} style={{ background: "none", border: "none", color: modeColor, cursor: "pointer" }}>Retry</button>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap", marginBottom: "1.5rem" }}>
                  <AnimatedScore score={insights.score} />
                  {insights.summary && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, flex: 1, minWidth: 270 }}>
                      <StatCard label="Income"   value={fmtUSD(insights.summary.income)}   accent="#34d399" />
                      <StatCard label="Expense"  value={fmtUSD(insights.summary.expense)}  accent="#f87171" />
                      <StatCard label="Savings"  value={fmtUSD(insights.summary.savings)}
                        sub={(insights.summary as any).savingsRate !== undefined ? `${(insights.summary as any).savingsRate}% rate` : undefined}
                        accent="#60a5fa" />
                      {insights.topCategory && (
                        <StatCard label="Top Spend" value={insights.topCategory.name}
                          sub={fmtUSD(insights.topCategory.amount)} accent="#fbbf24" />
                      )}
                    </div>
                  )}
                </div>

                {(insights.summary as any)?.expenseRatio !== undefined && (
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px 20px", marginBottom: "1.25rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 13 }}>
                      <span style={{ color: "rgba(255,255,255,0.45)" }}>Expense ratio</span>
                      <span style={{ color: (insights.summary as any).expenseRatio > 80 ? "#f87171" : "#34d399", fontWeight: 600 }}>
                        {(insights.summary as any).expenseRatio}%
                      </span>
                    </div>
                    <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 99,
                        width: `${Math.min((insights.summary as any).expenseRatio, 100)}%`,
                        background: (insights.summary as any).expenseRatio > 80 ? "#ef4444" : "#10b981",
                        transition: "width 1.2s cubic-bezier(0.25,1,0.5,1)",
                      }} />
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: "1.5rem" }}>
                  {insights.insights.map((ins, i) => <InsightPill key={i} text={ins} />)}
                </div>

                <button
                  onClick={() => refetch()}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "10px 20px",
                    border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 10,
                    background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.45)",
                    cursor: "pointer", fontSize: 13,
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
              background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.07)",
              borderRadius: 20, padding: "1.25rem",
              minHeight: 360, maxHeight: 480, overflowY: "auto",
              display: "flex", flexDirection: "column", gap: 14, marginBottom: 14,
            }}>
              {chatHistory.length === 0 && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: "2rem 0" }}>
                  <div style={{
                    width: 58, height: 58, borderRadius: 16,
                    background: `${modeColor}12`, border: `1px solid ${modeColor}28`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
                  }}>◎</div>
                  <p style={{ margin: 0, color: "rgba(255,255,255,0.3)", fontSize: 14, textAlign: "center" }}>
                    Ask your AI Coach anything about your finances
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                    {QUICK_PROMPTS.map(p => (
                      <button key={p} onClick={() => setChatInput(p)} style={{
                        padding: "8px 14px", borderRadius: 999,
                        border: `0.5px solid ${modeColor}28`, background: `${modeColor}08`,
                        color: `${modeColor}bb`, cursor: "pointer", fontSize: 12,
                      }}>{p}</button>
                    ))}
                  </div>
                </div>
              )}

              {chatHistory.map(msg => (
                <div key={msg.ts} style={{
                  display: "flex", flexDirection: "column", gap: 4,
                  alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", paddingInline: 4 }}>
                    {msg.role === "user" ? "You" : "AI Coach"}
                  </span>
                  <div style={{
                    maxWidth: msg.role === "assistant" ? "92%" : "78%",
                    padding: "12px 16px",
                    borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    background: msg.role === "user" ? `${modeColor}1a` : "rgba(255,255,255,0.04)",
                    border: msg.role === "user" ? `0.5px solid ${modeColor}35` : "0.5px solid rgba(255,255,255,0.08)",
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
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", paddingInline: 4, display: "block", marginBottom: 4 }}>AI Coach</span>
                  <div style={{
                    padding: "13px 18px", borderRadius: "18px 18px 18px 4px",
                    background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.08)",
                    display: "flex", gap: 5, alignItems: "center",
                  }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: 7, height: 7, borderRadius: "50%", background: modeColor,
                        animation: "acBounce 1.2s ease-in-out infinite",
                        animationDelay: `${i * 0.15}s`,
                      }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleChat()}
                placeholder="Ask your AI Coach…"
                disabled={chatLoading}
                style={{
                  flex: 1, padding: "13px 18px", borderRadius: 14,
                  border: "0.5px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 14, outline: "none",
                }}
              />
              <button onClick={handleChat} disabled={chatLoading || !chatInput.trim()} style={{
                padding: "13px 24px", borderRadius: 14,
                border: `1px solid ${modeColor}45`, background: `${modeColor}18`,
                color: modeColor, cursor: "pointer", fontSize: 14, fontWeight: 600,
                opacity: chatLoading || !chatInput.trim() ? 0.4 : 1, transition: "opacity 0.2s",
              }}>
                Send ↗
              </button>
            </div>
          </div>
        )}

        {/* ════════════════ VOICE ══════════════════════════════════════════════ */}
        {tab === "voice" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Mic orb */}
            <div style={{ display: "flex", justifyContent: "center", padding: "1.5rem 0 0.5rem" }}>
              <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {isListening && [1, 2, 3].map(i => (
                  <div key={i} style={{
                    position: "absolute", width: 80 + i * 30, height: 80 + i * 30,
                    borderRadius: "50%", border: `1px solid ${modeColor}${["30", "20", "10"][i - 1]}`,
                    animation: "acPing 1.6s ease-out infinite", animationDelay: `${i * 0.28}s`,
                  }} />
                ))}
                <button
                  onClick={toggleListening}
                  disabled={!speechSupported}
                  title={speechSupported ? (isListening ? "Click to stop" : "Click to speak") : "Speech not supported in this browser"}
                  style={{
                    width: 90, height: 90, borderRadius: "50%",
                    background: isListening ? `${modeColor}28` : "rgba(255,255,255,0.06)",
                    border: `2px solid ${isListening ? modeColor : "rgba(255,255,255,0.12)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 32, cursor: speechSupported ? "pointer" : "not-allowed",
                    transition: "all 0.3s",
                    boxShadow: isListening ? `0 0 40px ${modeColor}35` : "none",
                    color: isListening ? modeColor : "rgba(255,255,255,0.7)",
                  }}
                >
                  {isListening ? "⏹" : "🎤"}
                </button>
              </div>
            </div>

            {/* Status */}
            <div style={{ textAlign: "center" }}>
              {!speechSupported ? (
                <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>
                  ⚠️ Speech recognition not supported in this browser. Use Chrome or Edge.
                </p>
              ) : isListening ? (
                <p style={{ color: modeColor, fontSize: 14, margin: 0, fontWeight: 500 }}>
                  🎤 Listening… speak now, click ⏹ to stop
                </p>
              ) : (
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: 0 }}>
                  Click the mic to speak, or type your question below
                </p>
              )}
            </div>

            {/* Text area (editable transcript) */}
            <textarea
              rows={3}
              value={voiceInput}
              onChange={e => setVoiceInput(e.target.value)}
              disabled={voiceLoading}
              placeholder="Your spoken text will appear here, or type a question…"
              style={{
                width: "100%", padding: "14px 18px", borderRadius: 16,
                border: "0.5px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.04)", color: "#fff",
                fontSize: 14, resize: "none", outline: "none",
                boxSizing: "border-box", lineHeight: 1.65,
              }}
            />

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { setVoiceInput(""); setVoiceReply(null); }} style={{
                padding: "12px 20px", borderRadius: 14, flex: "none",
                border: "0.5px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)",
                color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 13,
              }}>
                Clear
              </button>
              <button onClick={handleVoice} disabled={voiceLoading || !voiceInput.trim()} style={{
                padding: "13px", borderRadius: 14, flex: 1,
                border: `1px solid ${modeColor}35`, background: `${modeColor}12`,
                color: modeColor, cursor: "pointer", fontSize: 15, fontWeight: 600,
                opacity: voiceLoading || !voiceInput.trim() ? 0.4 : 1, transition: "all 0.2s",
              }}>
                {voiceLoading ? "Processing…" : "◉ Get AI Reply"}
              </button>
            </div>

            {/* Reply */}
            {voiceReply && (
              <div style={{
                background: `${modeColor}08`, border: `1px solid ${modeColor}20`,
                borderRadius: 18, padding: "20px 24px", position: "relative", overflow: "hidden",
              }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${modeColor}80, transparent)` }} />
                <span style={{ fontSize: 11, color: `${modeColor}70`, textTransform: "uppercase", letterSpacing: "0.12em", display: "block", marginBottom: 12 }}>
                  AI Coach says
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
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        @keyframes acBounce {
          0%, 80%, 100% { transform: scale(0.55); opacity: 0.35; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes acPing {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.7); opacity: 0; }
        }
        textarea::placeholder, input::placeholder { color: rgba(255,255,255,0.2) !important; }
        textarea:focus, input:focus {
          border-color: rgba(255,255,255,0.18) !important;
          box-shadow: 0 0 0 3px rgba(255,255,255,0.03) !important;
        }
        input[type=range] { height: 4px; cursor: pointer; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.09); border-radius: 99px; }
      `}</style>
    </div>
  );
};

export default AiCoach;