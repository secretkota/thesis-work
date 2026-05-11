// analyzeText.js — ядро библиотеки
// Принимает строку текста, возвращает к какой категории относится этот текст

import Fuse from 'fuse.js'
import nlp from 'compromise'

// Словари слов для каждой категории (департамента)
// Ключ — название категории, значение — массив ключевых слов
const CATEGORY_KEYWORDS = {
  finance: [
    'payment', 'pay', 'paid', 'billing', 'invoice', 'refund',
    'charge', 'transaction', 'subscription', 'price', 'fee',
    'cost', 'receipt', 'bank', 'credit', 'debit', 'purchase', 'order',
  ],
  technical: [
    'bug', 'error', 'crash', 'broken', 'fix', 'issue', 'glitch',
    'fail', 'not working', 'slow', 'down', 'outage', 'server',
    'login failed', 'cannot login', 'reset', 'loading',
  ],
  support: [
    'help', 'account', 'password', 'access', 'blocked', 'locked',
    'profile', 'settings', 'notification', 'email', 'username',
    'sign in', 'sign up', 'verification', 'two factor',
  ],
}

// Создаём объект Fuse (нечёткий поиск) для каждой категории
// Fuse позволяет находить слова даже при опечатках
// threshold: 0.35 — чем меньше, тем строже совпадение
const categorySearchers = Object.fromEntries(
  Object.entries(CATEGORY_KEYWORDS).map(([category, words]) => [
    category,
    new Fuse(words, { threshold: 0.35, includeScore: true }),
  ])
)

/**
 * analyzeText — анализирует текст и определяет его категорию
 *
 * @param {string} text — текст для анализа
 * @returns {{
 *   category: string,       — определённая категория (finance/technical/support/general)
 *   confidence: number,     — уверенность от 0 до 1
 *   scores: object,         — баллы по каждой категории
 *   matchedKeywords: array  — найденные ключевые слова
 * }}
 */
export function analyzeText(text) {
  // nlp() парсит текст через библиотеку compromise
  const doc = nlp(text)

  // Извлекаем существительные, глаголы и все слова
  const nouns = doc.nouns().out('array')
  const verbs = doc.verbs().out('array')
  const terms = doc.terms().out('array')

  // Объединяем всё в один массив без повторений + добавляем весь текст целиком
  const allTokens = [...new Set([...nouns, ...verbs, ...terms, text])]

  // Начальные баллы для каждой категории
  const scores = { finance: 0, technical: 0, support: 0 }
  const matchedKeywords = []

  // Для каждого токена проверяем совпадение с каждой категорией
  for (const token of allTokens) {
    for (const [category, searcher] of Object.entries(categorySearchers)) {
      const results = searcher.search(token)

      if (results.length > 0) {
        // score от Fuse: 0 = идеальное совпадение, 1 = нет совпадения
        // Переворачиваем: matchScore близко к 1 = хорошее совпадение
        const matchScore = 1 - (results[0].score ?? 1)
        scores[category] += matchScore

        // Сохраняем ключевое слово, если совпадение достаточно сильное
        if (matchScore > 0.5) {
          matchedKeywords.push({ word: results[0].item, category })
        }
      }
    }
  }

  // Нормализуем баллы: делаем так, чтобы сумма всех была = 1 (или 0)
  const total = Object.values(scores).reduce((a, b) => a + b, 0)
  const normalizedScores =
    total === 0
      ? { finance: 0, technical: 0, support: 0 }
      : Object.fromEntries(
          Object.entries(scores).map(([k, v]) => [k, v / total])
        )

  // Сортируем категории по убыванию баллов
  const sorted = Object.entries(normalizedScores).sort((a, b) => b[1] - a[1])

  // Если максимальный балл > 0.2 — берём эту категорию, иначе "general"
  const category = sorted[0][1] > 0.2 ? sorted[0][0] : 'general'

  // Уверенность: масштабируем балл победителя в диапазон 0..1
  const confidence = Math.min(sorted[0][1] * 2.5, 1)

  // Убираем дубликаты ключевых слов
  const uniqueKeywords = [
    ...new Map(matchedKeywords.map((k) => [k.word, k])).values(),
  ]

  return {
    category,
    confidence,
    scores: normalizedScores,
    matchedKeywords: uniqueKeywords,
    // Возвращаем токены для отображения в UI
    nouns,
    verbs,
  }
}
