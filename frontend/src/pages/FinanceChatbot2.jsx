/**
 * FinanceChatbot.jsx - Direct Browser AI (Transformers.js)
 *
 * Runs 100% in browser using HuggingFace Transformers.js
 * No backend proxy needed. No CORS issues. Private.
 *
 * Model: SmolLM2-360M-Instruct (~90MB, downloads once, caches forever)
 */

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Web Worker for AI (runs off main thread) ─────────────────────────────────
const WORKER_CODE = `
import { pipeline, env } from "https://esm.sh/@huggingface/transformers@3.5.2";

env.allowLocalModels = false;
env.useBrowserCache = true;

let gen = null;

self.onmessage = async (e) => {
  const { type, payload } = e.data;
  
  if (type === "LOAD") {
    try {
      gen = await pipeline("text-generation", "HuggingFaceTB/SmolLM2-360M-Instruct", {
        dtype: "q4",
        device: "wasm",
        progress_callback: (p) => self.postMessage({ type: "PROGRESS", payload: Math.round(p * 100) }),
      });
      self.postMessage({ type: "READY" });
    } catch (err) {
      self.postMessage({ type: "ERROR", payload: err.message });
    }
  }
  
  if (type === "GENERATE") {
    try {
      const out = await gen(payload.prompt, {
        max_new_tokens: 300,
        temperature: 0.7,
        top_p: 0.9,
        do_sample: true,
        return_full_text: false,
      });
      const text = (Array.isArray(out) ? out[0]?.generated_text : out?.generated_text) || "";
      self.postMessage({ type: "RESULT", payload: text.trim() });
    } catch (err) {
      self.postMessage({ type: "ERROR", payload: err.message });
    }
  }
};
`;

let workerUrl = null;
const getWorkerUrl = () => {
  if (!workerUrl) {
    workerUrl = URL.createObjectURL(new Blob([WORKER_CODE], { type: "application/javascript" }));
  }
  return workerUrl;
};

// ─── System Prompt Builder ────────────────────────────────────────────────────
const buildPrompt = (context, page, question, history) => {
  const fmt = (n) => n ? `₹${Math.round(n).toLocaleString("en-IN")}` : "?";
  
  let ctx = "";
  if (page === "couples" && context) {
    if (context.hra) ctx += `HRA: ${context.hra.recommended_claimant} saves ${fmt(context.hra.max_tax_saved)}/year. `;
    if (context.nps) ctx += `NPS saves ${fmt(context.nps.total_household_saving)}/year. `;
  }
  if (page === "xray" && context) {
    ctx += `Portfolio: ${fmt(context.total_value)}, XIRR ${context.xirr}%. `;
  }
  if (page === "fire" && context) {
    ctx += `FIRE target: ${fmt(context.fire_number)}. `;
  }

  const system = `You are Money Mentor, a friendly Indian finance assistant. ${ctx}Be concise (2-4 sentences), warm, and specific.

JARGON: HRA=House Rent Allowance, NPS=retirement savings, SIP=monthly investing, XIRR=actual return, FIRE=Financial Independence.

Assistant:`;

  let prompt = system + "\n\n";
  history.slice(-3).forEach(m => {
    prompt += `${m.role === "user" ? "User" : "Assistant"}: ${m.content}\n`;
  });
  prompt += `User: ${question}\nAssistant:`;
  
  return prompt;
};

