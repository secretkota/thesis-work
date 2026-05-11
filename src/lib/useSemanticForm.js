
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useCallback } from 'react'
import { analyzeText } from './analyzeText.js'

/**
 * useSemanticForm — расширяет useForm семантической валидацией
 *
 * @param {object} options
 * @param {ZodSchema} options.schema          — Zod-схема для валидации
 * @param {string[]} options.semanticFields   — список имён полей, которые нужно анализировать
 * @param {function} [options.onSemanticResult] — колбэк: вызывается при каждом изменении анализа
 *
 * @returns всё что возвращает useForm + семантический результат
 */
export function useSemanticForm({ schema, semanticFields = [], onSemanticResult }) {
  const form = useForm({
    resolver: zodResolver(schema),
  })

  const watchedValues = useWatch({ control: form.control })

  const [semanticResults, setSemanticResults] = useState({})

  const getSemanticResult = useCallback((fieldName) => {
    if (!semanticFields.includes(fieldName)) return null

    const text = watchedValues?.[fieldName] ?? ''

    if (text.length < 8) return null

    const result = analyzeText(text)

    setSemanticResults((prev) => ({ ...prev, [fieldName]: result }))
    if (onSemanticResult) {
      onSemanticResult(fieldName, result)
    }

    return result
  }, [watchedValues, semanticFields, onSemanticResult])

  return {
    ...form,                 // register, handleSubmit, formState, watch, reset...
    semanticResults,         // результаты анализа всех полей { fieldName: result }
    getSemanticResult,       // функция для получения результата конкретного поля
    analyzeField: analyzeText, // экспортируем analyzeText напрямую для продвинутых случаев
  }
}
