
import { useState } from 'react'
import { ClassicForm } from './components/ClassicForm.jsx'
import { SemanticFormDemo } from './components/SemanticFormDemo.jsx'

const TABS = [
  { id: 'classic',  label: 'Classic Form',  subtitle: 'Zod validation' },
  { id: 'semantic', label: 'Semantic Form',  subtitle: 'NLP + routing' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('classic')

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={styles.title}>
          <span style={styles.titleAccent}>react-semantic-form</span>
        </h1>
        <p style={styles.subtitle}>
          A React library that adds semantic NLP validation on top of react-hook-form
        </p>
        <code style={styles.code}>
          import {'{ useSemanticForm, SemanticField }'} from 'react-semantic-form'
        </code>
      </header>

      <main style={styles.main}>
        <div style={styles.tabs}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.tab,
                ...(activeTab === tab.id ? styles.tabActive : {}),
              }}
            >
              <span style={styles.tabLabel}>{tab.label}</span>
              <span style={styles.tabSub}>{tab.subtitle}</span>
            </button>
          ))}
        </div>

        <div style={styles.panel}>
          {activeTab === 'classic' ? <ClassicForm /> : <SemanticFormDemo />}
        </div>
      </main>
    </div>
  )
}

const styles = {
  app: { minHeight: '100vh', background: '#f3f4f6', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  header: { background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', padding: '40px 24px', textAlign: 'center', color: 'white' },
  title: { margin: '0 0 8px', fontSize: 32, fontWeight: 800 },
  titleAccent: { color: '#a5b4fc' },
  subtitle: { margin: '0 0 16px', color: '#c7d2fe', fontSize: 16 },
  code: { display: 'inline-block', background: 'rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: 6, fontSize: 13, color: '#e0e7ff' },
  main: { maxWidth: 720, margin: '0 auto', padding: '32px 16px' },
  tabs: { display: 'flex', gap: 8, marginBottom: 24 },
  tab: {
    flex: 1, padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: 10,
    background: 'white', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
    display: 'flex', flexDirection: 'column', gap: 2,
  },
  tabActive: { borderColor: '#6366f1', background: '#eef2ff' },
  tabLabel: { fontWeight: 600, fontSize: 15, color: '#1f2937' },
  tabSub: { fontSize: 12, color: '#9ca3af' },
  panel: { background: 'white', borderRadius: 12, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
}
