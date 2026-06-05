import { useEffect, useRef } from 'react'
import { notify } from '../lib/notify'
import { api } from '../lib/api'
import { isAlarmEnabled } from '../utils/reminderAlarm'

export function useNotifications() {
	const notifiedIds = useRef<Set<number>>(new Set())
	const lastAlarmState = useRef<Map<number, { enabled: boolean; remindAt?: string }>>(
		new Map(),
	)

	useEffect(() => {
		const check = async () => {
			try {
				const reminders = await api.getReminders()
				const now = new Date()

				reminders.forEach(r => {
					if (!r.id) return
					const enabled = isAlarmEnabled(r.id, r.remind_at)
					const prev = lastAlarmState.current.get(r.id)
					if (
						enabled &&
						(
							(prev && !prev.enabled) ||
							(prev?.remindAt && prev.remindAt !== r.remind_at)
						)
					) {
						notifiedIds.current.delete(r.id)
					}
					lastAlarmState.current.set(r.id, {
						enabled,
						remindAt: r.remind_at,
					})

					if (
						r.done ||
						!r.remind_at ||
						!enabled ||
						notifiedIds.current.has(r.id)
					) return

					const remindAt = new Date(r.remind_at)
					if (remindAt <= now) {
						notify('Reminder', r.text)
							notifiedIds.current.add(r.id)
					}
				})
			} catch (e) {
				console.error('Notification check failed:', e)
			}
		}

		check()
		const interval = setInterval(check, 60000)
		return () => clearInterval(interval)
	}, [])
}