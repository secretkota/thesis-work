import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { analyzeText } from '../utils/semanticAnalyzer'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  message: z
    .string()
    .min(10, 'Please describe your issue (min 10 characters)')
    .max(1000, 'Too long (max 1000)'),
})

const DEPT_META = {
  finance:   { label: 'Finance',   color: '#16a34a', bg: 'rgba(22,163,74,0.1)',  },
  technical: { label: 'Technical', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', },
  support:   { label: 'Support',   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', },
  general:   { label: 'General',   color: '#a855f7', bg: 'rgba(168,85,247,0.1)', },
}

function AnalysisPanel({ result }) {
  const meta = DEPT_META[result.department]

  return (
    <div className="analysis-panel">
      <p className="analysis-label">Live semantic analysis</p>

      <div
        className="dept-badge"
        style={{ background: meta.bg, color: meta.color, borderColor: meta.color }}
      >
        {meta.icon} {meta.label} department
        <span className="confidence">
          {Math.round(result.confidence * 100)}% confidence
        </span>
      </div>

      <div className="score-bars">
        {Object.entries(result.scores).map(([dept, score]) => (
          <div key={dept} className="score-row">
            <span className="score-name">{dept}</span>
            <div className="score-track">
              <div
                className="score-fill"
                style={{
                  width: `${Math.round(score * 100)}%`,
                  background: DEPT_META[dept]?.color ?? '#888',
                }}
              />
            </div>
            <span className="score-pct">{Math.round(score * 100)}%</span>
          </div>
        ))}
      </div>

      {result.matchedKeywords.length > 0 && (
        <div className="keywords">
          <p className="keywords-label">Matched keywords</p>
          <div className="keywords-list">
            {result.matchedKeywords.slice(0, 8).map((kw, i) => (
              <span key={i} className="keyword-chip">
                {kw.word}
              </span>
            ))}
          </div>
        </div>
      )}

      {(result.nouns.length > 0 || result.verbs.length > 0) && (
        <div className="nlp-tokens">
          <p className="keywords-label">NLP tokens</p>
          <div className="keywords-list">
            {result.nouns.slice(0, 5).map((n, i) => (
              <span key={i} className="token-chip token-noun">{n}</span>
            ))}
            {result.verbs.slice(0, 4).map((v, i) => (
              <span key={i} className="token-chip token-verb">{v}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TicketLog({ tickets }) {
  if (tickets.length === 0) return null

  return (
    <div className="ticket-log">
      <p className="ticket-log-title">Routed tickets ({tickets.length})</p>
      {tickets.map((t) => {
        const meta = DEPT_META[t.department]
        return (
          <div key={t.id} className="ticket-item">
            <div className="ticket-dot" style={{ background: meta.color }} />
            <div className="ticket-body">
              <div className="ticket-header">
                <span className="ticket-name">{t.name}</span>
                <span className="ticket-time">{t.time}</span>
              </div>
              <p className="ticket-meta">
                → <span style={{ color: meta.color }}>{meta.label}</span>
                {' '}· {Math.round(t.confidence * 100)}% confidence
              </p>
              <p className="ticket-message">
                {t.message.length > 100 ? t.message.slice(0, 100) + '…' : t.message}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function SemanticForm() {
  const [tickets, setTickets] = useState([])
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  const messageValue = watch('message', '')
  const liveResult = messageValue.length > 8 ? analyzeText(messageValue) : null

  const onSubmit = (data) => {
    const result = analyzeText(data.message)

    setTickets((prev) => [
      {
        id: Date.now(),
        name: data.name,
        email: data.email,
        message: data.message,
        department: result.department,
        confidence: result.confidence,
        time: new Date().toLocaleTimeString(),
      },
      ...prev,
    ])

    setSuccess(true)
    reset()
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="field">
          <label className="label">Full name</label>
          <input
            className={`input ${errors.name ? 'input--error' : ''}`}
            placeholder="John Smith"
            {...register('name')}
          />
          {errors.name && <p className="error">{errors.name.message}</p>}
        </div>

        <div className="field">
          <label className="label">Email address</label>
          <input
            type="email"
            className={`input ${errors.email ? 'input--error' : ''}`}
            placeholder="john@example.com"
            {...register('email')}
          />
          {errors.email && <p className="error">{errors.email.message}</p>}
        </div>

        <div className="field">
          <label className="label">Describe your issue</label>
          <textarea
            className={`textarea ${errors.message ? 'input--error' : ''}`}
            placeholder={'Try typing:\n"My payment didn\'t go through"\n"The app keeps crashing on login"'}
            rows={5}
            {...register('message')}
          />
          {errors.message && <p className="error">{errors.message.message}</p>}
        </div>

        {liveResult && <AnalysisPanel result={liveResult} />}

        <button type="submit" className="btn" style={{ marginTop: '16px' }}>
          Submit & route ticket
        </button>

        {success && (
          <div className="success-banner">Ticket routed successfully!</div>
        )}
      </form>

      <TicketLog tickets={tickets} />
    </div>
  )
}
