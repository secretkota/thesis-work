
import { useFormContext, useWatch } from 'react-hook-form'
import { analyzeText } from './analyzeText.js'

const CATEGORY_META = {
  finance:   { label: 'Finance',   color: '#16a34a' },
  technical: { label: 'Technical', color: '#3b82f6' },
  support:   { label: 'Support',   color: '#f59e0b' },
  general:   { label: 'General',   color: '#a855f7' },
}

/**
 * SemanticField — умное поле ввода с NLP-анализом
 *
 * Использование:
 *   <SemanticField name="message" label="Describe your issue" rows={5} />
 *
 * Компонент сам подключается к форме через useFormContext(),
 * поэтому его нужно использовать внутри <FormProvider> от react-hook-form.
 *
 * @param {string}  name    — имя поля (должно совпадать с ключом в Zod-схеме)
 * @param {string}  label   — подпись поля
 * @param {number}  [rows]  — высота textarea в строках (по умолчанию 5)
 * @param {string}  [placeholder]
 */
export function SemanticField({ name, label, rows = 5, placeholder }) {
  const { register, formState: { errors } } = useFormContext()

  const value = useWatch({ name })
  const result = value && value.length > 8 ? analyzeText(value) : null

  const error = errors[name]
  const meta = result ? CATEGORY_META[result.category] : null

  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>

      <textarea
        rows={rows}
        placeholder={placeholder}
        style={{
          ...styles.textarea,
          borderColor: error ? '#ef4444' : '#d1d5db',
        }}
        {...register(name)}
      />

      {error && <p style={styles.error}>{error.message}</p>}

      {result && meta && (
        <div style={styles.panel}>
          <p style={styles.panelTitle}>Live semantic analysis</p>

          <div style={{ ...styles.badge, background: meta.color + '18', border: `1px solid ${meta.color}`, color: meta.color }}>
            {meta.label} department
            <span style={styles.confidence}>
              {Math.round(result.confidence * 100)}% confidence
            </span>
          </div>

          <div style={{ marginTop: 8 }}>
            {Object.entries(result.scores).map(([dept, score]) => (
              <div key={dept} style={styles.scoreRow}>
                <span style={styles.scoreName}>{dept}</span>
                <div style={styles.scoreTrack}>
                  <div style={{
                    ...styles.scoreFill,
                    width: `${Math.round(score * 100)}%`,
                    background: CATEGORY_META[dept]?.color ?? '#888',
                  }} />
                </div>
                <span style={styles.scorePct}>{Math.round(score * 100)}%</span>
              </div>
            ))}
          </div>

          {result.matchedKeywords.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <p style={styles.chipsTitle}>Matched keywords</p>
              <div style={styles.chipsList}>
                {result.matchedKeywords.slice(0, 8).map((kw, i) => (
                  <span key={i} style={styles.chip}>{kw.word}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const styles = {
  field: { marginBottom: 16 },
  label: { display: 'block', marginBottom: 4, fontWeight: 500, fontSize: 14, color: '#374151' },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: '1.5px solid #d1d5db',
    borderRadius: 8,
    fontSize: 14,
    resize: 'vertical',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  error: { color: '#ef4444', fontSize: 12, marginTop: 4 },
  panel: {
    marginTop: 8,
    padding: 12,
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
  },
  panelTitle: { fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 8px' },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '4px 10px',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
  },
  confidence: { fontSize: 11, opacity: 0.8 },
  scoreRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 },
  scoreName: { width: 65, fontSize: 12, color: '#6b7280', textTransform: 'capitalize' },
  scoreTrack: { flex: 1, height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' },
  scoreFill: { height: '100%', borderRadius: 3, transition: 'width 0.3s ease' },
  scorePct: { width: 32, fontSize: 12, color: '#6b7280', textAlign: 'right' },
  chipsTitle: { fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', margin: '0 0 4px' },
  chipsList: { display: 'flex', flexWrap: 'wrap', gap: 4 },
  chip: { background: '#e5e7eb', borderRadius: 12, padding: '2px 8px', fontSize: 12, color: '#374151' },
}
