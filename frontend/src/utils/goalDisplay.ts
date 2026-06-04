import type { Goal, GoalProgress, Priority } from '../types/index'

export interface GoalDisplayItem {
	id: number
	name: string
	current: number
	target: number
	unit: string
	progressPct: number
	priority: Priority
}

const PRIORITY_RANK: Record<Priority, number> = {
	high: 0,
	medium: 1,
	low: 2,
}

export function goalPriorityValue(goal: Goal): Priority {
	return goal.priority ?? 'medium'
}

export function pickTopGoals(
	goals: Goal[],
	progress: Record<number, GoalProgress>,
	limit = 3,
): GoalDisplayItem[] {
	const ranked = goals
		.filter(g => g.id != null)
		.sort((a, b) => {
			const pa = goalPriorityValue(a)
			const pb = goalPriorityValue(b)
			const pr = PRIORITY_RANK[pa] - PRIORITY_RANK[pb]
			if (pr !== 0) return pr

			const progA = progress[a.id!]
			const progB = progress[b.id!]
			const behindA = progA ? progA.expected_by_now - a.current : 0
			const behindB = progB ? progB.expected_by_now - b.current : 0
			return behindB - behindA
		})
		.slice(0, limit)

	return ranked.map(g => ({
		id: g.id!,
		name: g.name,
		current: g.current,
		target: g.target,
		unit: g.unit,
		progressPct:
			g.target > 0 ? Math.min(100, (g.current / g.target) * 100) : 0,
		priority: goalPriorityValue(g),
	}))
}
