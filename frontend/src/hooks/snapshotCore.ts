import { createContext, useContext } from 'react'
import type { GoalDisplayItem } from '../utils/goalDisplay'
import type {
	Focus,
	Goal,
	GoalProgress,
	Internship,
	Reminder,
	Todo,
} from '../types/index'

export interface Snapshot {
	internships: number
	reminders: number
	todos: number
	lc_today: number
	lc_total: number
	commits_today: number
	worked_out_today: boolean
}

export interface LcGoalDisplay {
	weekCurrent: number
	weekTarget: number
	totalCurrent: number
	totalTarget: number
}

export interface ActiveContext {
	title: string
	subtitle: string
	priority: string
}

export interface SnapshotContextValue {
	snapshot: Snapshot
	focus: Focus
	active: ActiveContext
	lcGoal: LcGoalDisplay | null
	topGoals: GoalDisplayItem[]
	neededAction: string
	loading: boolean
	elapsedSec: number
	refresh: () => Promise<void>
}

export const SnapshotContext = createContext<SnapshotContextValue | null>(null)

const FOCUS_SESSION_KEY = 'nexus_focus_session'

export function readFocusSession(): {
	type: string
	id: number | null
	since: number
} | null {
	try {
		const raw = sessionStorage.getItem(FOCUS_SESSION_KEY)
		if (!raw) return null
		return JSON.parse(raw)
	} catch {
		return null
	}
}

export function writeFocusSession(type: string, id: number | null) {
	const prev = readFocusSession()
	if (prev?.type === type && prev?.id === id) return
	sessionStorage.setItem(
		FOCUS_SESSION_KEY,
		JSON.stringify({ type, id, since: Date.now() }),
	)
}

export function resolveActiveContext(
	focus: Focus,
	internships: Internship[],
	reminders: Reminder[],
	todos: Todo[],
): ActiveContext {
	if (focus.type === 'internship' && focus.id != null) {
		const i = internships.find(x => x.id === focus.id)
		if (i) {
			return { title: i.company, subtitle: i.role || 'Internship', priority: i.priority }
		}
	}
	if (focus.type === 'reminder' && focus.id != null) {
		const r = reminders.find(x => x.id === focus.id)
		if (r) {
			return { title: r.text, subtitle: 'Reminder', priority: r.priority }
		}
	}
	if (focus.type === 'todo' && focus.id != null) {
		const t = todos.find(x => x.id === focus.id)
		if (t) {
			return { title: t.text, subtitle: 'Bucket list', priority: t.priority }
		}
	}

	const active = internships.find(
		i => !['rejected', 'withdrawn'].includes(i.status),
	)
	if (active) {
		return {
			title: active.company,
			subtitle: active.role || 'Active application',
			priority: active.priority,
		}
	}

	if (focus.type !== 'none') {
		const subtitle =
			focus.type === 'internship'
				? 'Internship'
				: focus.type === 'reminder'
					? 'Reminder'
					: focus.type === 'todo'
						? 'Bucket list'
						: 'Nexus'
		const title = focus.message.includes('—')
			? focus.message.split('—')[0].trim()
			: focus.message
		return { title, subtitle, priority: focus.priority }
	}

	return {
		title: 'Nothing active',
		subtitle: 'Nexus Core',
		priority: 'low',
	}
}

export function resolveNeededAction(
	focus: Focus,
	internships: Internship[],
): string {
	if (focus.type === 'internship' && focus.id != null) {
		const i = internships.find(x => x.id === focus.id)
		if (i?.notes) return i.notes
		if (i) return `Follow up with ${i.company}: ${formatStatus(i.status)}`
	}
	if (focus.type !== 'none' && focus.message !== 'Nothing urgent right now') {
		return focus.message
	}
	const followUp = internships.find(
		i =>
			i.followup_at &&
			!['rejected', 'withdrawn', 'offer'].includes(i.status),
	)
	if (followUp) {
		return `Follow up with ${followUp.company}: ${formatStatus(followUp.status)}`
	}
	return 'All caught up for today'
}

function formatStatus(status: string): string {
	switch (status) {
		case 'oa':
			return 'OA pending'
		case 'interview':
			return 'Interview'
		case 'applied':
			return 'Applied'
		case 'offer':
			return 'Offer'
		default:
			return status
	}
}

export function pickLcGoal(goals: Goal[]): Goal | undefined {
	return (
		goals.find(g => /lc|leetcode/i.test(g.name)) ??
		goals.find(g => /problem/i.test(g.unit)) ??
		goals[0]
	)
}

export function buildLcGoalDisplay(
	goal: Goal,
	progress: GoalProgress,
): LcGoalDisplay {
	const weekCurrent = Math.max(
		0,
		Math.min(
			progress.weekly_target,
			goal.current - progress.weeks_elapsed * progress.weekly_target,
		),
	)
	return {
		weekCurrent,
		weekTarget: progress.weekly_target,
		totalCurrent: goal.current,
		totalTarget: goal.target,
	}
}

export function useSnapshot() {
	const ctx = useContext(SnapshotContext)
	if (!ctx) {
		throw new Error('useSnapshot must be used within SnapshotProvider')
	}
	return ctx
}

export function formatElapsed(seconds: number): string {
	const h = Math.floor(seconds / 3600)
	const m = Math.floor((seconds % 3600) / 60)
	const s = seconds % 60
	return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
