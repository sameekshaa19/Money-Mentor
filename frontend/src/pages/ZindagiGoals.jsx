import { useState } from 'react'
import axios from 'axios'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

const MOCK_PROFILE = { monthlyIncome: 120000, monthlyExpenses: 55000 }
const surplus = MOCK_PROFILE.monthlyIncome - MOCK_PROFILE.monthlyExpenses

const PRESET_GOALS = [
  { id: 'wedding',   name: 'Wedding',           defaultAmount: 3000000, defaultYears: 8,  expectedReturn: 12 },
  { id: 'education', name: "Child's Education", defaultAmount: 5000000, defaultYears: 12, expectedReturn: 12 },
  { id: 'home',      name: 'Home Purchase',     defaultAmount: 2500000, defaultYears: 5,  expectedReturn: 10 },
  { id: 'parents',   name: "Parents' Medical",  defaultAmount: 2000000, defaultYears: 3,  expectedReturn: 7  },
  { id: 'car',       name: 'Car',               defaultAmount: 800000,  defaultYears: 2,  expectedReturn: 7  },
  { id: 'vacation',  name: 'Vacation',          defaultAmount: 300000,  defaultYears: 1,  expectedReturn: 6  },
]

const INITIAL_GOALS = [
  { id: 1, name: 'Wedding',           targetAmount: 3000000, years: 8,  monthlySIP: 18500, fundCategory: 'Equity Fund',     conflict: false },
  { id: 2, name: "Child's Education", targetAmount: 5000000, years: 12, monthlySIP: 15000, fundCategory: 'Equity Large Cap', conflict: false },
  { id: 3, name: 'Home Purchase',     targetAmount: 2500000, years: 5,  monthlySIP: 32000, fundCategory: 'Hybrid Fund',      conflict: true  },
]

const formatINR = (n) => '\u20B9' + Number(n).toLocaleString('en-IN')

