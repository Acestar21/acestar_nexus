import { useState, useEffect } from 'react'
import Widget from './components/widget/Widget'
import Sidebar, { type NavView } from './components/layout/Sidebar'
import ShellHeader from './components/layout/ShellHeader'
import StatusBar from './components/layout/StatusBar'
import DetailsPanel from './components/layout/DetailsPanel'
import Overview from './components/dashboard/Overview'
import Reminders from './components/dashboard/Reminders'
import Todos from './components/dashboard/Todo'
import Internships from './components/dashboard/Internship'
import Goals from './components/dashboard/Goals'
import Fitness from './components/dashboard/Fitness'
import { useNotifications } from './hooks/useNotifications'
import './components/layout/layout.css'
import './App.css'
import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window'

const WIDGET_SIZE = { width: 520, height: 200 }
const DASHBOARD_SIZE = { width: 1280, height: 800 }

export default function App() {
	useNotifications()
	const [expanded, setExpanded] = useState(false)
	const [view, setView] = useState<NavView>('overview')
	const [selectedId, setSelectedId] = useState<number | null>(null)
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

	useEffect(() => {
		async function configureWindow() {
			const win = getCurrentWindow()
			await win.setResizable(true)
			if (expanded) {
				await win.setSize(
					new LogicalSize(DASHBOARD_SIZE.width, DASHBOARD_SIZE.height),
				)
			} else {
				await win.setSize(
					new LogicalSize(WIDGET_SIZE.width, WIDGET_SIZE.height),
				)
			}
		}
		configureWindow().catch(console.error)
	}, [expanded])

	if (!expanded) {
		return (
			<div className="app-widget">
				<Widget onExpand={() => setExpanded(true)} />
			</div>
		)
	}

	return (
		<div className="shell">
			<div className="shell-row">
				<Sidebar
					view={view}
					collapsed={sidebarCollapsed}
					onToggleCollapse={() => setSidebarCollapsed(c => !c)}
					onNavigate={v => {
						setView(v)
						if (v !== 'internships') setSelectedId(null)
					}}
				/>
				<div className="shell-column">
					<ShellHeader
						view={view}
						onCollapse={() => setExpanded(false)}
					/>
					<div className="shell-body">
						<main className="shell-main">
							{view === 'overview' && (
								<div className="module-view">
									<Overview
										onNavigate={v => {
											setView(v)
											if (v !== 'internships')
												setSelectedId(null)
										}}
									/>
								</div>
							)}
							{view === 'reminders' && (
								<div className="module-view">
									<Reminders />
								</div>
							)}
							{view === 'todos' && (
								<div className="module-view">
									<Todos />
								</div>
							)}
							{view === 'internships' && (
								<Internships
									mode="overview"
									selectedId={selectedId}
									onSelect={setSelectedId}
								/>
							)}
							{view === 'goals' && (
								<div className="module-view">
									<Goals />
								</div>
							)}
							{view === 'fitness' && (
								<div className="module-view">
									<Fitness />
								</div>
							)}
						</main>
						{view === 'internships' && (
							<DetailsPanel internshipId={selectedId} />
						)}
					</div>
				</div>
			</div>
			<StatusBar />
		</div>
	)
}
