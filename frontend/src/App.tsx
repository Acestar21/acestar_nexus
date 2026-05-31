import { useState } from 'react'
import Widget from './components/widget/Widget'
import Reminders from './components/dashboard/Reminders'
import Todos from './components/dashboard/Todo'
import Internships from './components/dashboard/Internship'
import './App.css'

type View = 'reminders' | 'todos' | 'internships'

export default function App() {
	const [expanded, setExpanded] = useState(false)
	const [view, setView] = useState<View>('reminders')

	if (expanded) {
		return (
			<div className="dashboard">
				<div className="dashboard-nav">
					<button className="collapse-btn" onClick={() => setExpanded(false)}>← back</button>
					<button className={`nav-btn ${view === 'reminders' ? 'active' : ''}`} onClick={() => setView('reminders')}>Reminders</button>
					<button className={`nav-btn ${view === 'todos' ? 'active' : ''}`} onClick={() => setView('todos')}>Todos</button>
					<button className={`nav-btn ${view === 'internships' ? 'active' : ''}`} onClick={() => setView('internships')}>Internships</button>
				</div>
				{view === 'reminders' && <Reminders />}
				{view === 'todos' && <Todos />}
				{view === 'internships' && <Internships />}
			</div>
		)
	}

	return (
		<div className="app-widget">
			<Widget onExpand={() => setExpanded(true)} />
		</div>
	)
}