import Fuse from 'fuse.js'
import nlp from 'compromise'

const departmentKeywords = {
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

const fuses = Object.fromEntries(
  Object.entries(departmentKeywords).map(([dept, words]) => [
    dept,
    new Fuse(words, { threshold: 0.35, includeScore: true }),
  ])
)

export function analyzeText(text) {
  const doc = nlp(text)

  const nouns = doc.nouns().out('array')
  const verbs = doc.verbs().out('array')
  const terms = doc.terms().out('array')
  const allTokens = [...new Set([...nouns, ...verbs, ...terms, text])]

  const scores = { finance: 0, technical: 0, support: 0 }
  const matchedKeywords = []

  for (const token of allTokens) {
    for (const [dept, fuse] of Object.entries(fuses)) {
      const results = fuse.search(token)
      if (results.length > 0) {
        const matchScore = 1 - (results[0].score ?? 1)
        scores[dept] += matchScore
        if (matchScore > 0.5) {
          matchedKeywords.push({ word: results[0].item, dept })
        }
      }
    }
  }

  const total = Object.values(scores).reduce((a, b) => a + b, 0)
  const normalized =
    total === 0
      ? { finance: 0, technical: 0, support: 0 }
      : Object.fromEntries(
          Object.entries(scores).map(([k, v]) => [k, v / total])
        )

  const top = Object.entries(normalized).sort((a, b) => b[1] - a[1])
  const department = top[0][1] > 0.2 ? top[0][0] : 'general'
  const confidence = Math.min(top[0][1] * 2.5, 1)

  const uniqueKeywords = [
    ...new Map(matchedKeywords.map((k) => [k.word, k])).values(),
  ]

  return { department, confidence, scores: normalized, nouns, verbs, matchedKeywords: uniqueKeywords }
}
