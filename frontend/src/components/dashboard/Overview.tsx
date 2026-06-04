import { useCallback, useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { useSnapshot } from '../../hooks/useSnapshot'
import './overview.css'

interface MetricsState {
	commitsToday: number
	commitsWeek: number
	commitStreak: number
	lcToday: number
	lcTotal: number
	lcStreak: number
	workedOutToday: boolean
	fitnessStreak: number
	workoutsWeek: number
}

const EMPTY: MetricsState = {
	commitsToday: 0,
	commitsWeek: 0,
	commitStreak: 0,
	lcToday: 0,
	lcTotal: 0,
	lcStreak: 0,
	workedOutToday: false,
	fitnessStreak: 0,
	workoutsWeek: 0,
}

interface Props {
	onNavigate?: (view: 'fitness' | 'internships' | 'goals') => void
}

export default function Overview({ onNavigate }: Props) {
	const { snapshot, lcGoal, loading: snapLoading } = useSnapshot()
	const [metrics, setMetrics] = useState<MetricsState>(EMPTY)
	const [loading, setLoading] = useState(true)

	const load = useCallback(async () => {
		setLoading(true)
		try {
			const m = await api.getMetrics()
			setMetrics({
				commitsToday: m.github?.activity.commits_today ?? 0,
				commitsWeek: m.github?.activity.commits_this_week ?? 0,
				commitStreak: m.github?.activity.current_streak ?? 0,
				lcToday: m.leetcode?.activity.problem_solved_today ?? 0,
				lcTotal: m.leetcode?.activity.total_problem_solved ?? 0,
				lcStreak: m.leetcode?.activity.current_streak ?? 0,
				workedOutToday: m.fitness?.worked_out_today ?? false,
				fitnessStreak: m.fitness?.current_streak ?? 0,
				workoutsWeek: m.fitness?.total_workouts_this_week ?? 0,
			})
		} catch (e) {
			console.error(e)
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		load()
	}, [load])

	const busy = loading || snapLoading
	const weekCurrent = lcGoal?.weekCurrent ?? snapshot.lc_today
	const weekTarget = lcGoal?.weekTarget ?? 35

	const dateLabel = new Date()
		.toLocaleDateString('en-US', {
			weekday: 'long',
			month: 'long',
			day: 'numeric',
		})
		.toUpperCase()

	return (
		<div className="overview">
			<header className="overview-header">
				<h1 className="overview-logo">NEXUS</h1>
				<div className="overview-header-right">
					<button
						type="button"
						className="overview-action-btn"
						onClick={() => load()}
						disabled={busy}
					>
						Refresh
					</button>
					<span className="overview-date">{dateLabel}</span>
				</div>
			</header>

			<section className="overview-section">
				<h2 className="overview-section-title">// github</h2>
				<div className="overview-cards overview-cards--2">
					<article className="metric-card">
						<p className="metric-card-label">Commits today</p>
						<p className="metric-card-value">
							{busy ? '—' : metrics.commitsToday}
						</p>
						<p className="metric-card-sub">
							{busy ? '' : `${metrics.commitsWeek} this week`}
						</p>
					</article>
					<article className="metric-card metric-card--highlight">
						<p className="metric-card-label">Commit streak</p>
						<p className="metric-card-value">
							{busy ? '—' : metrics.commitStreak}
						</p>
						<p className="metric-card-sub">days active</p>
					</article>
				</div>
			</section>

			<section className="overview-section">
				<h2 className="overview-section-title">// leetcode</h2>
				<div className="overview-cards overview-cards--3">
					<article className="metric-card">
						<p className="metric-card-label">Solved today</p>
						<p className="metric-card-value">
							{busy ? '—' : metrics.lcToday}
						</p>
						<p className="metric-card-sub">problems today</p>
					</article>
					<article className="metric-card metric-card--highlight metric-card--streak">
						<p className="metric-card-label">LC streak</p>
						<p className="metric-card-value">
							{busy ? '—' : metrics.lcStreak}
						</p>
						<p className="metric-card-streak-label">
							{busy ? '' : `${metrics.lcStreak} day streak`}
						</p>
					</article>
					<article className="metric-card">
						<p className="metric-card-label">Total solved</p>
						<p className="metric-card-value">
							{busy ? '—' : metrics.lcTotal}
						</p>
						<p className="metric-card-sub">
							{busy ? '' : `${weekCurrent} / ${weekTarget} goal this week`}
						</p>
					</article>
				</div>
			</section>

			<section className="overview-section">
				<h2 className="overview-section-title">// fitness</h2>
				<div className="overview-cards overview-cards--2">
					<article className="metric-card">
						<p className="metric-card-label">Workout today</p>
						<p
							className={`metric-card-value ${metrics.workedOutToday ? 'metric-card-value--accent' : ''}`}
						>
							{busy
								? '—'
								: metrics.workedOutToday
									? 'DONE'
									: 'NOT YET'}
						</p>
						<p className="metric-card-sub">
							{busy ? '' : `${metrics.workoutsWeek} this week`}
						</p>
					</article>
					<article className="metric-card metric-card--highlight metric-card--streak">
						<p className="metric-card-label">Fitness streak</p>
						<p className="metric-card-value">
							{busy ? '—' : metrics.fitnessStreak}
						</p>
						<p className="metric-card-streak-label">
							{busy ? '' : `${metrics.fitnessStreak} day streak`}
						</p>
					</article>
				</div>
			</section>

			<section className="overview-section">
				<h2 className="overview-section-title">// quick actions</h2>
				<div className="overview-actions">
					<button
						type="button"
						className="overview-action-btn"
						onClick={() => onNavigate?.('internships')}
					>
						Applications
					</button>
					<button
						type="button"
						className="overview-action-btn"
						onClick={() => onNavigate?.('goals')}
					>
						Goals
					</button>
					<button
						type="button"
						className="overview-action-btn"
						onClick={() => onNavigate?.('fitness')}
					>
						Log workout
					</button>
				</div>
			</section>

			<section className="overview-section overview-section--summary">
				<h2 className="overview-section-title">// pipeline</h2>
				<div className="overview-cards overview-cards--4">
					<article className="metric-card metric-card--compact">
						<p className="metric-card-label">Internships</p>
						<p className="metric-card-value">
							{snapLoading ? '—' : snapshot.internships}
						</p>
					</article>
					<article className="metric-card metric-card--compact">
						<p className="metric-card-label">Reminders</p>
						<p className="metric-card-value">
							{snapLoading ? '—' : snapshot.reminders}
						</p>
					</article>
					<article className="metric-card metric-card--compact">
						<p className="metric-card-label">Bucket items</p>
						<p className="metric-card-value">
							{snapLoading ? '—' : snapshot.todos}
						</p>
					</article>
					<article className="metric-card metric-card--compact">
						<p className="metric-card-label">Commits</p>
						<p className="metric-card-value">
							{snapLoading ? '—' : snapshot.commits_today}
						</p>
					</article>
				</div>
			</section>
		</div>
	)
}