export default function ZindagiGoals() {
  const [goals, setGoals] = useState(INITIAL_GOALS)
  const [showPresets, setShowPresets] = useState(false)
  const [loading, setLoading] = useState(false)

  const totalSIP = goals.reduce((sum, g) => sum + g.monthlySIP, 0)
  const hasConflict = totalSIP > surplus
  const pct = Math.min((totalSIP / surplus) * 100, 100)

  const addGoal = async (preset) => {
    setLoading(true)
    setShowPresets(false)
    try {
      const payload = {
        goals: [{
          name: preset.name,
          target_amount: preset.defaultAmount,
          current_savings: 0,
          timeline_years: preset.defaultYears,
          expected_return: preset.expectedReturn,
        }],
        monthly_surplus: surplus,
      }
      const res = await axios.post('http://localhost:8000/api/goals', payload)
      const apiGoal = res.data.data.goals[0]
      const fundCategory = preset.defaultYears <= 3 ? 'Debt Fund' : preset.defaultYears <= 7 ? 'Hybrid Fund' : 'Equity Fund'
      const newGoal = {
        id: Date.now(),
        name: preset.name,
        targetAmount: preset.defaultAmount,
        years: preset.defaultYears,
        monthlySIP: Math.round(apiGoal.monthly_sip),
        fundCategory,
        conflict: false,
      }
      const updatedGoals = [...goals, newGoal]
      const newTotal = updatedGoals.reduce((s, g) => s + g.monthlySIP, 0)
      setGoals(updatedGoals.map(g => ({ ...g, conflict: newTotal > surplus })))
    } catch (err) {
      console.error('Goals API failed, using estimate', err)
      // fallback to estimate if backend is down
      const newGoal = {
        id: Date.now(),
        name: preset.name,
        targetAmount: preset.defaultAmount,
        years: preset.defaultYears,
        monthlySIP: Math.round(preset.defaultAmount / (preset.defaultYears * 12)),
        fundCategory: preset.defaultYears <= 3 ? 'Debt Fund' : preset.defaultYears <= 7 ? 'Hybrid Fund' : 'Equity Fund',
        conflict: false,
      }
      setGoals([...goals, newGoal])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>Zindagi Goals Planner</h1>
      <p style={{ color: '#8b949e', marginBottom: '28px', fontSize: '14px' }}>
        Plan for real Indian life goals — not just retirement
      </p>

      {hasConflict && (
        <div style={{
          background: '#f8514910',
          border: '1px solid #f8514940',
          borderRadius: '10px',
          padding: '14px 16px',
          marginBottom: '20px',
        }}>
          <div style={{ color: '#f85149', fontWeight: 600, fontSize: '13px' }}>SIP Conflict Detected</div>
          <div style={{ color: '#f8514980', fontSize: '12px', marginTop: '2px' }}>
            Total SIPs ({formatINR(totalSIP)}/mo) exceed investable surplus ({formatINR(surplus)}/mo)
          </div>
        </div>
      )}

      <Card style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '10px' }}>
          <span style={{ color: '#8b949e' }}>Total Goal SIPs</span>
          <span style={{ fontWeight: 700, color: hasConflict ? '#f85149' : '#a78bfa' }}>
            {formatINR(totalSIP)} / mo
          </span>
        </div>
        <div style={{ background: '#0d1117', borderRadius: '99px', height: '6px', overflow: 'hidden' }}>
          <div style={{
            height: '6px',
            borderRadius: '99px',
            width: `${pct}%`,
            background: hasConflict ? '#f85149' : 'linear-gradient(90deg, #7c3aed, #a78bfa)',
            transition: 'width 0.4s',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#8b949e', marginTop: '6px' }}>
          <span>{formatINR(0)}</span>
          <span>Surplus: {formatINR(surplus)}</span>
        </div>
      </Card>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
        {goals.map(g => (
          <Card key={g.id} style={{ borderColor: g.conflict ? '#f8514440' : '#30363d' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '15px' }}>{g.name}</div>
                <div style={{ color: '#8b949e', fontSize: '13px', marginTop: '2px' }}>
                  {formatINR(g.targetAmount)} in {g.years} yrs
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', alignItems: 'center' }}>
                  <span style={{
                    background: '#21262d', color: '#8b949e',
                    padding: '3px 10px', borderRadius: '20px', fontSize: '11px',
                  }}>{g.fundCategory}</span>
                  <span style={{ color: '#a78bfa', fontWeight: 700, fontSize: '14px' }}>
                    {formatINR(g.monthlySIP)}/mo
                  </span>
                  {g.conflict && (
                    <span style={{
                      background: '#f8514910', color: '#f85149',
                      padding: '3px 10px', borderRadius: '20px', fontSize: '11px',
                    }}>Conflict</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setGoals(goals.filter(x => x.id !== g.id))}
                style={{
                  background: 'none', border: 'none',
                  color: '#8b949e', cursor: 'pointer', fontSize: '16px',
                }}
              >x</button>
            </div>
          </Card>
        ))}
      </div>

      {!showPresets ? (
        <Button onClick={() => setShowPresets(true)} variant="ghost" style={{ width: '100%' }}>
          + Add a Goal
        </Button>
      ) : (
        <Card>
          <div style={{ fontSize: '13px', color: '#8b949e', marginBottom: '12px' }}>Choose a goal:</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {PRESET_GOALS.map(p => (
              <button key={p.id} onClick={() => addGoal(p)}
                style={{
                  background: '#0d1117',
                  border: '1px solid #30363d',
                  borderRadius: '10px',
                  padding: '14px 12px',
                  cursor: 'pointer',
                  color: '#e6edf3',
                  fontSize: '13px',
                  fontWeight: 500,
                  transition: 'border-color 0.2s',
                  fontFamily: 'Poppins, sans-serif',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#7c3aed'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#30363d'}
              >
                {p.name}
              </button>
            ))}
          </div>
          <button onClick={() => setShowPresets(false)}
            style={{
              background: 'none', border: 'none',
              color: '#8b949e', fontSize: '12px',
              marginTop: '12px', cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif',
            }}>
            Cancel
          </button>
        </Card>
      )}
    </div>
  )
}