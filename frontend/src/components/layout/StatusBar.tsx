import { useSnapshot, formatElapsed } from '../../hooks/useSnapshot'
import GoalProgressRows from '../shared/GoalProgressRows'
import '../shared/goal-progress-rows.css'
import './layout.css'

export default function StatusBar() {
	const { active, topGoals, snapshot, loading, elapsedSec } = useSnapshot()

	const priorityClass =
		active.priority === 'high'
			? 'pink'
			: active.priority === 'medium'
				? 'orange'
				: 'purple'

	return (
		<footer className="status-bar status-bar--goals">
			<div className="status-bar-section">
				<span className="status-bar-label">Active now</span>
				<span className={`status-bar-dot ${priorityClass}`} />
				<span className="status-bar-value">
					{loading ? '…' : active.title}
				</span>
			</div>
			<div className="status-bar-section status-bar-section--goals">
				<span className="status-bar-label">Goals</span>
				<GoalProgressRows
					goals={topGoals}
					loading={loading}
					emptyLabel="No goals"
				/>
			</div>
			<div className="status-bar-section status-bar-section--right">
				<span className="status-bar-label">Fitness</span>
				<span className="status-bar-value">
					Exercise:{' '}
					{loading
						? '…'
						: snapshot.worked_out_today
							? 'DONE'
							: 'NOT YET'}
				</span>
				{!loading && (
					<span
						className={`status-bar-dot ${snapshot.worked_out_today ? 'green' : 'purple'}`}
					/>
				)}
			</div>
			<div className="status-bar-timer" aria-hidden>
				{formatElapsed(elapsedSec)}
			</div>
		</footer>
	)
}
