/**
 * FinanceChatbot.jsx - Money Mentor AI Chatbot
 * 
 * Integrated with Groq API for fast, reliable responses
 * Styled to match Money Mentor design system
 */

import { useState, useEffect, useRef, useCallback } from "react";

// Configuration
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";

const STARTERS = [
  "What is a mutual fund?",
  "How does HRA work?",
  "Explain the 4% rule",
  "SIP vs lump sum?",
  "New vs old tax regime?",
  "What is fund overlap?",
];

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
      const resp = await generateResponse(question, updated);
      setMessages(prev => [...prev, { role: "assistant", content: resp }]);
    } catch (err) {
      console.error("Chatbot error:", err);
      setMessages(prev => [...prev, { role: "assistant", content: `Error: ${err.message}` }]);
    } finally {
      setGenerating(false);
    }
    inputRef.current?.focus();
  }, [input, messages, generating, generateResponse]);

  const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const getDemoResponse = (q) => {
    const lq = q.toLowerCase();
    if (lq.includes("hra")) return "🏠 **HRA (House Rent Allowance)** is a tax-free component of your salary for rent. The exemption is the minimum of three amounts: (1) actual HRA received, (2) 50% of basic salary for metro cities (40% for non-metro), or (3) rent paid minus 10% of basic salary.";
    if (lq.includes("nps")) return "💰 **NPS (National Pension System)** gives you an extra ₹50,000 tax deduction under Section 80CCD(1B) — this is over and above your ₹1.5L 80C limit! At 30% tax bracket, that's ₹15,000 saved yearly.";
    if (lq.includes("sip")) return "📈 **SIP (Systematic Investment Plan)** is like a recurring deposit but for mutual funds! You invest a fixed amount every month — this is called 'rupee cost averaging.' Perfect for long-term wealth building.";
    if (lq.includes("fire")) return "🔥 **FIRE = Financial Independence Retire Early!** The idea is to save 25-30x your annual expenses, then live off the returns. The '4% rule' suggests you can safely withdraw 4% yearly.";
    if (lq.includes("mutual fund")) return "🤝 **Mutual Funds** pool money from many investors to buy stocks/bonds professionally. Types: Equity (higher returns, more volatile), Debt (stable, lower returns), Hybrid (balanced mix).";
    return "🤗 I'd love to help with that! I'm currently in demo mode. For AI-powered answers that use your actual financial data, the backend needs to be configured with an API key.";
  };

  if (!open) return (
    <div style={{ marginTop: 24 }}>
      <button onClick={() => setOpen(true)} style={{ width: "100%", padding: "14px 24px", borderRadius: 12, fontSize: 15, fontWeight: 500, background: "linear-gradient(135deg, #4af8e3 0%, #33e9d5 100%)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, justifyContent: "center", color: "#0b0e14", boxShadow: "0 4px 20px rgba(74, 248, 227, 0.3)" }}>
        <span style={{ fontSize: 20 }}>💬</span> Ask the Finance AI
      </button>
      <div style={{ fontSize: 12, color: "#a9abb3", textAlign: "center", marginTop: 6 }}>Powered by Groq AI · Personalized advice</div>
    </div>
  );

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        border: "1px solid #30363d",
        borderRadius: 16,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: 500,
        background: "#0b0e14",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)"
      }}>
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #30363d", display: "flex", alignItems: "center", gap: 12, background: "linear-gradient(135deg, #4af8e3 0%, #33e9d5 100%)" }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 10px rgba(34, 197, 94, 0.5)" }}></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#0b0e14" }}>Finance AI Assistant</div>
            <div style={{ fontSize: 12, color: "#0b0e14", opacity: 0.8 }}>AI powered · Context aware</div>
          </div>
          <button onClick={() => setOpen(false)} style={{ fontSize: 24, background: "none", border: "none", color: "#0b0e14", cursor: "pointer", opacity: 0.7, padding: 0, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.length === 0 ? (
            <div style={{
              maxWidth: "85%",
              padding: "12px 16px",
              borderRadius: "12px 12px 12px 2px",
              fontSize: 14,
              lineHeight: 1.5,
              alignSelf: "flex-start",
              background: "#22262f",
              color: "#ecedf6",
              border: "1px solid #30363d"
            }}>
              Hi! 👋 I'm your AI finance assistant. Ask me about HRA, NPS, SIP, FIRE planning, portfolio analysis, or any finance jargon. I'll give personalized advice based on your numbers!
            </div>
          ) : messages.map((m, i) => (
            <div key={i} style={{
              maxWidth: "85%",
              padding: "12px 16px",
              borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
              fontSize: 14,
              lineHeight: 1.5,
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              background: m.role === "user" ? "linear-gradient(135deg, #4af8e3 0%, #33e9d5 100%)" : "#22262f",
              color: m.role === "user" ? "#0b0e14" : "#ecedf6",
              border: m.role === "user" ? "none" : "1px solid #30363d"
            }}>
              {m.content}
            </div>
          ))}
          {generating && (
            <div style={{
              maxWidth: "85%",
              padding: "12px 16px",
              borderRadius: "12px 12px 12px 2px",
              fontSize: 14,
              lineHeight: 1.5,
              alignSelf: "flex-start",
              background: "#22262f",
              color: "#a9abb3",
              border: "1px solid #30363d",
              fontStyle: "italic"
            }}>
              Thinking...
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Starters */}
        {showStarters && messages.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "0 20px 12px" }}>
            {STARTERS.map(q => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                style={{
                  fontSize: 12,
                  padding: "6px 12px",
                  borderRadius: 16,
                  border: "1px solid #4af8e3",
                  background: "transparent",
                  color: "#4af8e3",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseOver={(e) => {
                  e.target.style.background = "#4af8e3";
                  e.target.style.color = "#0b0e14";
                }}
                onMouseOut={(e) => {
                  e.target.style.background = "transparent";
                  e.target.style.color = "#4af8e3";
                }}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ borderTop: "1px solid #30363d", padding: "12px 20px", display: "flex", gap: 8 }}>
          <input
            ref={inputRef}
            style={{
              flex: 1,
              fontSize: 14,
              padding: "10px 16px",
              borderRadius: 20,
              border: "1px solid #30363d",
              background: "#22262f",
              outline: "none",
              color: "#ecedf6"
            }}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={generating ? "Generating..." : "Ask anything about finance..."}
            disabled={generating}
          />
          <button
            onClick={() => sendMessage()}
            disabled={generating || !input.trim()}
            style={{
              padding: "10px 16px",
              borderRadius: 20,
              fontSize: 14,
              fontWeight: 500,
              background: generating || !input.trim() ? "#30363d" : "linear-gradient(135deg, #4af8e3 0%, #33e9d5 100%)",
              color: generating || !input.trim() ? "#a9abb3" : "#0b0e14",
              border: "none",
              cursor: generating || !input.trim() ? "not-allowed" : "pointer",
              transition: "all 0.2s"
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
