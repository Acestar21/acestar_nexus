import { useState, useEffect, useMemo } from 'react'
import { api } from '../../lib/api'
import type { InternshipStatus, Internship, Priority } from '../../types/index'
import {
	todayDateString,
	todayDateTimeLocalString,
	formatDateAdded,
} from '../../utils/dates'
import { sortByMode, type SortMode } from '../../utils/sort'
import ListControls from '../shared/ListControls'
import '../shared/forms.css'
import './internship.css'

type Tab =
	| 'all'
	| 'interviews'
	| 'offers'
	| 'archived'
	| 'reminders'
	| 'fitness'

interface Props {
	mode?: 'overview' | 'manage'
	selectedId?: number | null
	onSelect?: (id: number) => void
}

function statusLabel(status: InternshipStatus): string {
	switch (status) {
		case 'oa':
			return 'OA Pending'
		case 'interview':
			return 'Technical Screen'
		case 'applied':
			return 'Applied'
		case 'offer':
			return 'Offer'
		case 'rejected':
			return 'Rejected'
		case 'withdrawn':
			return 'Archived'
		default:
			return status
	}
}

function companyAccent(company: string): string {
	const hues = ['pink', 'orange', 'yellow', 'gray', 'purple']
	let h = 0
	for (let i = 0; i < company.length; i++) h += company.charCodeAt(i)
	return hues[h % hues.length]
}

function resolveAppliedDate(i: Internship): string | undefined {
	return i.created_at || i.applied_at
}

