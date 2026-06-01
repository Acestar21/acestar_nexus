import { useState, useEffect } from 'react'
import { api } from '../lib/api'

export interface Snapshot {
	internships: number
	reminders: number
	todos: number
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
				const [internships, reminders, todos, focusData] = await Promise.all([
					api.getInternships(),
					api.getReminders(),
					api.getTodos(),
					api.getFocus(),
				])
				setSnapshot({
					internships: internships.length,
					reminders: reminders.filter(r => !r.done).length,
					todos: todos.filter(t => !t.done).length,
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