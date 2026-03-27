import { useState, useCallback, useMemo } from "react";

// ─── Constants ────────────────────────────────────────────────────────
const METRO_CITIES = ["Mumbai", "Delhi", "Chennai", "Kolkata", "Bangalore", "Hyderabad", "Pune"];
const TAX_BRACKETS = [0, 5, 10, 15, 20, 25, 30];

// ─── Pure Calculation Functions (mirroring Python service exactly) ────────
function calcHraExemption({ basic_salary, hra_received, rent_paid, city }) {
  const isMetro = METRO_CITIES.some(m => city.toLowerCase().includes(m.toLowerCase()));
  const limit1 = hra_received;
  const limit2 = isMetro ? 0.5 * basic_salary : 0.4 * basic_salary;
  const limit3 = Math.max(0, rent_paid - 0.1 * basic_salary);
  return Math.min(limit1, limit2, limit3);
}

function calcHraOptimization(a, b) {
  const aEx = calcHraExemption(a);
  const bEx = calcHraExemption(b);
  const aTax = aEx * (a.tax_bracket / 100);
  const bTax = bEx * (b.tax_bracket / 100);
  const recommended = aTax >= bTax ? "A" : "B";
  return {
    partner_a_exemption: aEx,
    partner_a_tax_saved: aTax,
    partner_b_exemption: bEx,
    partner_b_tax_saved: bTax,
    recommended_claimant: recommended,
    additional_saving: Math.abs(aTax - bTax),
    max_tax_saved: Math.max(aTax, bTax),
  };
}

function calcNpsOptimization(a, b) {
  const NPS_LIMIT = 50000;
  const aTax = NPS_LIMIT * (a.tax_bracket / 100);
  const bTax = NPS_LIMIT * (b.tax_bracket / 100);
  return {
    partner_a_recommended: NPS_LIMIT,
    partner_b_recommended: NPS_LIMIT,
    partner_a_tax_saving: aTax,
    partner_b_tax_saving: bTax,
    total_household_saving: aTax + bTax,
    total_investment: NPS_LIMIT * 2,
  };
}

function calcSipSplit(a, b, monthlyTarget) {
  const aBracket = a.tax_bracket;
  const bBracket = b.tax_bracket;
  let aRatio = 0.5, bRatio = 0.5;
  if (aBracket !== bBracket) {
    const diff = Math.abs(aBracket - bBracket);
    const lowerRatio = diff >= 20 ? 0.7 : diff >= 10 ? 0.65 : 0.6;
    if (aBracket < bBracket) { aRatio = lowerRatio; bRatio = 1 - lowerRatio; }
    else { bRatio = lowerRatio; aRatio = 1 - lowerRatio; }
  }
  const annualSip = monthlyTarget * 12;
  const returns = annualSip * 0.12;
  const higherBracket = Math.max(aBracket, bBracket);
  const lowerBracket = Math.min(aBracket, bBracket);
  const taxableGains = Math.max(0, returns - 125000);
  const taxSaving = aBracket !== bBracket ? taxableGains * ((higherBracket - lowerBracket) / 100) * 0.125 : 0;
  return {
    partner_a_sip: monthlyTarget * aRatio,
    partner_b_sip: monthlyTarget * bRatio,
    split_ratio: `${Math.round(aRatio * 100)}:${Math.round(bRatio * 100)}`,
    annual_tax_saving: Math.max(0, taxSaving),
    a_ratio: aRatio,
    b_ratio: bRatio,
  };
}

function calcHealthInsurance(a, b) {
  const ageGap = Math.abs(a.age - b.age);
  const isChronic = a.has_chronic_condition || b.has_chronic_condition;
  const isMetro = METRO_CITIES.some(m =>
    a.city.toLowerCase().includes(m.toLowerCase()) || b.city.toLowerCase().includes(m.toLowerCase())
  );
  const useIndividual = ageGap > 3 || isChronic;
  let baseCover = isMetro ? 2000000 : 1000000;
  const maxAge = Math.max(a.age, b.age);
  if (maxAge > 40) baseCover += 500000;
  if (maxAge > 50) baseCover += 1000000;
  const totalCurrent = (a.current_health_cover || 0) + (b.current_health_cover || 0);
  return {
    recommendation: useIndividual ? "Individual" : "Family Floater",
    recommended_cover: baseCover,
    current_gap: Math.max(0, baseCover - totalCurrent),
    age_gap: ageGap,
    is_chronic: isChronic,
    is_metro: isMetro,
  };
}

