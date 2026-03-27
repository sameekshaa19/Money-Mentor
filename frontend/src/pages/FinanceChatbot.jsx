/**
 * FinanceChatbot.jsx - HF Serverless Inference API Version
 *
 * Uses Hugging Face Serverless Inference API (free tier: ~300 requests/hour).
 * No model download. Fast responses. Better quality models.
 *
 * GET A FREE HF TOKEN:
 * 1. Go to https://huggingface.co/settings/tokens
 * 2. Create a read token (free, no credit card)
 * 3. Replace "hf_YOUR_TOKEN_HERE" below or set VITE_HF_TOKEN env variable
 */

import { useState, useEffect, useRef, useCallback } from "react";

// Configuration
const HF_TOKEN = import.meta.env.VITE_HF_TOKEN || "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";
const MODEL_ID = "mistralai/Mistral-7B-Instruct-v0.3";

// System Prompt Builder
function buildSystemPrompt(context, profiles, page) {
  const fmt = (n) => n ? `₹${new Intl.NumberFormat("en-IN").format(Math.round(n))}` : "not provided";
  const fmtPct = (n) => n ? `${n}%` : "?";

  let contextBlock = "";
  if (page === "couples" && context && profiles) {
    const pA = profiles?.partnerA;
    const pB = profiles?.partnerB;
    contextBlock = `COUPLE: ${pA?.name || "A"} income ${fmt(pA?.gross_income)} tax ${fmtPct(pA?.tax_bracket)}, ${pB?.name || "B"} income ${fmt(pB?.gross_income)} tax ${fmtPct(pB?.tax_bracket)}. `;
    if (context.hra) contextBlock += `HRA: ${context.hra.recommended_claimant} saves ₹${Math.round(context.hra.max_tax_saved).toLocaleString()}/year. `;
    if (context.nps) contextBlock += `NPS saves ₹${Math.round(context.nps.total_household_saving).toLocaleString()}/year. `;
  }
  if (page === "xray" && context) {
    contextBlock = `PORTFOLIO: Value ${fmt(context.total_value)}, XIRR ${context.xirr}%. `;
  }
  if (page === "fire" && context) {
    contextBlock = `FIRE: Age ${context.current_age}, need ${fmt(context.fire_number)}. `;
  }

  return `You are Money Mentor, a friendly Indian finance assistant. Be concise (2-4 sentences), warm, and specific. ${contextBlock}

JARGON: HRA=House Rent Allowance (tax-free rent component), NPS=retirement savings with extra ₹50k deduction, SIP=monthly auto-investing, XIRR=actual annualized return, LTCG=12.5% tax on equity gains above ₹1.25L/year, Expense Ratio=fund management fee, Fund Overlap=same stocks in different funds (concentration risk), FIRE=Financial Independence Retire Early, 4% rule=safe withdrawal rate.`;
}

const STARTERS = [
  "What is a mutual fund?",
  "How does HRA work?",
  "Explain the 4% rule",
  "SIP vs lump sum?",
  "New vs old tax regime?",
  "What is fund overlap?",
];