export default function Internships({
	mode = 'manage',
	selectedId,
	onSelect,
}: Props) {
	const [internships, setInternships] = useState<Internship[]>([])
	const [tab, setTab] = useState<Tab>('all')
	const [search, setSearch] = useState('')
	const [showForm, setShowForm] = useState(false)
	const [company, setCompany] = useState('')
	const [role, setRole] = useState('')
	const [notes, setNotes] = useState('')
	const [priority, setPriority] = useState<Priority>('medium')
	const [applied_at, setApplied_at] = useState(todayDateString)
	const [follow_up_At, setfollow_up_At] = useState(todayDateTimeLocalString)
	const [status, setStatus] = useState<InternshipStatus>('applied')
	const [sort, setSort] = useState<SortMode>('priority')

	useEffect(() => {
		api.getInternships().then(setInternships)
	}, [])

	useEffect(() => {
		if (mode !== 'overview' || !onSelect || selectedId != null) return
		const first = internships.find(
			i => !['rejected', 'withdrawn'].includes(i.status),
		)
		if (first?.id) onSelect(first.id)
	}, [mode, internships, selectedId, onSelect])

	const activeCount = internships.filter(
		i => !['rejected', 'withdrawn'].includes(i.status),
	).length

	const interviewCount = internships.filter(
		i => i.status === 'interview',
	).length
	const offerCount = internships.filter(i => i.status === 'offer').length

	const filtered = useMemo(() => {
		let list = internships
		if (tab === 'interviews') {
			list = list.filter(i => i.status === 'interview')
		} else if (tab === 'offers') {
			list = list.filter(i => i.status === 'offer')
		} else if (tab === 'archived') {
			list = list.filter(i =>
				['rejected', 'withdrawn'].includes(i.status),
			)
		} else if (tab === 'all') {
			list = list.filter(
				i => !['rejected', 'withdrawn'].includes(i.status),
			)
		}
		const q = search.trim().toLowerCase()
		if (q) {
			list = list.filter(
				i =>
					i.company.toLowerCase().includes(q) ||
					(i.role || '').toLowerCase().includes(q),
			)
		}
		return sortByMode(list, sort)
	}, [internships, tab, search, sort])

	async function updatePriority(item: Internship, newPriority: Priority) {
		const updated = await api.updateInternship(item.id!, {
			priority: newPriority,
		})
		setInternships(prev =>
			prev.map(x => (x.id === item.id ? updated : x)),
		)
	}

	async function add() {
		if (!company.trim()) return
		const newInternship = await api.createInternship({
			company,
			role,
			priority,
			applied_at,
			status,
			notes,
			followup_at: follow_up_At || undefined,
		})
		setInternships(prev => [...prev, newInternship])
		setCompany('')
		setRole('')
		setNotes('')
		setPriority('medium')
		setApplied_at(todayDateString)
		setfollow_up_At('')
		setShowForm(false)
		if (onSelect && newInternship.id) onSelect(newInternship.id)
	}

	async function updateStatus(
		internship: Internship,
		newStatus: InternshipStatus,
	) {
		const updated = await api.updateInternship(internship.id!, {
			status: newStatus,
		})
		setInternships(prev =>
			prev.map(x => (x.id === internship.id ? updated : x)),
		)
	}

	async function remove(id: number) {
		await api.deleteInternship(id)
		setInternships(prev => prev.filter(x => x.id !== id))
	}

	if (mode === 'manage') {
		return (
			<div className="internships internships--manage">
				<h2 className="page-heading">Internships</h2>
				<div className="form-panel">
					<div className="field-row internship-form">
						<div className="field">
							<label className="field-label" htmlFor="m-company">
								Company
							</label>
							<input
								id="m-company"
								className="input"
								value={company}
								onChange={e => setCompany(e.target.value)}
							/>
						</div>
						<div className="field field--grow">
							<label className="field-label" htmlFor="m-role">
								Role
							</label>
							<input
								id="m-role"
								className="input"
								value={role}
								onChange={e => setRole(e.target.value)}
							/>
						</div>
						<div className="field">
							<label className="field-label" htmlFor="m-applied">
								Applied date
							</label>
							<input
								id="m-applied"
								className="input"
								type="date"
								value={applied_at}
								onChange={e => setApplied_at(e.target.value)}
							/>
						</div>
						<div className="field">
							<label className="field-label" htmlFor="m-status">
								Status
							</label>
							<select
								id="m-status"
								className="select"
								value={status}
								onChange={e =>
									setStatus(e.target.value as InternshipStatus)
								}
							>
								<option value="applied">Applied</option>
								<option value="oa">OA</option>
								<option value="interview">Interview</option>
								<option value="offer">Offer</option>
								<option value="rejected">Rejected</option>
								<option value="withdrawn">Withdrawn</option>
							</select>
						</div>
						<div className="field">
							<label className="field-label" htmlFor="m-priority">
								Priority
							</label>
							<select
								id="m-priority"
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
						<div className="field field--grow">
							<label className="field-label" htmlFor="m-notes">
								Notes
							</label>
							<input
								id="m-notes"
								className="input"
								value={notes}
								onChange={e => setNotes(e.target.value)}
							/>
						</div>
						<div className="field">
							<label className="field-label" htmlFor="m-followup">
								Follow-up date &amp; time
							</label>
							<input
								id="m-followup"
								className="input"
								type="datetime-local"
								value={follow_up_At}
								onChange={e => setfollow_up_At(e.target.value)}
							/>
						</div>
						<button type="button" className="btn" onClick={add}>
							Add
						</button>
					</div>
				</div>
				<ListControls sort={sort} onSortChange={setSort} />
				<div className="internship-list">
					{sortByMode(internships, sort).map((i, index) => (
						<div
							key={i.id}
							className={`internship-item priority-${i.priority} status-${i.status}`}
						>
							<span className="row-index">{index + 1}</span>
							<div className="internship-info">
								<span className="internship-company">
									{i.company}
								</span>
								<span className="internship-role">{i.role}</span>
							</div>
							<select
								className="select select--inline"
								value={i.priority}
								onChange={e =>
									updatePriority(
										i,
										e.target.value as Priority,
									)
								}
							>
								<option value="high">High</option>
								<option value="medium">Medium</option>
								<option value="low">Low</option>
							</select>
							<select
								className="select select--inline"
								value={i.status}
								onChange={e =>
									updateStatus(
										i,
										e.target.value as InternshipStatus,
									)
								}
							>
								<option value="applied">Applied</option>
								<option value="oa">OA</option>
								<option value="interview">Interview</option>
								<option value="offer">Offer</option>
								<option value="rejected">Rejected</option>
								<option value="withdrawn">Withdrawn</option>
							</select>
							<button
								type="button"
								className="btn-ghost"
								onClick={() => remove(i.id!)}
							>
								Delete
							</button>
						</div>
					))}
				</div>
			</div>
		)
	}

	return (
		<div className="internships internships--overview">
			<header className="internships-header">
				<div className="internships-title-row">
					<h1 className="internships-title">Active Applications</h1>
					<span className="internships-badge">
						{activeCount} Active
					</span>
				</div>
				<div className="internships-toolbar">
					<div className="internships-search-wrap">
						<input
							className="internships-search"
							placeholder="Grep applications..."
							value={search}
							onChange={e => setSearch(e.target.value)}
						/>
						<span className="internships-kbd">⌘K</span>
					</div>
					<button
						type="button"
						className="btn btn--new"
						onClick={() => setShowForm(v => !v)}
					>
						+ New App
					</button>
				</div>
			</header>

			{showForm && (
				<div className="form-panel internship-form--inline">
					<div className="field-row">
						<div className="field">
							<label className="field-label" htmlFor="app-company">
								Company
							</label>
							<input
								id="app-company"
								className="input"
								placeholder="Stripe"
								value={company}
								onChange={e => setCompany(e.target.value)}
							/>
						</div>
						<div className="field field--grow">
							<label className="field-label" htmlFor="app-role">
								Role
							</label>
							<input
								id="app-role"
								className="input"
								placeholder="SWE Intern"
								value={role}
								onChange={e => setRole(e.target.value)}
							/>
						</div>
						<div className="field">
							<label className="field-label" htmlFor="app-status">
								Status
							</label>
							<select
								id="app-status"
								className="select"
								value={status}
								onChange={e =>
									setStatus(e.target.value as InternshipStatus)
								}
							>
								<option value="applied">Applied</option>
								<option value="oa">OA</option>
								<option value="interview">Interview</option>
								<option value="offer">Offer</option>
							</select>
						</div>
						<div className="field">
							<label className="field-label" htmlFor="app-applied">
								Applied date
							</label>
							<input
								id="app-applied"
								className="input"
								type="date"
								value={applied_at}
								onChange={e => setApplied_at(e.target.value)}
							/>
						</div>
						<div className="field">
							<label className="field-label" htmlFor="app-followup">
								Follow-up
							</label>
							<input
								id="app-followup"
								className="input"
								type="datetime-local"
								value={follow_up_At}
								onChange={e => setfollow_up_At(e.target.value)}
							/>
						</div>
						<div className="field field--grow">
							<label className="field-label" htmlFor="app-notes">
								Notes
							</label>
							<input
								id="app-notes"
								className="input"
								placeholder="Follow up next week"
								value={notes}
								onChange={e => setNotes(e.target.value)}
							/>
						</div>
						<button type="button" className="btn" onClick={add}>
							Save
						</button>
						<button
							type="button"
							className="btn-ghost"
							onClick={() => setShowForm(false)}
						>
							Cancel
						</button>
					</div>
				</div>
			)}

			<ListControls sort={sort} onSortChange={setSort} />

			<div className="internships-tabs" role="tablist">
				<button
					type="button"
					className={`internships-tab ${tab === 'all' ? 'active' : ''}`}
					onClick={() => setTab('all')}
				>
					All active
				</button>
				<button
					type="button"
					className={`internships-tab ${tab === 'interviews' ? 'active' : ''}`}
					onClick={() => setTab('interviews')}
				>
					Interviews ({interviewCount})
				</button>
				<button
					type="button"
					className={`internships-tab ${tab === 'offers' ? 'active' : ''}`}
					onClick={() => setTab('offers')}
				>
					Offers ({offerCount})
				</button>
				<button
					type="button"
					className={`internships-tab ${tab === 'archived' ? 'active' : ''}`}
					onClick={() => setTab('archived')}
				>
					Archived
				</button>
			</div>

			<div className="internships-table-wrap">
				<table className="internships-table">
					<thead>
						<tr>
							<th>#</th>
							<th aria-label="Accent" />
							<th>Company</th>
							<th>Role</th>
							<th>Status</th>
							<th>Follow-up</th>
							<th>Applied</th>
							<th aria-label="Actions" />
						</tr>
					</thead>
					<tbody>
						{filtered.map((i, index) => (
							<tr
								key={i.id}
								className={`internships-row ${selectedId === i.id ? 'selected' : ''} ${i.status === 'rejected' ? 'rejected' : ''}`}
								onClick={() => i.id && onSelect?.(i.id)}
							>
								<td className="row-index">{index + 1}</td>
								<td>
									<span
										className={`row-accent accent-${companyAccent(i.company)}`}
									/>
								</td>
								<td>
									<div className="company-cell">
										<span className="company-icon">
											{i.company.charAt(0)}
										</span>
										{i.company}
									</div>
								</td>
								<td>{i.role || '—'}</td>
								<td>
									<span
										className={`status-pill status-${i.status}`}
									>
										{statusLabel(i.status)}
									</span>
								</td>
								<td className="last-action">
									{formatDateAdded(i.followup_at)}
								</td>
								<td className="last-action">
									{formatDateAdded(resolveAppliedDate(i))}
								</td>
								<td
									className="row-actions"
									onClick={e => e.stopPropagation()}
								>
									<select
										className="select select--inline"
										value={i.status}
										onChange={e =>
											updateStatus(
												i,
												e.target.value as InternshipStatus,
											)
										}
										aria-label="Status"
									>
										<option value="applied">Applied</option>
										<option value="oa">OA</option>
										<option value="interview">Interview</option>
										<option value="offer">Offer</option>
										<option value="rejected">Rejected</option>
										<option value="withdrawn">Withdrawn</option>
									</select>
									<select
										className="select select--inline"
										value={i.priority}
										onChange={e =>
											updatePriority(
												i,
												e.target.value as Priority,
											)
										}
										aria-label="Priority"
									>
										<option value="high">High</option>
										<option value="medium">Medium</option>
										<option value="low">Low</option>
									</select>
									<button
										type="button"
										className="btn-ghost"
										onClick={() => remove(i.id!)}
									>
										Delete
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
				{filtered.length === 0 && (
					<p className="internships-empty">No applications match</p>
				)}
			</div>
		</div>
	)
}
