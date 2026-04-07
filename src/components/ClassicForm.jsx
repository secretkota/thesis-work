import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'

const schema = z.object({
  name: z 
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name is too long'),
  email: z.string().email('Please enter a valid email'),
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .max(100, 'Subject is too long'),
  message: z
    .string()
    .min(20, 'Message must be at least 20 characters')
    .max(500, 'Message is too long (max 500)'),
})

function Field({ label, error, children }) {
  return (
    <div className="field">
      <label className="label">{label}</label>
      {children}
      {error && <p className="error">{error}</p>}
    </div>
  )
}

export default function ClassicForm() {
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = (data) => {
    console.log('Classic form submitted:', data)
    setSuccess(true)
    reset()
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>

      <Field label="Full name" error={errors.name?.message}>
        <input
          className={`input ${errors.name ? 'input--error' : ''}`}
          placeholder="John Smith"
          {...register('name')}
        />
      </Field>

      <Field label="Email address" error={errors.email?.message}>
        <input
          type="email"
          className={`input ${errors.email ? 'input--error' : ''}`}
          placeholder="john@example.com"
          {...register('email')}
        />
      </Field>

      <Field label="Subject" error={errors.subject?.message}>
        <input
          className={`input ${errors.subject ? 'input--error' : ''}`}
          placeholder="Brief topic of your message"
          {...register('subject')}
        />
      </Field>

      <Field label="Message" error={errors.message?.message}>
        <textarea
          className={`textarea ${errors.message ? 'input--error' : ''}`}
          placeholder="Your message (20–500 characters)"
          rows={5}
          {...register('message')}
        />
      </Field>

      <button type="submit" className="btn" disabled={isSubmitting}>
        Send message
      </button>

      {success && (
        <div className="success-banner">Message sent successfully!</div>
      )}
    </form>
  )
}