const S = {
  container: { fontFamily: "system-ui, sans-serif", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column", height: 450, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  header: { padding: "12px 16px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 10, background: "#f9fafb" },
  dot: (c) => ({ width: 8, height: 8, borderRadius: "50%", background: c === "success" ? "#22c55e" : c === "error" ? "#ef4444" : "#f59e0b" }),
  messagesWrap: { flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 },
  bubble: (role) => ({ maxWidth: "85%", padding: "10px 14px", borderRadius: role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px", fontSize: 14, lineHeight: 1.5, alignSelf: role === "user" ? "flex-end" : "flex-start", background: role === "user" ? "#3b82f6" : "#f3f4f6", color: role === "user" ? "#fff" : "#1f2937" }),
  startersWrap: { display: "flex", flexWrap: "wrap", gap: 8, padding: "0 14px 12px" },
  starter: { fontSize: 12, padding: "6px 12px", borderRadius: 16, border: "1px solid #d1d5db", background: "transparent", color: "#4b5563", cursor: "pointer" },
  inputRow: { borderTop: "1px solid #e5e7eb", padding: "12px 14px", display: "flex", gap: 8 },
  input: { flex: 1, fontSize: 14, padding: "8px 14px", borderRadius: 20, border: "1px solid #d1d5db", background: "#f9fafb", outline: "none" },
  sendBtn: (d) => ({ padding: "8px 16px", borderRadius: 20, fontSize: 14, fontWeight: 500, background: d ? "#e5e7eb" : "#3b82f6", color: d ? "#9ca3af" : "#fff", border: "none", cursor: d ? "not-allowed" : "pointer" }),
  setupBox: { padding: "12px", background: "#fef3c7", borderRadius: 8, margin: "12px 14px", fontSize: 13, color: "#92400e" },
};

export default function FinanceChatbot({ context, page = "general", profiles }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [showStarters, setShowStarters] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, generating]);

  const generateResponse = useCallback(async (question, history) => {
    // Use backend proxy to avoid CORS
    const response = await fetch("http://localhost:8000/chatbot/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: question,
        history: history,
        context: context,
        page: page,
        profiles: profiles,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${response.status}: ${errorText.slice(0, 200)}`);
    }
    
    const result = await response.json();
    return result.response || "I could not generate a response.";
  }, [context, profiles, page]);

  const sendMessage = useCallback(async (text) => {
    const question = (text || input).trim();
    if (!question || generating) return;

    setInput("");
    setShowStarters(false);
    setGenerating(true);
    const userMsg = { role: "user", content: question };
    const updated = [...messages, userMsg];
    setMessages(updated);

    try {
      if (HF_TOKEN === "hf_YOUR_TOKEN_HERE") {
        await new Promise(r => setTimeout(r, 400));
        const demo = getDemoResponse(question, context, profiles, page);
        setMessages(prev => [...prev, { role: "assistant", content: demo }]);
      } else {
        const resp = await generateResponse(question, updated);
        setMessages(prev => [...prev, { role: "assistant", content: resp }]);
      }
    } catch (err) {
      console.error("Chatbot error:", err);
      setMessages(prev => [...prev, { role: "assistant", content: `Error: ${err.message}` }]);
    } finally {
      setGenerating(false);
    }
    inputRef.current?.focus();
  }, [input, messages, generating, generateResponse]);

  const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const getDemoResponse = (q, ctx, profs, pg) => {
    const lq = q.toLowerCase();
    if (lq.includes("hra")) return pg === "couples" && ctx?.hra ? `${profs?.[ctx.hra.recommended_claimant === "A" ? "partnerA" : "partnerB"]?.name || "Partner"} should claim HRA — saves ₹${Math.round(ctx.hra.max_tax_saved).toLocaleString()}/year.` : "HRA = House Rent Allowance. Exemption is minimum of: actual HRA, 50% of basic (metros), or rent paid minus 10% of basic.";
    if (lq.includes("nps")) return pg === "couples" && ctx?.nps ? `Both invest ₹50k in NPS → save ₹${Math.round(ctx.nps.total_household_saving).toLocaleString()}/year in taxes!` : "NPS gives extra ₹50,000 deduction under 80CCD(1B). Saves ₹15,000 if you are in 30% tax bracket.";
    if (lq.includes("sip")) return "SIP = Systematic Investment Plan. Invest fixed amount monthly — this is rupee cost averaging. You buy more units when market is down, fewer when up. Best for long-term wealth building.";
    if (lq.includes("fire")) return "FIRE = Financial Independence Retire Early. You need 25-30x your annual expenses invested. Use 4% rule for withdrawals. In India, many prefer 3-3.5% due to inflation.";
    if (lq.includes("overlap")) return "Fund overlap = when multiple mutual funds hold the same stocks. This creates concentration risk. Check overlap using Portfolio X-Ray tool. Diversify across large, mid, small cap, debt, international.";
    if (lq.includes("xirr")) return "XIRR = Extended Internal Rate of Return. It calculates your actual annualized return accounting for WHEN you invested. More accurate than CAGR for SIPs with multiple dates.";
    if (lq.includes("tax regime")) return "Old tax regime: higher rates but deductions available (80C ₹1.5L, HRA, NPS ₹50k extra, home loan). New regime: lower rates, almost no deductions. Generally, if deductions > ₹3.75L, old regime wins.";
    if (lq.includes("expense")) return "Expense ratio = annual fee charged by mutual funds. Lower is better. Index funds: 0.1-0.3%. Active funds: 0.5-2%. Over 20 years, a 1% difference costs you lakhs!";
    if (lq.includes("mutual fund")) return "Mutual fund = pool of money from many investors, managed by professionals. Types: Equity (stocks, higher returns, volatile), Debt (bonds, stable, lower returns), Hybrid (mix of both).";
    return `Great question! 💰 I am running in demo mode. For AI-powered answers with your specific numbers, get a free HuggingFace token from huggingface.co/settings/tokens and replace "hf_YOUR_TOKEN_HERE" in FinanceChatbot.jsx.`;
  };

  if (!open) return (
    <div style={{ marginTop: 24 }}>
      <button onClick={() => setOpen(true)} style={{ width: "100%", padding: "14px 24px", borderRadius: 12, fontSize: 15, fontWeight: 500, background: "#f3f4f6", border: "1px solid #e5e7eb", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, justifyContent: "center" }}>
        <span style={{ fontSize: 20 }}>💬</span> Ask the finance guide
      </button>
      <div style={{ fontSize: 12, color: "#6b7280", textAlign: "center", marginTop: 6 }}>Powered by HuggingFace AI · Free tier available</div>
    </div>
  );

  return (
    <div style={{ marginTop: 24 }}>
      <div style={S.container}>
        <div style={S.header}>
          <div style={S.dot(HF_TOKEN === "hf_YOUR_TOKEN_HERE" || HF_TOKEN === "" ? "warning" : "success")} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Finance Guide</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>{HF_TOKEN === "hf_YOUR_TOKEN_HERE" ? "Add HF_TOKEN to use AI" : "AI powered · Personalized"}</div>
          </div>
          <button onClick={() => setOpen(false)} style={{ fontSize: 24, background: "none", border: "none", color: "#6b7280", cursor: "pointer" }}>×</button>
        </div>

        {HF_TOKEN === "hf_YOUR_TOKEN_HERE" && (
          <div style={S.setupBox}>
            <strong>🔑 HF Token Required</strong><br/>
            Add your token at line 16:<br/>
            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
          </div>
        )}

        <div style={S.messagesWrap}>
          {messages.length === 0 ? (
            <div style={S.bubble("assistant")}>Hi! Ask me about HRA, NPS, SIP, FIRE planning, portfolio analysis, or any finance jargon. I give personalized advice based on your numbers! 💰</div>
          ) : messages.map((m, i) => <div key={i} style={S.bubble(m.role)}>{m.content}</div>)}
          {generating && <div style={{ ...S.bubble("assistant"), color: "#6b7280", fontStyle: "italic" }}>Thinking...</div>}
          <div ref={bottomRef} />
        </div>

        {showStarters && messages.length > 0 && (
          <div style={S.startersWrap}>
            {STARTERS.map(q => <button key={q} style={S.starter} onClick={() => sendMessage(q)}>{q}</button>)}
          </div>
        )}

        <div style={S.inputRow}>
          <input ref={inputRef} style={S.input} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} placeholder={generating ? "Generating..." : "Ask anything..."} disabled={generating} />
          <button style={S.sendBtn(generating || !input.trim())} onClick={() => sendMessage()} disabled={generating || !input.trim()}>Send</button>
        </div>
      </div>
    </div>
  );
}
