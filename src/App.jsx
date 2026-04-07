import { useState } from 'react'
import ClassicForm from './components/ClassicForm'
import SemanticForm from './components/SemanticForm'
import './index.css'

const TABS = [
  { id: 'classic',  label: 'Classic validation',  badge: 'Zod' },
  { id: 'semantic', label: 'Semantic validation',  badge: 'NLP' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('classic')

  return (
    <div className="app">
      <header className="header">
        <h1 className="header-title">
          Form Validation: <span>Classic vs Semantic</span>
        </h1>
      </header>

      <main className="main">
        <div className="tabs" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`tab ${activeTab === tab.id ? 'tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              <span className="tab-badge">{tab.badge}</span>
            </button>
          ))}
        </div>

        <div className="panel" role="tabpanel">
          {activeTab === 'classic' ? <ClassicForm /> : <SemanticForm />}
        </div>
      </main>
    </div>
  )
}
