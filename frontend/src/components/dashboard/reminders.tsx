import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import type { Reminder, Priority } from '../../types/index'
import './Reminders.css'

export default function Reminders() {
    const [reminders, setReminders] = useState<Reminder[]>([])
    const [text, setText] = useState('')
    const [priority, setPriority] = useState<Priority>('medium')
    const [remindAt, setRemindAt] = useState('')

    useEffect(() => {
        api.getReminders().then(setReminders)
    }, [])

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
        setRemindAt('')
    }

    async function toggle(r: Reminder) {
        const updated = await api.updateReminder(r.id!, { done: !r.done })
        setReminders(prev => prev.map(x => x.id === r.id ? updated : x))
    }

    async function remove(id: number) {
        await api.deleteReminder(id)
        setReminders(prev => prev.filter(x => x.id !== id))
    }

    const pending = reminders.filter(r => !r.done)
    const done = reminders.filter(r => r.done)

    return (
        <div className="reminders">
        <h2 className="section-title">Reminders</h2>

        <div className="reminder-form">
            <input
            className="input"
            placeholder="Add a reminder..."
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && add()}
            />
            <select
            className="select"
            value={priority}
            onChange={e => setPriority(e.target.value as Priority)}
            >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            </select>
            <input
            className="input"
            type="datetime-local"
            value={remindAt}
            onChange={e => setRemindAt(e.target.value)}
            />
            <button className="btn" onClick={add}>Add</button>
        </div>

        <div className="reminder-list">
            {pending.map(r => (
            <div key={r.id} className={`reminder-item priority-${r.priority}`}>
                <input type="checkbox" checked={false} onChange={() => toggle(r)} />
                <span className="reminder-text">{r.text}</span>
                <span className={`badge ${r.priority}`}>{r.priority}</span>
                {r.remind_at && <span className="reminder-time">{new Date(r.remind_at).toLocaleString()}</span>}
                <button className="btn-ghost" onClick={() => remove(r.id!)}>✕</button>
            </div>
            ))}
        </div>

        {done.length > 0 && (
            <div className="reminder-done">
            <p className="done-label">Completed ({done.length})</p>
            {done.map(r => (
                <div key={r.id} className="reminder-item done">
                <input type="checkbox" checked={true} onChange={() => toggle(r)} />
                <span className="reminder-text">{r.text}</span>
                <button className="btn-ghost" onClick={() => remove(r.id!)}>✕</button>
                </div>
            ))}
            </div>
        )}
        </div>
    )
}