import { useSnapshot, formatElapsed } from '../../hooks/useSnapshot'
import GoalProgressRows from '../shared/GoalProgressRows'
import '../shared/goal-progress-rows.css'
import './widget.css'

interface Props {
	onExpand: () => void
}

export default function Widget({ onExpand }: Props) {
	const {
		snapshot,
		active,
		topGoals,
		neededAction,
		loading,
		elapsedSec,
		refresh,
	} = useSnapshot()

	const priorityDot =
		active.priority === 'high'
			? 'high'
			: active.priority === 'medium'
				? 'medium'
				: 'low'

	return (
		<div className="widget">
			<div className="widget-toolbar">
				<button
					type="button"
					className="widget-refresh-btn"
					onClick={() => refresh()}
					title="Refresh data"
					aria-label="Refresh data"
				>
					↻
				</button>
				<button
					type="button"
					className="widget-expand-btn"
					onClick={onExpand}
					title="Open dashboard"
					aria-label="Open dashboard"
				>
					⤢
				</button>
			</div>
			<div className="widget-body">
				<section className="widget-col widget-col--primary">
					<div className="widget-active-label">
						<span className="widget-dot widget-dot--accent" />
						Active now
					</div>
					<div className="widget-task-row">
						<h2 className="widget-task-title">
							{loading ? '…' : active.title}
						</h2>
						<span
							className={`widget-priority-dot priority-${priorityDot}`}
						/>
					</div>
					<p className="widget-task-sub">
						{loading ? 'Loading' : active.subtitle}
					</p>
					<div className="widget-timer">
						<svg
							className="widget-timer-icon"
							width="12"
							height="12"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							aria-hidden
						>
							<circle cx="12" cy="12" r="9" />
							<path d="M12 7v5l3 2" />
						</svg>
						<span>{loading ? '--:--:--' : formatElapsed(elapsedSec)}</span>
					</div>
					<div className="widget-goals">
						<h3 className="widget-block-label">Top goals</h3>
						<GoalProgressRows
							goals={topGoals}
							loading={loading}
							compact
							emptyLabel="No goals"
						/>
					</div>
				</section>

				<section className="widget-col widget-col--stats">
					<span className="widget-status-led" title="Live" />
					<div className="widget-block">
						<h3 className="widget-block-label">Technical daily</h3>
						<div className="widget-metrics">
							<span className="widget-metric">
								<span className="widget-metric-icon">&lt;&gt;</span>
								LC: {loading ? '—' : snapshot.lc_today}
							</span>
							<span className="widget-metric">
								<span className="widget-metric-icon">⌥</span>
								CMT: {loading ? '—' : snapshot.commits_today}
							</span>
						</div>
					</div>
					<div className="widget-block">
						<h3 className="widget-block-label">Fitness</h3>
						<p
							className={`widget-fitness ${snapshot.worked_out_today ? 'done' : 'pending'}`}
						>
							{loading ? (
								'…'
							) : snapshot.worked_out_today ? (
								<>
									<span className="widget-check">✓</span> Exercise:{' '}
									<strong>DONE</strong>
								</>
							) : (
								<>Exercise: NOT YET</>
							)}
						</p>
					</div>
					<div className="widget-block widget-block--needed">
						<h3 className="widget-block-label">What&apos;s needed</h3>
						<div className="widget-needed-scroll">
							<p className="widget-needed">
								<span className="widget-needed-icon">ⓘ</span>
								<span className="widget-needed-text">
									{loading ? '…' : neededAction}
								</span>
							</p>
						</div>
					</div>
				</section>
			</div>
		</div>
	)
}
