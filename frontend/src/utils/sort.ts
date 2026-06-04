import type { Priority } from '../types/index'

export type SortMode = 'priority' | 'created-desc' | 'created-asc'

const PRIORITY_RANK: Record<Priority, number> = {
	high: 0,
	medium: 1,
	low: 2,
}

export function sortByMode<T extends { priority: Priority; created_at?: string }>(
	items: T[],
	mode: SortMode,
): T[] {
	const copy = [...items]
	if (mode === 'priority') {
		copy.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority])
		return copy
	}
	copy.sort((a, b) => {
		const ta = a.created_at ? new Date(a.created_at).getTime() : 0
		const tb = b.created_at ? new Date(b.created_at).getTime() : 0
		return mode === 'created-desc' ? tb - ta : ta - tb
	})
	return copy
}

export function sortGoalsByMode<
	T extends { start_date: string; priority?: Priority },
>(
	items: T[],
	mode: SortMode,
	getPriority: (item: T) => Priority,
): T[] {
	const copy = [...items]
	if (mode === 'priority') {
		copy.sort(
			(a, b) =>
				PRIORITY_RANK[getPriority(a)] - PRIORITY_RANK[getPriority(b)],
		)
		return copy
	}
	copy.sort((a, b) => {
		const ta = new Date(a.start_date).getTime()
		const tb = new Date(b.start_date).getTime()
		return mode === 'created-desc' ? tb - ta : ta - tb
	})
	return copy
}
