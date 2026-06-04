import type { NavView } from './Sidebar'
import './layout.css'

const TITLES: Record<NavView, string> = {
	overview: 'Overview',
	reminders: 'Reminders',
	todos: 'Bucket list',
	internships: 'Internships',
	goals: 'Goals',
	fitness: 'Fitness',
}

interface Props {
	view: NavView
	onCollapse: () => void
}

export default function ShellHeader({ view, onCollapse }: Props) {
	return (
		<header className="shell-header">
			<h1 className="shell-header-title">{TITLES[view]}</h1>
			<button
				type="button"
				className="shell-header-back"
				onClick={onCollapse}
			>
				← Widget
			</button>
		</header>
	)
}
