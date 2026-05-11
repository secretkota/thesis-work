import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
})

function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={styles.label}>{label}</label>
      {children}
      {error && <p style={styles.error}>{error}</p>}
    </div>
  )
}

export function ClassicForm() {
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data) => {
    console.log('Submitted:', data)
    setSuccess(true)
    reset() // сбрасываем форму
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div>
      <p style={styles.description}>
        Standard form validation using <strong>react-hook-form</strong> + <strong>Zod</strong>.
        Checks only format rules: length, email format, etc.
      </p>

      {/* handleSubmit(onSubmit) — RHF сначала валидирует, потом вызывает onSubmit */}
      {/* noValidate отключает встроенную браузерную валидацию */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field label="Full name" error={errors.name?.message}>
          <input
            style={{ ...styles.input, borderColor: errors.name ? '#ef4444' : '#d1d5db' }}
            placeholder="John Smith"
            {...register('name')}
          />
        </Field>

        <Field label="Email address" error={errors.email?.message}>
          <input
            type="email"
            style={{ ...styles.input, borderColor: errors.email ? '#ef4444' : '#d1d5db' }}
            placeholder="john@example.com"
            {...register('email')}
          />
        </Field>

        <Field label="Subject" error={errors.subject?.message}>
          <input
            style={{ ...styles.input, borderColor: errors.subject ? '#ef4444' : '#d1d5db' }}
            placeholder="Brief topic of your message"
            {...register('subject')}
          />
        </Field>

        <Field label="Message" error={errors.message?.message}>
          <textarea
            rows={5}
            style={{ ...styles.input, ...styles.textarea, borderColor: errors.message ? '#ef4444' : '#d1d5db' }}
            placeholder="Your message (min 20 characters)"
            {...register('message')}
          />
        </Field>

        <button type="submit" style={styles.btn}>Send message</button>

        {success && <div style={styles.success}>✓ Message sent successfully!</div>}
      </form>
    </div>
  )
}

const styles = {
  description: { color: '#6b7280', fontSize: 14, marginBottom: 20, lineHeight: 1.5 },
  label: { display: 'block', marginBottom: 4, fontWeight: 500, fontSize: 14, color: '#374151' },
  input: {
    width: '100%', padding: '10px 12px', border: '1.5px solid #d1d5db',
    borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit', transition: 'border-color 0.2s',
  },
  textarea: { resize: 'vertical' },
  error: { color: '#ef4444', fontSize: 12, marginTop: 4 },
  btn: {
    padding: '10px 24px', background: '#6366f1', color: 'white',
    border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600,
    cursor: 'pointer', marginTop: 8,
  },
  success: {
    marginTop: 12, padding: '10px 16px', background: '#dcfce7',
    border: '1px solid #86efac', borderRadius: 8, color: '#16a34a', fontSize: 14,
  },
}
