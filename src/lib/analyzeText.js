
import Fuse from 'fuse.js'
import nlp from 'compromise'

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
  const doc = nlp(text)

  const nouns = doc.nouns().out('array')
  const verbs = doc.verbs().out('array')
  const terms = doc.terms().out('array')

  const allTokens = [...new Set([...nouns, ...verbs, ...terms, text])]

  const scores = { finance: 0, technical: 0, support: 0 }
  const matchedKeywords = []

  for (const token of allTokens) {
    for (const [category, searcher] of Object.entries(categorySearchers)) {
      const results = searcher.search(token)

      if (results.length > 0) {
        const matchScore = 1 - (results[0].score ?? 1)
        scores[category] += matchScore

        if (matchScore > 0.5) {
          matchedKeywords.push({ word: results[0].item, category })
        }
      }
    }
  }

  const total = Object.values(scores).reduce((a, b) => a + b, 0)
  const normalizedScores =
    total === 0
      ? { finance: 0, technical: 0, support: 0 }
      : Object.fromEntries(
          Object.entries(scores).map(([k, v]) => [k, v / total])
        )

  const sorted = Object.entries(normalizedScores).sort((a, b) => b[1] - a[1])

  const category = sorted[0][1] > 0.2 ? sorted[0][0] : 'general'

  const confidence = Math.min(sorted[0][1] * 2.5, 1)

  const uniqueKeywords = [
    ...new Map(matchedKeywords.map((k) => [k.word, k])).values(),
  ]

  return {
    category,
    confidence,
    scores: normalizedScores,
    matchedKeywords: uniqueKeywords,
    nouns,
    verbs,
  }
}
