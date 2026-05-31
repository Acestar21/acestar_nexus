import { useState } from 'react'
import Widget from './components/widget/widget'
import Reminders from './components/dashboard/Reminders'
import './App.css'

export default function App() {
	const [expanded, setExpanded] = useState(false)

	if (expanded) {
		return (
			<div className="dashboard">
				<button className="collapse-btn" onClick={() => setExpanded(false)}>
					← back
				</button>
				<Reminders />
			</div>
		)
	}

	return (
		<div className="app-widget">
			<Widget onExpand={() => setExpanded(true)} />
		</div>
	)
}