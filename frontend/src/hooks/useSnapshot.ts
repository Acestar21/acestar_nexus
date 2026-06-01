import { useState, useEffect } from 'react'
import { api } from '../lib/api'

export interface Snapshot {
	internships: number
	reminders: number
	todos: number
	lc_today: number
	lc_total: number
	commits_today: number
	worked_out_today: boolean
}	

export interface Focus {
	type: string
	priority: string
	message: string
	id: number | null
}

export function useSnapshot() {
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
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		async function fetch() {
			try {
				const [internships, reminders, todos, focusData, metrics] = await Promise.all([
					api.getInternships(),
					api.getReminders(),
					api.getTodos(),
					api.getFocus(),
					api.getMetrics(),
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
			} catch (e) {
				console.error(e)
			} finally {
				setLoading(false)
			}
		}
		fetch()
		const interval = setInterval(fetch, 60000)
		return () => clearInterval(interval)
	}, [])

	return { snapshot, focus, loading }
}