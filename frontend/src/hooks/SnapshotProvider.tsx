import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { api } from '../lib/api'
import { pickTopGoals, type GoalDisplayItem } from '../utils/goalDisplay'
import {
	SnapshotContext,
	type Snapshot,
	type LcGoalDisplay,
	type ActiveContext,
	type SnapshotContextValue,
	resolveActiveContext,
	resolveNeededAction,
	pickLcGoal,
	buildLcGoalDisplay,
	readFocusSession,
	writeFocusSession,
} from './snapshotCore'
import type { Focus, GoalProgress } from '../types/index'

const FETCH_INTERVAL_MS = 5 * 60 * 1000

export function SnapshotProvider({ children }: { children: ReactNode }) {
	const [snapshot, setSnapshot] = useState<Snapshot>({
		internships: 0,
		reminders: 0,
		todos: 0,
		lc_today: 0,
		lc_total: 0,
		commits_today: 0,
		worked_out_today: false,
	})
	const [focus, setFocus] = useState<Focus>({
		type: 'none',
		priority: 'low',
		message: 'Nothing urgent right now',
		id: null,
	})
	const [active, setActive] = useState<ActiveContext>({
		title: 'Nothing active',
		subtitle: 'Nexus Core',
		priority: 'low',
	})
	const [lcGoal, setLcGoal] = useState<LcGoalDisplay | null>(null)
	const [topGoals, setTopGoals] = useState<GoalDisplayItem[]>([])
	const [neededAction, setNeededAction] = useState('')
	const [loading, setLoading] = useState(true)
	const [elapsedSec, setElapsedSec] = useState(0)
	const focusKey = useRef('')

	const fetchSnapshot = useCallback(async () => {
		try {
			const [internships, reminders, todos, focusData, metrics, goals] =
				await Promise.all([
					api.getInternships(),
					api.getReminders(),
					api.getTodos(),
					api.getFocus(),
					api.getMetrics(),
					api.getGoals(),
				])

			setSnapshot({
				internships: internships.length,
				reminders: reminders.filter(r => !r.done).length,
				todos: todos.filter(t => !t.done).length,
				lc_today: metrics.leetcode?.activity.problem_solved_today ?? 0,
				lc_total: metrics.leetcode?.activity.total_problem_solved ?? 0,
				commits_today: metrics.github?.activity.commits_today ?? 0,
				worked_out_today: metrics.fitness?.worked_out_today ?? false,
			})
			setFocus(focusData)
			setActive(
				resolveActiveContext(focusData, internships, reminders, todos),
			)
			setNeededAction(resolveNeededAction(focusData, internships))

			const progressMap: Record<number, GoalProgress> = {}
			await Promise.all(
				goals.map(async g => {
					if (g.id) {
						progressMap[g.id] = await api.getGoalProgress(g.id)
					}
				}),
			)
			setTopGoals(pickTopGoals(goals, progressMap, 3))

			const lc = pickLcGoal(goals)
			if (lc?.id && progressMap[lc.id]) {
				setLcGoal(buildLcGoalDisplay(lc, progressMap[lc.id]))
			} else if (metrics.leetcode) {
				setLcGoal({
					weekCurrent: metrics.leetcode.activity.problem_solved_today,
					weekTarget: 35,
					totalCurrent: metrics.leetcode.activity.total_problem_solved,
					totalTarget: 150,
				})
			} else {
				setLcGoal(null)
			}

			const key = `${focusData.type}:${focusData.id ?? 'none'}`
			if (key !== focusKey.current) {
				focusKey.current = key
				writeFocusSession(focusData.type, focusData.id)
			}
		} catch (e) {
			console.error(e)
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		const run = async () => {
			await fetchSnapshot()
		}

		run()

		const interval = setInterval(run, FETCH_INTERVAL_MS)

		return () => clearInterval(interval)
	}, [fetchSnapshot])

	useEffect(() => {
		function tick() {
			const session = readFocusSession()
			if (!session) {
				setElapsedSec(0)
				return
			}
			setElapsedSec(Math.floor((Date.now() - session.since) / 1000))
		}
		tick()
		const id = setInterval(tick, 1000)
		return () => clearInterval(id)
	}, [focus.type, focus.id])

	const value: SnapshotContextValue = {
		snapshot,
		focus,
		active,
		lcGoal,
		topGoals,
		neededAction,
		loading,
		elapsedSec,
		refresh: fetchSnapshot,
	}

	return (
		<SnapshotContext.Provider value={value}>
			{children}
		</SnapshotContext.Provider>
	)
}
