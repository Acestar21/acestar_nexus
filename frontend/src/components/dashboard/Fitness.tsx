import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import '../shared/forms.css'
import './fitness.css'

export default function Fitness() {
	const [duration, setDuration] = useState('')
	const [notes, setNotes] = useState('')
	const [loggedToday, setLoggedToday] = useState(false)
	const [loading, setLoading] = useState(false)
	const [checking, setChecking] = useState(true)

	const today = new Date().toISOString().split('T')[0]

	useEffect(() => {
		api.getMetrics()
			.then(m => setLoggedToday(m.fitness?.worked_out_today ?? false))
			.finally(() => setChecking(false))
	}, [])

	async function logToday(completed: boolean) {
		setLoading(true)
		try {
			await api.logFitness({
				date: today,
				completed,
				duration_minutes: duration ? parseInt(duration, 10) : undefined,
				notes: notes || undefined,
			})
			setLoggedToday(completed)
			setDuration('')
			setNotes('')
		} catch (e) {
			console.error(e)
		} finally {
			setLoading(false)
		}
	}

	async function clearLog() {
		await logToday(false)
	}

	return (
		<div className="fitness">
			<h2 className="section-title">Fitness</h2>

			<div className="fitness-log form-panel">
				<p className="fitness-date">Today — {today}</p>

				{checking ? (
					<p className="fitness-muted">Checking today&apos;s log…</p>
				) : loggedToday ? (
					<div className="fitness-logged-banner">
						<p>
							Already logged today — delete to re-log
						</p>
						<button
							type="button"
							className="btn-ghost"
							onClick={clearLog}
							disabled={loading}
						>
							Clear today&apos;s log
						</button>
					</div>
				) : (
					<>
						<div className="field-row">
							<div className="field">
								<label
									className="field-label"
									htmlFor="fitness-duration"
								>
									Duration (minutes)
								</label>
								<input
									id="fitness-duration"
									className="input"
									type="number"
									placeholder="45"
									value={duration}
									onChange={e => setDuration(e.target.value)}
								/>
							</div>
							<div className="field field--grow">
								<label
									className="field-label"
									htmlFor="fitness-notes"
								>
									Workout notes
								</label>
								<input
									id="fitness-notes"
									className="input"
									placeholder="Optional notes about today's session"
									value={notes}
									onChange={e => setNotes(e.target.value)}
								/>
							</div>
						</div>

						<div className="fitness-actions">
							<button
								type="button"
								className="btn"
								onClick={() => logToday(true)}
								disabled={loading}
							>
								Log workout
							</button>
						</div>
					</>
				)}
			</div>
		</div>
	)
}
