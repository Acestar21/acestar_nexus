import { useMemo, useState, useEffect } from 'react'
import { api } from '../../lib/api'
import type { Reminder, Priority } from '../../types/index'
import { todayDateTimeLocalString, formatDateAdded } from '../../utils/dates'
import { sortByMode, type SortMode } from '../../utils/sort'
import { isAlarmEnabled, setAlarmEnabled } from '../../utils/reminderAlarm'
import ListControls from '../shared/ListControls'
import '../shared/forms.css'
import './reminders.css'

export default function Reminders() {
	const [reminders, setReminders] = useState<Reminder[]>([])
	const [text, setText] = useState('')
	const [priority, setPriority] = useState<Priority>('medium')
	const [remindAt, setRemindAt] = useState(todayDateTimeLocalString)
	const [sort, setSort] = useState<SortMode>('priority')

	useEffect(() => {
		api.getReminders().then(setReminders)
	}, [])

	const pending = useMemo(
		() => sortByMode(reminders.filter(r => !r.done), sort),
		[reminders, sort],
	)
	const done = useMemo(
		() => sortByMode(reminders.filter(r => r.done), sort),
		[reminders, sort],
	)

	async function add() {
		if (!text.trim()) return
		const newReminder = await api.createReminder({
			text,
			priority,
			remind_at: remindAt || undefined,
			done: false,
		})
		setReminders(prev => [...prev, newReminder])
		setText('')
		setPriority('medium')
		setRemindAt(todayDateTimeLocalString())
	}

	async function toggleDone(r: Reminder) {
		const updated = await api.updateReminder(r.id!, { done: !r.done })
		setReminders(prev => prev.map(x => (x.id === r.id ? updated : x)))
	}

	async function updatePriority(r: Reminder, newPriority: Priority) {
		const updated = await api.updateReminder(r.id!, {
			priority: newPriority,
		})
		setReminders(prev => prev.map(x => (x.id === r.id ? updated : x)))
	}

	async function toggleAlarm(r: Reminder) {
		if (!r.id) return
		const enabled = isAlarmEnabled(r.id, r.remind_at)
		setAlarmEnabled(r.id, !enabled)
		setReminders(prev => [...prev])
	}

	async function remove(id: number) {
		await api.deleteReminder(id)
		setReminders(prev => prev.filter(x => x.id !== id))
	}

	return (
		<div className="reminders">
			<h2 className="section-title">Reminders</h2>

			<div className="form-panel">
				<div className="field-row">
					<div className="field field--grow">
						<label className="field-label" htmlFor="reminder-text">
							Reminder text
						</label>
						<input
							id="reminder-text"
							className="input"
							placeholder="What do you need to remember?"
							value={text}
							onChange={e => setText(e.target.value)}
							onKeyDown={e => e.key === 'Enter' && add()}
						/>
					</div>
					<div className="field">
						<label className="field-label" htmlFor="reminder-priority">
							Priority
						</label>
						<select
							id="reminder-priority"
							className="select"
							value={priority}
							onChange={e =>
								setPriority(e.target.value as Priority)
							}
						>
							<option value="high">High</option>
							<option value="medium">Medium</option>
							<option value="low">Low</option>
						</select>
					</div>
					<div className="field">
						<label className="field-label" htmlFor="reminder-at">
							Alarm date &amp; time
						</label>
						<input
							id="reminder-at"
							className="input"
							type="datetime-local"
							value={remindAt}
							onChange={e => setRemindAt(e.target.value)}
						/>
					</div>
					<button type="button" className="btn" onClick={add}>
						Add reminder
					</button>
				</div>
			</div>

			<ListControls sort={sort} onSortChange={setSort} />

			<div className="reminder-list">
				{pending.map(r => (
					<div
						key={r.id}
						className={`reminder-item priority-${r.priority}`}
					>
						<input
							type="checkbox"
							checked={false}
							onChange={() => toggleDone(r)}
							aria-label={`Mark "${r.text}" done`}
						/>
						<span className="reminder-text">{r.text}</span>
						<select
							className="select select--inline"
							value={r.priority}
							onChange={e =>
								updatePriority(r, e.target.value as Priority)
							}
							aria-label="Change priority"
						>
							<option value="high">High</option>
							<option value="medium">Medium</option>
							<option value="low">Low</option>
						</select>
						<div className="alarm-toggle-wrap">
							<button
								type="button"
								className={`btn-alarm ${isAlarmEnabled(r.id, r.remind_at) ? 'on' : 'off'}`}
								onClick={() => toggleAlarm(r)}
								title={
									isAlarmEnabled(r.id, r.remind_at)
										? 'Will notify + shows on widget'
										: 'Widget only, no notification'
								}
							>
								{isAlarmEnabled(r.id, r.remind_at) ? '🔔' : '🔕'}
							</button>
							<span className="alarm-toggle-hint">
								{isAlarmEnabled(r.id, r.remind_at)
									? 'Notify + widget'
									: 'Widget only'}
							</span>
						</div>
						{r.remind_at && (
							<span className="reminder-time">
								{new Date(r.remind_at).toLocaleString()}
							</span>
						)}
						<span className="item-date">
							Added {formatDateAdded(r.created_at)}
						</span>
						<button
							type="button"
							className="btn-ghost"
							onClick={() => remove(r.id!)}
						>
							Delete
						</button>
					</div>
				))}
			</div>

			{done.length > 0 && (
				<div className="reminder-done">
					<p className="done-label">Completed ({done.length})</p>
					{done.map(r => (
						<div key={r.id} className="reminder-item done">
							<input
								type="checkbox"
								checked
								onChange={() => toggleDone(r)}
							/>
							<span className="reminder-text">{r.text}</span>
							<select
								className="select select--inline"
								value={r.priority}
								onChange={e =>
									updatePriority(r, e.target.value as Priority)
								}
							>
								<option value="high">High</option>
								<option value="medium">Medium</option>
								<option value="low">Low</option>
							</select>
							<button
								type="button"
								className="btn-ghost"
								onClick={() => remove(r.id!)}
							>
								Delete
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	)
}
