import type { GoalDisplayItem } from '../../utils/goalDisplay'
import './goal-progress-rows.css'

interface Props {
	goals: GoalDisplayItem[]
	loading?: boolean
	compact?: boolean
	emptyLabel?: string
}

export default function GoalProgressRows({
	goals,
	loading = false,
	compact = false,
	emptyLabel = 'No goals',
}: Props) {
	if (loading) {
		return <p className="goal-progress-rows-empty">…</p>
	}

	if (goals.length === 0) {
		return <p className="goal-progress-rows-empty">{emptyLabel}</p>
	}

	return (
		<div
			className={`goal-progress-rows ${compact ? 'goal-progress-rows--compact' : ''}`}
		>
			{goals.map(g => (
				<div key={g.id} className="goal-progress-row">
					<div className="goal-progress-row-head">
						<span
							className={`goal-progress-row-pri pri-${g.priority}`}
							title={`${g.priority} priority`}
						/>
						<span className="goal-progress-row-name">{g.name}</span>
						<span className="goal-progress-row-val">
							{g.current} / {g.target} {g.unit}
						</span>
					</div>
					<div className="goal-progress-row-bar">
						<div
							className="goal-progress-row-fill"
							style={{ width: `${g.progressPct}%` }}
						/>
					</div>
				</div>
			))}
		</div>
	)
}
