import { useState, useEffect, useMemo } from 'react'
import { api } from '../../lib/api'
import type { Goal, GoalProgress, Priority } from '../../types'
import { todayDateString } from '../../utils/dates'
import { sortGoalsByMode, type SortMode } from '../../utils/sort'
import { goalPriorityValue } from '../../utils/goalDisplay'
import { useSnapshot } from '../../hooks/useSnapshot'
import ListControls from '../shared/ListControls'
import '../shared/forms.css'
import './goals.css'

export default function Goals() {
	const { refresh } = useSnapshot()
	const [goals, setGoals] = useState<Goal[]>([])
	const [name, setName] = useState('')
	const [target, setTarget] = useState('')
	const [unit, setUnit] = useState('problems')
	const [goalPriority, setGoalPriorityState] = useState<Priority>('medium')
	const [start_date, setStart_date] = useState(todayDateString)
	const [end_date, setEnd_date] = useState(todayDateString)
	const [progress, setProgress] = useState<Record<number, GoalProgress>>({})
	const [sort, setSort] = useState<SortMode>('priority')

	useEffect(() => {
		api.getGoals().then(setGoals)
	}, [])

	useEffect(() => {
		goals.forEach(g => {
			if (g.id) {
				api.getGoalProgress(g.id).then(p => {
					setProgress(prev => ({ ...prev, [g.id!]: p }))
				})
			}
		})
	}, [goals])

	const sorted = useMemo(
		() => sortGoalsByMode(goals, sort, goalPriorityValue),
		[goals, sort],
	)

	async function add() {
		if (!name.trim()) return

		const newGoal = await api.createGoal({
			name,
			target: parseInt(target, 10),
			unit,
			start_date,
			end_date,
			current: 0,
			priority: goalPriority,
		})
		setGoals(prev => [...prev, newGoal])
		setName('')
		setTarget('')
		setStart_date(todayDateString())
		setEnd_date(todayDateString())
		setUnit('problems')
		setGoalPriorityState('medium')
		await refresh()
	}

	async function remove(id: number) {
		await api.deleteGoal(id)
		setGoals(prev => prev.filter(x => x.id !== id))
		await refresh()
	}

	async function increment(goal: Goal) {
		if (goal.current >= goal.target) return
		const updated = await api.updateGoal(goal.id!, {
			current: goal.current + 1,
		})
		setGoals(prev => prev.map(g => (g.id === goal.id ? updated : g)))
		await refresh()
	}

	async function changeGoalPriority(goalId: number, p: Priority) {
		const updated = await api.updateGoal(goalId, { priority: p })
		setGoals(prev => prev.map(g => (g.id === goalId ? updated : g)))
		await refresh()
	}

	return (
		<div className="goals">
			<h2 className="section-title">Goals</h2>
			<p className="section-desc">
				Priority is saved to the server. Footer and widget show the top 3
				goals (high → medium → low).
			</p>

			<div className="form-panel">
				<div className="field-row">
					<div className="field field--grow">
						<label className="field-label" htmlFor="goal-name">
							Goal name
						</label>
						<input
							id="goal-name"
							className="input"
							placeholder="e.g. LeetCode grind"
							value={name}
							onChange={e => setName(e.target.value)}
						/>
					</div>
					<div className="field">
						<label className="field-label" htmlFor="goal-target">
							Target count
						</label>
						<input
							id="goal-target"
							className="input"
							placeholder="150"
							type="number"
							value={target}
							onChange={e => setTarget(e.target.value)}
						/>
					</div>
					<div className="field">
						<label className="field-label" htmlFor="goal-unit">
							Unit
						</label>
						<input
							id="goal-unit"
							className="input"
							placeholder="problems"
							value={unit}
							onChange={e => setUnit(e.target.value)}
						/>
					</div>
					<div className="field">
						<label className="field-label" htmlFor="goal-priority">
							Priority
						</label>
						<select
							id="goal-priority"
							className="select"
							value={goalPriority}
							onChange={e =>
								setGoalPriorityState(e.target.value as Priority)
							}
						>
							<option value="high">High</option>
							<option value="medium">Medium</option>
							<option value="low">Low</option>
						</select>
					</div>
					<div className="field">
						<label className="field-label" htmlFor="goal-start">
							Start date
						</label>
						<input
							id="goal-start"
							className="input"
							type="date"
							value={start_date}
							onChange={e => setStart_date(e.target.value)}
						/>
					</div>
					<div className="field">
						<label className="field-label" htmlFor="goal-end">
							End date
						</label>
						<input
							id="goal-end"
							className="input"
							type="date"
							value={end_date}
							onChange={e => setEnd_date(e.target.value)}
						/>
					</div>
					<button type="button" className="btn" onClick={add}>
						Add goal
					</button>
				</div>
			</div>

			<ListControls sort={sort} onSortChange={setSort} />

			<div className="goal-list">
				{sorted.map(g => {
					const p = progress[g.id!]
					const complete = g.current >= g.target
					const pri = goalPriorityValue(g)
					return (
						<div
							key={g.id}
							className={`goal-item ${p && !p.on_track ? 'behind' : ''} ${p && p.deadline_close ? 'deadline-close' : ''}`}
						>
							<div className="goal-info">
								<span className="goal-name">{g.name}</span>
								<span className="goal-progress">
									{g.current} / {g.target} {g.unit}
								</span>
							</div>
							<select
								className="select select--inline"
								value={pri}
								onChange={e =>
									g.id &&
									changeGoalPriority(
										g.id,
										e.target.value as Priority,
									)
								}
								aria-label="Goal priority"
							>
								<option value="high">High</option>
								<option value="medium">Medium</option>
								<option value="low">Low</option>
							</select>
							{p && (
								<div className="goal-stats">
									<span className="goal-stat">
										Week {p.weeks_elapsed} of{' '}
										{p.weeks_elapsed + p.weeks_remaining}
									</span>
									<span className="goal-stat">
										{p.weekly_target}/week target
									</span>
									<span
										className={`goal-status ${p.on_track ? 'on-track' : 'behind'}`}
									>
										{p.deadline_close && !p.on_track
											? '⚠ deadline close'
											: p.on_track
												? '✓ on track'
												: '↓ behind pace'}
									</span>
								</div>
							)}
							<div className="goal-actions">
								<button
									type="button"
									className="btn"
									onClick={() => increment(g)}
									disabled={complete}
								>
									{complete ? 'Completed ✓' : '+1'}
								</button>
								<button
									type="button"
									className="btn-ghost"
									onClick={() => remove(g.id!)}
								>
									Delete
								</button>
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}