// ─── Styles ─────────────────────────────────────────────────────────────────
const S = {
  container: { fontFamily: "system-ui, sans-serif", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column", height: 480, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  header: { padding: "12px 16px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 10, background: "#f9fafb" },
  dot: (c) => ({ width: 8, height: 8, borderRadius: "50%", background: c === "ready" ? "#22c55e" : c === "loading" ? "#3b82f6" : "#f59e0b" }),
  messages: { flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 },
  bubble: (role) => ({ maxWidth: "85%", padding: "10px 14px", borderRadius: role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px", fontSize: 14, lineHeight: 1.5, alignSelf: role === "user" ? "flex-end" : "flex-start", background: role === "user" ? "#3b82f6" : "#f3f4f6", color: role === "user" ? "#fff" : "#1f2937" }),
  inputRow: { borderTop: "1px solid #e5e7eb", padding: "12px 14px", display: "flex", gap: 8 },
  input: { flex: 1, fontSize: 14, padding: "8px 14px", borderRadius: 20, border: "1px solid #d1d5db", background: "#f9fafb", outline: "none" },
  btn: (d) => ({ padding: "8px 16px", borderRadius: 20, fontSize: 14, fontWeight: 500, background: d ? "#e5e7eb" : "#3b82f6", color: d ? "#9ca3af" : "#fff", border: "none", cursor: d ? "not-allowed" : "pointer" }),
  progress: { height: 3, background: "#3b82f6", borderRadius: 2, transition: "width 0.3s" },
  progressWrap: { height: 3, background: "#e5e7eb", borderRadius: 2, overflow: "hidden", margin: "0 14px 8px" },
};

// ─── Main Component ─────────────────────────────────────────────────────────
export default function FinanceChatbot({ context, page = "general" }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const [progress, setProgress] = useState(0);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const workerRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, generating]);

  // Initialize worker when opened
  useEffect(() => {
    if (!open || workerRef.current) return;
    
    setStatus("loading");
    const worker = new Worker(getWorkerUrl(), { type: "module" });
    workerRef.current = worker;
    
    worker.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === "PROGRESS") setProgress(payload);
      if (type === "READY") setStatus("ready");
      if (type === "RESULT") {
        setMessages(prev => [...prev, { role: "assistant", content: payload }]);
        setGenerating(false);
      }
      if (type === "ERROR") {
        setMessages(prev => [...prev, { role: "assistant", content: `Error: ${payload}` }]);
        setGenerating(false);
        setStatus("error");
      }
    };
    
    worker.postMessage({ type: "LOAD" });
  }, [open]);

  const send = useCallback(async () => {
    const q = input.trim();
    if (!q || status !== "ready" || generating) return;
    
    setInput("");
    setGenerating(true);
    const userMsg = { role: "user", content: q };
    setMessages(prev => [...prev, userMsg]);
    
    const prompt = buildPrompt(context, page, q, [...messages, userMsg]);
    workerRef.current.postMessage({ type: "GENERATE", payload: { prompt } });
  }, [input, status, generating, context, page, messages]);

  const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  if (!open) return (
    <div style={{ marginTop: 24 }}>
      <button onClick={() => setOpen(true)} style={{ width: "100%", padding: "14px 24px", borderRadius: 12, fontSize: 15, fontWeight: 500, background: "#f3f4f6", border: "1px solid #e5e7eb", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, justifyContent: "center" }}>
        <span style={{ fontSize: 20 }}>💬</span> Ask the AI finance guide
      </button>
      <div style={{ fontSize: 12, color: "#6b7280", textAlign: "center", marginTop: 6 }}>Runs in browser · Private · No API key needed</div>
    </div>
  );

  return (
    <div style={{ marginTop: 24 }}>
      <div style={S.container}>
        <div style={S.header}>
          <div style={S.dot(status === "ready" ? "ready" : status === "loading" ? "loading" : "error")} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Finance Guide</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              {status === "loading" && `Loading AI model... ${progress}%`}
              {status === "ready" && "AI ready · Ask me anything"}
              {status === "error" && "Error — try refreshing"}
            </div>
          </div>
          <button onClick={() => setOpen(false)} style={{ fontSize: 24, background: "none", border: "none", color: "#6b7280", cursor: "pointer" }}>×</button>
        </div>

        {status === "loading" && (
          <div style={S.progressWrap}><div style={{ ...S.progress, width: `${progress}%` }} /></div>
        )}

        <div style={S.messages}>
          {messages.length === 0 && status === "ready" && (
            <div style={S.bubble("assistant")}>
              Hi! I'm your AI finance assistant. 💰<br/><br/>
              Ask me about:<br/>
              • HRA, NPS, tax planning<br/>
              • SIP, mutual funds, returns<br/>
              • FIRE planning, retirement<br/>
              • Portfolio analysis<br/>
              • Any finance jargon!<br/><br/>
              I use your numbers to give personalized advice.
            </div>
          )}
          {messages.map((m, i) => <div key={i} style={S.bubble(m.role)}>{m.content}</div>)}
          {generating && <div style={{ ...S.bubble("assistant"), color: "#6b7280", fontStyle: "italic" }}>Thinking...</div>}
          <div ref={bottomRef} />
        </div>

        <div style={S.inputRow}>
          <input
            style={S.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={status === "loading" ? "Loading model..." : status === "ready" ? "Ask anything..." : "Error — refresh page"}
            disabled={status !== "ready" || generating}
          />
          <button style={S.btn(status !== "ready" || generating || !input.trim())} onClick={send} disabled={status !== "ready" || generating || !input.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
