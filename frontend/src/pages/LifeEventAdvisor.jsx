import { useState } from 'react'
import axios from 'axios'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

const LIFE_EVENTS = [
  { id: 'bonus', label: 'Got a Bonus', desc: 'Deploy a windfall smartly' },
  { id: 'inheritance', label: 'Received Inheritance', desc: 'Lump sum investment strategy' },
  { id: 'marriage', label: 'Getting Married', desc: 'Merge finances, plan together' },
  { id: 'baby', label: 'New Baby', desc: 'Insurance, education fund, will' },
  { id: 'job_loss', label: 'Lost My Job', desc: 'Emergency plan, cut expenses' },
  { id: 'home', label: 'Buying a Home', desc: 'EMI impact, tax benefits, SIP cuts' },
]

const formatINR = (n) => '\u20B9' + Number(n).toLocaleString('en-IN')
const formatVal = (v) => typeof v === 'number' ? formatINR(v) : v

// Mock profile — Day 6 this comes from Zustand store
const MOCK_PROFILE = {
  monthly_income: 120000,
  monthly_expenses: 55000,
  total_investments: 850000,
  insurance_cover: 5000000,
  emergency_fund: 180000,
}

export default function LifeEventAdvisor() {
  const [selected, setSelected] = useState(null)
  const [advice, setAdvice] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleEventClick = async (event) => {
    setSelected(event)
    setLoading(true)
    setAdvice(null)
    try {
      const res = await axios.post('http://localhost:8000/api/life-event', {
        event_type: event.id,
        ...MOCK_PROFILE,
        additional_details: null,
      })
      setAdvice(res.data.data)
    } catch (err) {
      console.error('Life event API failed', err)
      // fallback static mock
      setAdvice({
        before: { 'Monthly SIP': 25000, 'Emergency Fund': 180000, 'Insurance': '\u20B950L life', 'Net Worth': 850000 },
        after:  { 'Monthly SIP': 35000, 'Emergency Fund': 300000, 'Insurance': '\u20B91Cr life',  'Net Worth': 1650000 },
        recommendations: [
          'Increase term life cover to \u20B91 Cr immediately',
          'Top up health insurance to \u20B910L family floater',
          'Start \u20B95,000/mo SIP for education goal',
          'Build emergency fund to 6 months expenses',
          'Update nominee in all investments and insurance',
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  if (selected) {
    return (
      <div>
        <button onClick={() => { setSelected(null); setAdvice(null) }}
          style={{
            background: 'none', border: 'none',
            color: '#8b949e', cursor: 'pointer',
            fontSize: '13px', marginBottom: '20px',
            fontFamily: 'Poppins, sans-serif',
          }}>
          &larr; Back
        </button>

        <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>{selected.label}</h1>
        <p style={{ color: '#8b949e', fontSize: '13px', marginBottom: '28px' }}>{selected.desc}</p>

        {loading && (
          <div style={{ color: '#8b949e', fontSize: '14px', textAlign: 'center', padding: '40px' }}>
            Analysing your financial situation...
          </div>
        )}

        {!loading && advice && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              {['before', 'after'].map(state => (
                <Card key={state} style={{ borderColor: state === 'after' ? '#7c3aed40' : '#30363d' }}>
                  <div style={{
                    fontSize: '11px', fontWeight: 700,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    color: state === 'after' ? '#a78bfa' : '#8b949e',
                    marginBottom: '16px',
                  }}>
                    {state === 'before' ? 'Before' : 'After'}
                  </div>
                  {Object.entries(advice[state] || {}).map(([key, val]) => (
                    <div key={key} style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '8px 0', borderBottom: '1px solid #21262d',
                      fontSize: '13px',
                    }}>
                      <span style={{ color: '#8b949e' }}>{key}</span>
                      <span style={{ fontWeight: 600, color: state === 'after' ? '#a78bfa' : '#e6edf3' }}>
                        {formatVal(val)}
                      </span>
                    </div>
                  ))}
                </Card>
              ))}
            </div>

            <Card>
              <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '16px' }}>Action Plan</div>
              <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(advice.recommendations || []).map((action, i) => (
                  <li key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', fontSize: '13px', color: '#c9d1d9' }}>
                    <span style={{
                      background: '#7c3aed20', color: '#a78bfa',
                      borderRadius: '50%', width: '22px', height: '22px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: 700, flexShrink: 0,
                    }}>{i + 1}</span>
                    {action}
                  </li>
                ))}
              </ol>
            </Card>
          </>
        )}
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>Life Event Advisor</h1>
      <p style={{ color: '#8b949e', marginBottom: '28px', fontSize: '14px' }}>
        Your financial plan, updated for life's big moments
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {LIFE_EVENTS.map(event => (
          <Card key={event.id} onClick={() => handleEventClick(event)} style={{ cursor: 'pointer' }}>
            <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{event.label}</div>
            <div style={{ color: '#8b949e', fontSize: '12px' }}>{event.desc}</div>
          </Card>
        ))}
      </div>
    </div>
  )
}