import { useState } from 'react'
import Widget from './components/widget/widget'
import './App.css'

export default function App() {
  const [expanded, setExpanded] = useState(false)

  if (expanded) {
    return (
      <div className="dashboard">
        <button className="collapse-btn" onClick={() => setExpanded(false)}>
          ← back
        </button>
        <h1>Dashboard</h1>
      </div>
    )
  }

  return (
    <div className="app-widget">
      <Widget onExpand={() => setExpanded(true)} />
    </div>
  )
}