function calcNetWorth(a, b) {
  const assetFields = ["savings", "mf_value", "pf_balance", "nps_balance", "property_value", "gold_value"];
  const liabilityFields = ["home_loan_outstanding", "car_loan", "credit_card_debt", "other_loans"];
  const aAssets = assetFields.reduce((s, f) => s + (a[f] || 0), 0);
  const aLiab = liabilityFields.reduce((s, f) => s + (a[f] || 0), 0);
  const bAssets = assetFields.reduce((s, f) => s + (b[f] || 0), 0);
  const bLiab = liabilityFields.reduce((s, f) => s + (b[f] || 0), 0);
  const breakdown = {};
  assetFields.forEach(f => { const v = (a[f] || 0) + (b[f] || 0); if (v > 0) breakdown[f] = v; });
  const liabBreakdown = {};
  liabilityFields.forEach(f => { const v = (a[f] || 0) + (b[f] || 0); if (v > 0) liabBreakdown[f] = v; });
  return {
    partner_a_assets: aAssets, partner_a_liabilities: aLiab,
    partner_b_assets: bAssets, partner_b_liabilities: bLiab,
    combined_assets: aAssets + bAssets,
    combined_liabilities: aLiab + bLiab,
    net_worth: aAssets + bAssets - aLiab - bLiab,
    asset_breakdown: breakdown,
    liability_breakdown: liabBreakdown,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(n));
const fmtL = (n) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  return `₹${fmt(n)}`;
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  wrap: { fontFamily: "system-ui, -apple-system, sans-serif", maxWidth: 820, margin: "0 auto", padding: "1.5rem 1rem" },
  card: { background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.25rem 1.5rem", marginBottom: 16 },
  row: { display: "flex", gap: 12, flexWrap: "wrap" },
  col: { flex: 1, minWidth: 200 },
  h1: { fontSize: 22, fontWeight: 600, margin: "0 0 4px", color: "#111827" },
  h2: { fontSize: 16, fontWeight: 600, margin: "0 0 16px", color: "#111827" },
  h3: { fontSize: 14, fontWeight: 500, margin: "0 0 12px", color: "#6b7280" },
  label: { fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 },
  sublabel: { fontSize: 11, color: "#9ca3af", marginTop: 2 },
  input: { width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 14, boxSizing: "border-box" },
  metricCard: { background: "#f9fafb", borderRadius: 8, padding: "12px 14px", flex: 1, minWidth: 120 },
  metricLabel: { fontSize: 12, color: "#6b7280", marginBottom: 4 },
  metricVal: { fontSize: 20, fontWeight: 600, color: "#111827" },
  stepTab: (active) => ({
    padding: "8px 16px", borderRadius: 20, fontSize: 13, fontWeight: active ? 500 : 400,
    background: active ? "#dbeafe" : "transparent",
    color: active ? "#1d4ed8" : "#6b7280",
    border: "1px solid " + (active ? "#3b82f6" : "#e5e7eb"),
    cursor: "pointer",
  }),
  highlight: { background: "#dcfce7", border: "1px solid #86efac", borderRadius: 8, padding: "10px 14px", marginTop: 10 },
  highlightText: { fontSize: 13, color: "#15803d", fontWeight: 500 },
  warning: { background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", marginTop: 10 },
  infoBar: { background: "#dbeafe", borderRadius: 8, padding: "10px 14px", marginTop: 10 },
  barWrap: { marginTop: 8 },
  barRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 },
  barLabel: { fontSize: 12, color: "#6b7280", width: 110, flexShrink: 0, textAlign: "right" },
  barOuter: { flex: 1, height: 8, background: "#f3f4f6", borderRadius: 4, overflow: "hidden" },
  pill: (color) => ({ display: "inline-block", padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500, background: color === "info" ? "#dbeafe" : color === "success" ? "#dcfce7" : "#f3f4f6", color: color === "info" ? "#1d4ed8" : color === "success" ? "#15803d" : "#6b7280", border: `1px solid ${color === "info" ? "#3b82f6" : color === "success" ? "#86efac" : "#e5e7eb"}` }),
  divider: { borderTop: "1px solid #e5e7eb", margin: "12px 0" },
  partnerBadge: (color) => ({ width: 32, height: 32, borderRadius: "50%", background: color === "info" ? "#dbeafe" : "#dcfce7", color: color === "info" ? "#1d4ed8" : "#15803d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, flexShrink: 0 }),
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function PartnerHeader({ label, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
      <div style={S.partnerBadge(color)}>{label[0]}</div>
      <span style={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>{label}</span>
    </div>
  );
}

function MetricGrid({ items }) {
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
      {items.map(({ label, value, color }) => (
        <div key={label} style={{ ...S.metricCard, borderLeft: color ? `3px solid ${color === "info" ? "#3b82f6" : color === "success" ? "#22c55e" : "#ef4444"}` : undefined }}>
          <div style={S.metricLabel}>{label}</div>
          <div style={{ ...S.metricVal, color: color === "info" ? "#1d4ed8" : color === "success" ? "#15803d" : "#111827" }}>{value}</div>
        </div>
      ))}
    </div>
  );
}

function BarChart({ items, maxVal }) {
  return (
    <div style={S.barWrap}>
      {items.map(({ label, value, color = "info" }) => (
        <div key={label} style={S.barRow}>
          <div style={S.barLabel}>{label}</div>
          <div style={S.barOuter}>
            <div style={{ height: "100%", width: `${Math.min(100, (value / maxVal) * 100)}%`, background: color === "info" ? "#3b82f6" : color === "success" ? "#22c55e" : "#6b7280", borderRadius: 4, transition: "width 0.4s" }} />
          </div>
          <div style={{ fontSize: 12, fontWeight: 500, minWidth: 70, color: color === "info" ? "#1d4ed8" : color === "success" ? "#15803d" : "#6b7280" }}>{fmtL(value)}</div>
        </div>
      ))}
    </div>
  );
}

function InputField({ label, type = "text", value, onChange, placeholder, min, max, step, options, hint }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={S.label}>{label}</label>
      {options ? (
        <select style={S.input} value={value} onChange={e => onChange(e.target.value)}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input
          style={S.input}
          type={type}
          value={value}
          onChange={e => onChange(type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)}
          placeholder={placeholder}
          min={min} max={max} step={step}
        />
      )}
      {hint && <div style={S.sublabel}>{hint}</div>}
    </div>
  );
}

function CheckboxField({ label, checked, onChange, hint }) {
  return (
    <div style={{ marginBottom: 14, display: "flex", alignItems: "flex-start", gap: 8 }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ marginTop: 3 }} />
      <div>
        <label style={{ ...S.label, marginBottom: 0, cursor: "pointer" }}>{label}</label>
        {hint && <div style={S.sublabel}>{hint}</div>}
      </div>
    </div>
  );
}

// ─── Step Components ──────────────────────────────────────────────────────────
function StepProfiles({ data, onChange }) {
  const update = (partner, field, val) => onChange(p => ({ ...p, [partner]: { ...p[partner], [field]: val } }));
  const cityOptions = [
    { value: "", label: "Select city" },
    ...METRO_CITIES.map(c => ({ value: c, label: c + " (Metro)" })),
    { value: "Other", label: "Other (Tier 2/3)" },
  ];
  const bracketOptions = TAX_BRACKETS.map(b => ({ value: b, label: `${b}% slab` }));

  return (
    <div>
      <div style={{ ...S.row, alignItems: "stretch" }}>
        {[["A", "info"], ["B", "success"]].map(([p, color]) => (
          <div key={p} style={{ ...S.card, ...S.col }}>
            <PartnerHeader label={`Partner ${p}`} color={color} />
            <InputField label="Full name (optional)" value={data[`partner${p}`].name || ""} onChange={v => update(`partner${p}`, "name", v)} placeholder={`Partner ${p}`} />
            <InputField label="Age" type="number" value={data[`partner${p}`].age} onChange={v => update(`partner${p}`, "age", v)} min={18} max={70} />
            <InputField label="Annual gross income (₹)" type="number" value={data[`partner${p}`].gross_income} onChange={v => update(`partner${p}`, "gross_income", v)} placeholder="e.g. 1500000" hint="Total CTC before deductions" />
            <InputField label="Basic salary (₹/year)" type="number" value={data[`partner${p}`].basic_salary} onChange={v => update(`partner${p}`, "basic_salary", v)} placeholder="Usually 40-50% of CTC" />
            <InputField label="HRA received (₹/year)" type="number" value={data[`partner${p}`].hra_received} onChange={v => update(`partner${p}`, "hra_received", v)} placeholder="Check salary slip" />
            <InputField label="Rent paid (₹/year)" type="number" value={data[`partner${p}`].rent_paid} onChange={v => update(`partner${p}`, "rent_paid", v)} placeholder="0 if not renting" />
            <InputField label="City of residence" value={data[`partner${p}`].city} onChange={v => update(`partner${p}`, "city", v)} options={cityOptions} />
            <InputField label="Applicable income tax slab" value={data[`partner${p}`].tax_bracket} onChange={v => update(`partner${p}`, "tax_bracket", Number(v))} options={bracketOptions} hint="Marginal rate under your chosen regime" />
          </div>
        ))}
      </div>
    </div>
  );
}

function StepInsurance({ data, onChange }) {
  const update = (partner, field, val) => onChange(p => ({ ...p, [partner]: { ...p[partner], [field]: val } }));
  return (
    <div style={S.row}>
      {[["A", "info"], ["B", "success"]].map(([p, color]) => (
        <div key={p} style={{ ...S.card, ...S.col }}>
          <PartnerHeader label={`Partner ${p}`} color={color} />
          <CheckboxField
            label="Has chronic health condition"
            checked={data[`partner${p}`].has_chronic_condition || false}
            onChange={v => update(`partner${p}`, "has_chronic_condition", v)}
            hint="Diabetes, hypertension, heart condition, etc."
          />
          <InputField label="Existing health cover (₹)" type="number" value={data[`partner${p}`].current_health_cover || 0} onChange={v => update(`partner${p}`, "current_health_cover", v)} placeholder="0 if none" hint="Sum insured on active policy" />
        </div>
      ))}
    </div>
  );
}

function StepAssets({ data, onChange }) {
  const update = (partner, field, val) => onChange(p => ({ ...p, [partner]: { ...p[partner], [field]: val } }));
  const assetFields = [
    { field: "savings", label: "Savings & FDs (₹)", placeholder: "Bank savings + fixed deposits" },
    { field: "mf_value", label: "Mutual fund portfolio (₹)", placeholder: "Current market value" },
    { field: "pf_balance", label: "PF / EPF balance (₹)", placeholder: "From EPFO passbook" },
    { field: "nps_balance", label: "NPS balance (₹)", placeholder: "From NPS CRA statement" },
    { field: "property_value", label: "Property value (₹)", placeholder: "Current market estimate" },
    { field: "gold_value", label: "Gold & other assets (₹)", placeholder: "Gold, bonds, other" },
  ];
  const liabFields = [
    { field: "home_loan_outstanding", label: "Home loan outstanding (₹)" },
    { field: "car_loan", label: "Car / vehicle loan (₹)" },
    { field: "credit_card_debt", label: "Credit card outstanding (₹)" },
    { field: "other_loans", label: "Personal / other loans (₹)" },
  ];

  return (
    <div style={S.row}>
      {[["A", "info"], ["B", "success"]].map(([p, color]) => (
        <div key={p} style={{ ...S.card, ...S.col }}>
          <PartnerHeader label={`Partner ${p}`} color={color} />
          <div style={{ ...S.h3, marginBottom: 8 }}>Assets</div>
          {assetFields.map(({ field, label, placeholder }) => (
            <InputField key={field} label={label} type="number" value={data[`partner${p}`][field] || 0} onChange={v => update(`partner${p}`, field, v)} placeholder={placeholder} />
          ))}
          <div style={S.divider} />
          <div style={{ ...S.h3, marginBottom: 8 }}>Liabilities</div>
          {liabFields.map(({ field, label }) => (
            <InputField key={field} label={label} type="number" value={data[`partner${p}`][field] || 0} onChange={v => update(`partner${p}`, field, v)} placeholder="0" />
          ))}
        </div>
      ))}
    </div>
  );
}

function StepGoals({ goals, onChange, monthlyTarget, onMonthlyChange }) {
  const goalTypes = [
    { value: "retirement", label: "Retirement corpus" },
    { value: "home", label: "Home purchase" },
    { value: "education", label: "Child education" },
    { value: "emergency", label: "Emergency fund" },
    { value: "travel", label: "Travel fund" },
    { value: "other", label: "Other" },
  ];
  const addGoal = () => onChange([...goals, { id: Date.now(), type: "retirement", target: "", years: "", priority: "medium" }]);
  const removeGoal = (id) => onChange(goals.filter(g => g.id !== id));
  const updateGoal = (id, field, val) => onChange(goals.map(g => g.id === id ? { ...g, [field]: val } : g));

  return (
    <div>
      <div style={S.card}>
        <div style={S.h2}>Monthly SIP budget</div>
        <div style={{ maxWidth: 260 }}>
          <InputField label="Combined monthly SIP target (₹)" type="number" value={monthlyTarget} onChange={onMonthlyChange} placeholder="e.g. 50000" hint="Total across both partners" />
        </div>
      </div>
      <div style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={S.h2}>Life goals</div>
          <button onClick={addGoal} style={{ fontSize: 13, padding: "6px 12px", background: "#dbeafe", color: "#1d4ed8", border: "1px solid #3b82f6", borderRadius: 6, cursor: "pointer" }}>+ Add goal</button>
        </div>
        {goals.length === 0 && <div style={{ fontSize: 13, color: "#9ca3af" }}>No goals added yet. Click "Add goal" to get started.</div>}
        {goals.map((g, i) => (
          <div key={g.id} style={{ ...S.card, background: "#f9fafb", marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>Goal {i + 1}</span>
              <button onClick={() => removeGoal(g.id)} style={{ fontSize: 12, color: "#dc2626", background: "none", border: "none", cursor: "pointer" }}>Remove</button>
            </div>
            <div style={S.row}>
              <div style={S.col}>
                <InputField label="Goal type" value={g.type} onChange={v => updateGoal(g.id, "type", v)} options={goalTypes.map(t => ({ value: t.value, label: t.label }))} />
              </div>
              <div style={S.col}>
                <InputField label="Target amount (₹)" type="number" value={g.target} onChange={v => updateGoal(g.id, "target", v)} placeholder="e.g. 5000000" />
              </div>
              <div style={S.col}>
                <InputField label="Years to goal" type="number" value={g.years} onChange={v => updateGoal(g.id, "years", v)} min={1} max={40} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Results Panels ───────────────────────────────────────────────────────────
function ResultsHra({ hra }) {
  const rec = hra.recommended_claimant;
  return (
    <div style={S.card}>
      <div style={S.h2}>HRA tax optimization</div>
      <MetricGrid items={[
        { label: "Partner A exemption", value: fmtL(hra.partner_a_exemption), color: "info" },
        { label: "Partner A tax saved", value: fmtL(hra.partner_a_tax_saved), color: "info" },
        { label: "Partner B exemption", value: fmtL(hra.partner_b_exemption), color: "success" },
        { label: "Partner B tax saved", value: fmtL(hra.partner_b_tax_saved), color: "success" },
      ]} />
      <div style={S.highlight}>
        <div style={S.highlightText}>
          Partner {rec} should claim HRA — saves {fmtL(hra.max_tax_saved)}/year.
          {hra.additional_saving > 0 && ` Additional benefit vs other partner: ${fmtL(hra.additional_saving)}.`}
        </div>
      </div>
    </div>
  );
}

function ResultsNps({ nps }) {
  return (
    <div style={S.card}>
      <div style={S.h2}>NPS contribution — 80CCD(1B)</div>
      <MetricGrid items={[
        { label: "Each partner invests", value: `₹${fmt(nps.partner_a_recommended)}`, color: "info" },
        { label: "Partner A saves", value: fmtL(nps.partner_a_tax_saving) },
        { label: "Partner B saves", value: fmtL(nps.partner_b_tax_saving) },
        { label: "Household total saving", value: fmtL(nps.total_household_saving), color: "success" },
      ]} />
      <div style={S.infoBar}>
        <div style={{ fontSize: 13, color: "#1d4ed8" }}>
          Combined NPS investment: {fmtL(nps.total_investment)} · Max deduction: ₹50,000 per person under 80CCD(1B)
        </div>
      </div>
    </div>
  );
}

function ResultsSip({ sip, monthlyTarget }) {
  const maxSip = Math.max(sip.partner_a_sip, sip.partner_b_sip);
  return (
    <div style={S.card}>
      <div style={S.h2}>SIP allocation strategy</div>
      <MetricGrid items={[
        { label: "Monthly SIP total", value: fmtL(monthlyTarget * 12) + "/yr" },
        { label: "Split ratio A:B", value: sip.split_ratio },
        { label: "Annual LTCG saving", value: fmtL(sip.annual_tax_saving), color: "success" },
      ]} />
      <div style={S.barWrap}>
        <BarChart items={[
          { label: "Partner A monthly", value: sip.partner_a_sip, color: "info" },
          { label: "Partner B monthly", value: sip.partner_b_sip, color: "success" },
        ]} maxVal={maxSip * 1.2} />
      </div>
      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>
        LTCG on equity gains beyond ₹1.25L taxed at 12.5%. Routing more through lower-bracket partner optimizes this.
      </div>
    </div>
  );
}

function ResultsInsurance({ ins }) {
  const isIndividual = ins.recommendation === "Individual";
  return (
    <div style={S.card}>
      <div style={S.h2}>Health insurance recommendation</div>
      <MetricGrid items={[
        { label: "Policy type", value: ins.recommendation, color: isIndividual ? "warning" : "success" },
        { label: "Recommended cover", value: fmtL(ins.recommended_cover) },
        { label: "Coverage gap", value: ins.current_gap > 0 ? fmtL(ins.current_gap) : "None", color: ins.current_gap > 0 ? "error" : "success" },
        { label: "City type", value: ins.is_metro ? "Metro" : "Non-metro" },
      ]} />
      {ins.is_chronic && (
        <div style={S.warning}>
          <div style={{ fontSize: 13, color: "#b45309" }}>Chronic condition detected — individual policies recommended. Floater claims affect entire family's coverage.</div>
        </div>
      )}
      {!ins.is_chronic && ins.age_gap > 3 && (
        <div style={S.warning}>
          <div style={{ fontSize: 13, color: "#b45309" }}>Age gap of {ins.age_gap} years — individual policies are more cost-effective as floater premiums are based on oldest member.</div>
        </div>
      )}
      {!isIndividual && (
        <div style={S.highlight}>
          <div style={S.highlightText}>Family floater is optimal — similar ages, no chronic conditions, and more cost-effective than two individual policies.</div>
        </div>
      )}
    </div>
  );
}

function ResultsNetWorth({ nw }) {
  const maxAsset = Math.max(...Object.values(nw.asset_breakdown || {}).filter(Boolean), 1);
  const assetLabels = {
    savings: "Savings & FDs", mf_value: "Mutual funds", pf_balance: "PF / EPF",
    nps_balance: "NPS", property_value: "Property", gold_value: "Gold & other"
  };
  const liabLabels = {
    home_loan_outstanding: "Home loan", car_loan: "Car loan",
    credit_card_debt: "Credit card", other_loans: "Other loans"
  };
  const netPositive = nw.net_worth >= 0;

  return (
    <div style={S.card}>
      <div style={S.h2}>Net worth summary</div>
      <MetricGrid items={[
        { label: "Combined assets", value: fmtL(nw.combined_assets), color: "success" },
        { label: "Combined liabilities", value: fmtL(nw.combined_liabilities), color: "error" },
        { label: "Net worth", value: fmtL(nw.net_worth), color: netPositive ? "success" : "error" },
      ]} />
      <div style={S.divider} />
      <div style={S.row}>
        <div style={S.col}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: "#6b7280" }}>Asset breakdown</div>
          <BarChart items={Object.entries(nw.asset_breakdown || {}).map(([k, v]) => ({ label: assetLabels[k] || k, value: v, color: "info" }))} maxVal={maxAsset} />
        </div>
        {Object.keys(nw.liability_breakdown || {}).length > 0 && (
          <div style={S.col}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: "#6b7280" }}>Liability breakdown</div>
            <BarChart items={Object.entries(nw.liability_breakdown || {}).map(([k, v]) => ({ label: liabLabels[k] || k, value: v, color: "error" }))} maxVal={Math.max(...Object.values(nw.liability_breakdown))} />
          </div>
        )}
      </div>
      <div style={S.divider} />
      <div style={S.row}>
        <div style={S.col}>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Partner A</div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>Assets: {fmtL(nw.partner_a_assets)} · Liabilities: {fmtL(nw.partner_a_liabilities)}</div>
        </div>
        <div style={S.col}>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Partner B</div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>Assets: {fmtL(nw.partner_b_assets)} · Liabilities: {fmtL(nw.partner_b_liabilities)}</div>
        </div>
      </div>
    </div>
  );
}

function ResultsGoals({ goals, monthlyTarget, nw }) {
  const ASSUMED_RETURN = 0.12;
  const INFLATION = 0.06;

  const enriched = goals.map(g => {
    if (!g.target || !g.years) return { ...g, required_sip: null, inflation_adjusted: null };
    const n = g.years * 12;
    const target = Number(g.target);
    const inf_adj = target * Math.pow(1 + INFLATION, g.years);
    const r = ASSUMED_RETURN / 12;
    const fv_factor = (Math.pow(1 + r, n) - 1) / r * (1 + r);
    const required_sip = inf_adj / fv_factor;
    return { ...g, required_sip, inflation_adjusted: inf_adj };
  });

  const totalRequired = enriched.reduce((s, g) => s + (g.required_sip || 0), 0);
  const goalIcons = { retirement: "R", home: "H", education: "E", emergency: "Em", travel: "T", other: "O" };
  const goalColors = { retirement: "info", home: "success", education: "warning", emergency: "error", travel: "teal", other: "gray" };

  return (
    <div style={S.card}>
      <div style={S.h2}>Goal-based SIP planning</div>
      {enriched.length === 0 && <div style={{ fontSize: 13, color: "#9ca3af" }}>No goals added. Go back to Goals step to add life goals.</div>}
      {enriched.map((g, i) => (
        <div key={g.id} style={{ ...S.card, background: "#f9fafb", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ ...S.partnerBadge(goalColors[g.type] || "info"), width: 28, height: 28, fontSize: 11 }}>{goalIcons[g.type]}</div>
            <span style={{ fontWeight: 500, fontSize: 14 }}>{g.type.charAt(0).toUpperCase() + g.type.slice(1)}</span>
            {g.years && <span style={S.pill("info")}>{g.years} years</span>}
          </div>
          <div style={S.row}>
            <div style={{ ...S.metricCard, flex: 1 }}>
              <div style={S.metricLabel}>Target (today's value)</div>
              <div style={{ ...S.metricVal, fontSize: 16 }}>{fmtL(Number(g.target) || 0)}</div>
            </div>
            {g.inflation_adjusted && (
              <div style={{ ...S.metricCard, flex: 1 }}>
                <div style={S.metricLabel}>Inflation-adjusted</div>
                <div style={{ ...S.metricVal, fontSize: 16 }}>{fmtL(g.inflation_adjusted)}</div>
              </div>
            )}
            {g.required_sip && (
              <div style={{ ...S.metricCard, flex: 1, borderLeft: `3px solid ${totalRequired <= monthlyTarget ? "#22c55e" : "#ef4444"}` }}>
                <div style={S.metricLabel}>Monthly SIP needed</div>
                <div style={{ ...S.metricVal, fontSize: 16, color: totalRequired <= monthlyTarget ? "#15803d" : "#dc2626" }}>{fmtL(g.required_sip)}</div>
              </div>
            )}
          </div>
        </div>
      ))}
      {enriched.some(g => g.required_sip) && (
        <>
          <div style={S.divider} />
          <MetricGrid items={[
            { label: "Total SIP needed", value: fmtL(totalRequired), color: totalRequired <= monthlyTarget ? "success" : "error" },
            { label: "Your SIP budget", value: fmtL(monthlyTarget) },
            { label: "Surplus / shortfall", value: fmtL(Math.abs(monthlyTarget - totalRequired)), color: monthlyTarget >= totalRequired ? "success" : "error" },
          ]} />
          <div style={{ ...S.highlight, background: monthlyTarget >= totalRequired ? "#dcfce7" : "#fee2e2", borderColor: monthlyTarget >= totalRequired ? "#86efac" : "#fca5a5" }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: monthlyTarget >= totalRequired ? "#15803d" : "#dc2626" }}>
              {monthlyTarget >= totalRequired
                ? `Your SIP budget covers all goals with ₹${fmt(monthlyTarget - totalRequired)} to spare.`
                : `You need ₹${fmt(totalRequired - monthlyTarget)} more/month to meet all goals. Consider increasing SIPs or extending timelines.`
              }
            </div>
          </div>
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>Projections assume 12% CAGR equity returns and 6% inflation. Actual returns vary.</div>
        </>
      )}
    </div>
  );
}

function ResultsTaxSummary({ hra, nps }) {
  const total = hra.max_tax_saved + nps.total_household_saving;
  return (
    <div style={S.card}>
      <div style={S.h2}>Combined tax savings summary</div>
      <MetricGrid items={[
        { label: "HRA optimization", value: fmtL(hra.max_tax_saved), color: "info" },
        { label: "NPS deductions", value: fmtL(nps.total_household_saving), color: "success" },
        { label: "Total annual saving", value: fmtL(total), color: "success" },
      ]} />
      <BarChart items={[
        { label: "HRA saving", value: hra.max_tax_saved, color: "info" },
        { label: "NPS saving", value: nps.total_household_saving, color: "success" },
      ]} maxVal={total * 1.1} />
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────
const STEPS = [
  { id: "profiles", label: "Profiles" },
  { id: "insurance", label: "Insurance" },
  { id: "assets", label: "Assets" },
  { id: "goals", label: "Goals" },
  { id: "results", label: "Results" },
];

const defaultPartner = {
  name: "", age: 30, gross_income: 0, basic_salary: 0,
  hra_received: 0, rent_paid: 0, city: "", tax_bracket: 20,
  has_chronic_condition: false, current_health_cover: 0,
  savings: 0, mf_value: 0, pf_balance: 0, nps_balance: 0,
  property_value: 0, gold_value: 0,
  home_loan_outstanding: 0, car_loan: 0, credit_card_debt: 0, other_loans: 0,
};

export default function CouplesPlanner() {
  const [step, setStep] = useState("profiles");
  const [profiles, setProfiles] = useState({ partnerA: { ...defaultPartner }, partnerB: { ...defaultPartner } });
  const [goals, setGoals] = useState([]);
  const [monthlyTarget, setMonthlyTarget] = useState(30000);

  const pA = profiles.partnerA;
  const pB = profiles.partnerB;

  const results = useMemo(() => {
    if (step !== "results") return null;
    return {
      hra: calcHraOptimization(pA, pB),
      nps: calcNpsOptimization(pA, pB),
      sip: calcSipSplit(pA, pB, monthlyTarget),
      ins: calcHealthInsurance(pA, pB),
      nw: calcNetWorth(pA, pB),
    };
  }, [step, pA, pB, monthlyTarget]);

  const stepIdx = STEPS.findIndex(s => s.id === step);
  const canGoNext = step !== "results";
  const canGoPrev = stepIdx > 0;

  const nameA = pA.name || "Partner A";
  const nameB = pB.name || "Partner B";

  return (
    <div style={S.wrap}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={S.h1}>Couples financial planner</h1>
        <p style={{ fontSize: 14, color: "#6b7280", margin: "4px 0 0" }}>
          {nameA} & {nameB} · Joint tax & investment strategy
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {STEPS.map((s, i) => (
          <button key={s.id} style={S.stepTab(step === s.id)} onClick={() => setStep(s.id)}>
            <span style={{ fontSize: 11, color: "#9ca3af", marginRight: 4 }}>{i + 1}.</span>
            {s.label}
          </button>
        ))}
      </div>

      {step === "profiles" && <StepProfiles data={profiles} onChange={setProfiles} />}
      {step === "insurance" && <StepInsurance data={profiles} onChange={setProfiles} />}
      {step === "assets" && <StepAssets data={profiles} onChange={setProfiles} />}
      {step === "goals" && <StepGoals goals={goals} onChange={setGoals} monthlyTarget={monthlyTarget} onMonthlyChange={setMonthlyTarget} />}

      {step === "results" && results && (
        <div>
          <ResultsTaxSummary hra={results.hra} nps={results.nps} />
          <ResultsHra hra={results.hra} />
          <ResultsNps nps={results.nps} />
          <ResultsSip sip={results.sip} monthlyTarget={monthlyTarget} />
          <ResultsInsurance ins={results.ins} />
          <ResultsNetWorth nw={results.nw} />
          <ResultsGoals goals={goals} monthlyTarget={monthlyTarget} nw={results.nw} />
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
        <button onClick={() => setStep(STEPS[stepIdx - 1].id)} style={{ visibility: canGoPrev ? "visible" : "hidden", padding: "8px 16px", border: "1px solid #e5e7eb", borderRadius: 6, background: "#f9fafb", cursor: "pointer" }}>
          ← Back
        </button>
        {canGoNext && (
          <button
            onClick={() => setStep(STEPS[stepIdx + 1].id)}
            style={{ padding: "8px 16px", background: "#3b82f6", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}
          >
            {stepIdx === STEPS.length - 2 ? "Calculate results →" : "Next →"}
          </button>
        )}
      </div>
    </div>
  );
}
