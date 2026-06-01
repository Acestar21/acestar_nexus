import { useState } from 'react'
import { api } from '../../lib/api'
import './fitness.css'

export default function Fitness() {
	const [duration, setDuration] = useState('')
	const [notes, setNotes] = useState('')
	const [logged, setLogged] = useState(false)
	const [loading, setLoading] = useState(false)

	const today = new Date().toISOString().split('T')[0]

	async function logToday(completed: boolean) {
		setLoading(true)
		try {
			await api.logFitness({
				date: today,
				completed,
				duration_minutes: duration ? parseInt(duration) : undefined,
				notes: notes || undefined,
			})
			setLogged(true)
			setDuration('')
			setNotes('')
		} catch (e) {
			console.error(e)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="fitness">
			<h2 className="section-title">Fitness</h2>

			<div className="fitness-log">
				<p className="fitness-date">Today — {today}</p>

				<div className="fitness-form">
					<input
						className="input"
						type="number"
						placeholder="Duration (minutes)"
						value={duration}
						onChange={e => setDuration(e.target.value)}
					/>
					<input
						className="input"
						placeholder="Notes (optional)"
						value={notes}
						onChange={e => setNotes(e.target.value)}
					/>
				</div>

				<div className="fitness-actions">
					<button
						className="btn"
						onClick={() => logToday(true)}
						disabled={loading}
					>
						{logged ? '✓ Logged' : 'Log Workout'}
					</button>
					<button
						className="btn-ghost"
						onClick={() => logToday(false)}
						disabled={loading}
					>
						Skip today
					</button>
				</div>

				{logged && (
					<p className="fitness-success">Workout logged for today.</p>
				)}
			</div>
		</div>
	)
}