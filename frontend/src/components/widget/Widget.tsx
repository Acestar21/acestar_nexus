import { useSnapshot } from '../../hooks/useSnapshot'
import './widget.css'

interface Props {
	onExpand: () => void
}

export default function Widget({ onExpand }: Props) {
	const { snapshot, focus, loading } = useSnapshot()

	return (
		<div className="widget" onClick={onExpand}>
			<div className="widget-focus">
				<span className="widget-focus-label">focus</span>
				<p className={`widget-focus-text priority-${focus.priority}`}>
					{loading ? 'Loading...' : focus.message}
				</p>
			</div>
			<div className="widget-snapshot">
				<span>LC: {loading ? '—' : `${snapshot.lc_today} today · ${snapshot.lc_total} total`}</span>
				<span>GitHub: {loading ? '—' : `${snapshot.commits_today} commits`}</span>
				<span>Exercise: {loading ? '—' : snapshot.worked_out_today ? '✓ done' : '✗ not yet'}</span>
				<span>Internships: {loading ? '—' : snapshot.internships}</span>
				<span>Reminders: {loading ? '—' : snapshot.reminders}</span>
				<span>Todos: {loading ? '—' : snapshot.todos}</span>
			</div>
		</div>
	)
}