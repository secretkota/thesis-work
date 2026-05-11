
import { useState } from 'react'
import { FormProvider } from 'react-hook-form'
import { z } from 'zod'

import { useSemanticForm } from '/../src/lib/useSemanticForm.js'
import { SemanticField } from '/../src/lib/SemanticField.jsx'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  message: z.string().min(10, 'Please describe your issue (min 10 characters)'),
})

const CATEGORY_COLORS = {
  finance:   '#16a34a',
  technical: '#3b82f6',
  support:   '#f59e0b',
  general:   '#a855f7',
}

export function SemanticFormDemo() {
  const [tickets, setTickets] = useState([])
  const [success, setSuccess] = useState(false)

  const form = useSemanticForm({
    schema,
    semanticFields: ['message'], // только поле "message" анализируем семантически
  })

  const { register, handleSubmit, reset, formState: { errors } } = form

  const onSubmit = (data) => {
    const result = form.analyzeField(data.message)

    setTickets((prev) => [
      {
        id: Date.now(),
        name: data.name,
        message: data.message,
        category: result.category,
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
      <p style={styles.description}>
        Semantic form using <strong>useSemanticForm</strong> + <strong>SemanticField</strong>.
        The message field is analyzed in real-time and the ticket is automatically routed.
      </p>

      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>

          <div style={{ marginBottom: 16 }}>
            <label style={styles.label}>Full name</label>
            <input
              style={{ ...styles.input, borderColor: errors.name ? '#ef4444' : '#d1d5db' }}
              placeholder="John Smith"
              {...register('name')}
            />
            {errors.name && <p style={styles.error}>{errors.name.message}</p>}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={styles.label}>Email address</label>
            <input
              type="email"
              style={{ ...styles.input, borderColor: errors.email ? '#ef4444' : '#d1d5db' }}
              placeholder="john@example.com"
              {...register('email')}
            />
            {errors.email && <p style={styles.error}>{errors.email.message}</p>}
          </div>

          <SemanticField
            name="message"
            label="Describe your issue"
            rows={5}
            placeholder={'Try typing:\n"My payment didn\'t go through"\n"The app keeps crashing"'}
          />

          <button type="submit" style={styles.btn}>
            Submit & route ticket →
          </button>

          {success && (
            <div style={styles.success}>✓ Ticket routed successfully!</div>
          )}
        </form>
      </FormProvider>

      {tickets.length > 0 && (
        <div style={styles.log}>
          <p style={styles.logTitle}>Routed tickets ({tickets.length})</p>
          {tickets.map((ticket) => {
            const color = CATEGORY_COLORS[ticket.category] ?? '#888'
            return (
              <div key={ticket.id} style={styles.ticket}>
                <div style={{ ...styles.dot, background: color }} />
                <div style={{ flex: 1 }}>
                  <div style={styles.ticketHeader}>
                    <span style={styles.ticketName}>{ticket.name}</span>
                    <span style={styles.ticketTime}>{ticket.time}</span>
                  </div>
                  <p style={{ ...styles.ticketRoute, color }}>
                    → {ticket.category} · {Math.round(ticket.confidence * 100)}% confidence
                  </p>
                  <p style={styles.ticketMsg}>
                    {ticket.message.length > 100 ? ticket.message.slice(0, 100) + '…' : ticket.message}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const styles = {
  description: { color: '#6b7280', fontSize: 14, marginBottom: 20, lineHeight: 1.5 },
  label: { display: 'block', marginBottom: 4, fontWeight: 500, fontSize: 14, color: '#374151' },
  input: {
    width: '100%', padding: '10px 12px', border: '1.5px solid #d1d5db',
    borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  error: { color: '#ef4444', fontSize: 12, marginTop: 4 },
  btn: {
    padding: '10px 24px', background: '#4f46e5', color: 'white',
    border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600,
    cursor: 'pointer', marginTop: 8,
  },
  success: {
    marginTop: 12, padding: '10px 16px', background: '#dcfce7',
    border: '1px solid #86efac', borderRadius: 8, color: '#16a34a', fontSize: 14,
  },
  log: { marginTop: 28, borderTop: '1px solid #e5e7eb', paddingTop: 20 },
  logTitle: { fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: 12 },
  ticket: { display: 'flex', gap: 12, marginBottom: 12, padding: 12, background: '#f9fafb', borderRadius: 8 },
  dot: { width: 10, height: 10, borderRadius: '50%', marginTop: 5, flexShrink: 0 },
  ticketHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 2 },
  ticketName: { fontWeight: 600, fontSize: 14 },
  ticketTime: { fontSize: 12, color: '#9ca3af' },
  ticketRoute: { fontSize: 12, fontWeight: 600, margin: '0 0 2px', textTransform: 'capitalize' },
  ticketMsg: { fontSize: 13, color: '#6b7280', margin: 0 },
}
