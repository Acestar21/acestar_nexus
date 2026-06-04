import './layout.css'

export type NavView =
	| 'overview'
	| 'reminders'
	| 'todos'
	| 'internships'
	| 'goals'
	| 'fitness'

interface Props {
	view: NavView
	collapsed: boolean
	onToggleCollapse: () => void
	onNavigate: (view: NavView) => void
}

const NAV: { id: NavView; label: string; icon: string }[] = [
	{ id: 'overview', label: 'Overview', icon: '▦' },
	{ id: 'reminders', label: 'Reminders', icon: '◷' },
	{ id: 'todos', label: 'Bucket list', icon: '☑' },
	{ id: 'internships', label: 'Internships', icon: '◎' },
	{ id: 'goals', label: 'Goals', icon: '◈' },
	{ id: 'fitness', label: 'Fitness', icon: '⚡' },
]

export default function Sidebar({
	view,
	collapsed,
	onToggleCollapse,
	onNavigate,
}: Props) {
	return (
		<aside
			className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}
			aria-expanded={!collapsed}
		>
			<div className="sidebar-top">
				<button
					type="button"
					className="sidebar-toggle"
					onClick={onToggleCollapse}
					aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
					title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
				>
					☰
				</button>
				{!collapsed && (
					<div className="sidebar-brand">
						<div className="sidebar-logo">&gt;_</div>
						<div className="sidebar-brand-text">
							<div className="sidebar-title">Nexus</div>
							<div className="sidebar-tagline">Power User Shell</div>
						</div>
					</div>
				)}
				{collapsed && (
					<div className="sidebar-logo sidebar-logo--solo">&gt;_</div>
				)}
			</div>
			<nav className="sidebar-nav">
				{NAV.map(item => (
					<button
						key={item.id}
						type="button"
						className={`sidebar-link ${view === item.id ? 'active' : ''}`}
						onClick={() => onNavigate(item.id)}
						title={collapsed ? item.label : undefined}
					>
						<span className="sidebar-link-icon" aria-hidden>
							{item.icon}
						</span>
						<span className="sidebar-link-label">{item.label}</span>
					</button>
				))}
			</nav>
			<button
				type="button"
				className="sidebar-link sidebar-settings"
				title={collapsed ? 'Settings' : undefined}
			>
				<span className="sidebar-link-icon" aria-hidden>
					⚙
				</span>
				<span className="sidebar-link-label">Settings</span>
			</button>
		</aside>
	)
}
