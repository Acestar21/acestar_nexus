import { useState, useEffect } from 'react'
import Widget from './components/widget/Widget'
import Reminders from './components/dashboard/Reminders'
import Todos from './components/dashboard/Todo'
import Internships from './components/dashboard/Internship'
import Goals from './components/dashboard/Goals'
import Fitness from './components/dashboard/Fitness'
import './App.css'
import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window'

type View = 'reminders' | 'todos' | 'internships' | 'goals' | 'fitness'

export default function App() {
	const [expanded, setExpanded] = useState(false)
	const [view, setView] = useState<View>('reminders')

	useEffect(() => {
		const win = getCurrentWindow()
		if (expanded) {
			win.setSize(new LogicalSize(1000, 700))
		} else {
			win.setSize(new LogicalSize(360, 160))
		}
	}, [expanded])

	function handleExpand() {
		setExpanded(true)
	}

	function handleCollapse() {
		setExpanded(false)
	}

	if (expanded) {
		return (
			<div className="dashboard">
				<div className="dashboard-nav">
					<button className="collapse-btn" onClick={handleCollapse}>← back</button>
					<button className={`nav-btn ${view === 'reminders' ? 'active' : ''}`} onClick={() => setView('reminders')}>Reminders</button>
					<button className={`nav-btn ${view === 'todos' ? 'active' : ''}`} onClick={() => setView('todos')}>Todos</button>
					<button className={`nav-btn ${view === 'internships' ? 'active' : ''}`} onClick={() => setView('internships')}>Internships</button>
					<button className={`nav-btn ${view === 'goals' ? 'active' : ''}`} onClick={() => setView('goals')}>Goals</button>
					<button className={`nav-btn ${view === 'fitness' ? 'active' : ''}`} onClick={() => setView('fitness')}>Fitness</button>
				</div>
				{view === 'reminders' && <Reminders />}
				{view === 'todos' && <Todos />}
				{view === 'internships' && <Internships />}
				{view === 'goals' && <Goals />}
				{view === 'fitness' && <Fitness />}
			</div>
		)
	}

	return (
		<div className="app-widget">
			<Widget onExpand={handleExpand} />
		</div>
	)
}