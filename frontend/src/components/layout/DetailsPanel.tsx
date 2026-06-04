import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import type { Internship, InternshipStatus } from '../../types/index'
import './layout.css'

interface Props {
	internshipId: number | null
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
			return 'Withdrawn'
		default:
			return status
	}
}

function statusHistory(status: string): string[] {
	const order = ['applied', 'oa', 'interview', 'offer']
	const idx = order.indexOf(status)
	if (status === 'rejected' || status === 'withdrawn') {
		return ['Applied', statusLabel(status as InternshipStatus)]
	}
	if (idx === -1) return ['Applied', statusLabel(status as InternshipStatus)]
	return order.slice(0, idx + 1).map(s => statusLabel(s as InternshipStatus))
}

export default function DetailsPanel({ internshipId }: Props) {
	const [internship, setInternship] = useState<Internship | null>(null)

	useEffect(() => {
		if (internshipId == null) {
			setInternship(null)
			return
		}
		api.getInternships().then(list => {
			setInternship(list.find(i => i.id === internshipId) ?? null)
		})
	}, [internshipId])

	if (!internship) {
		return (
			<aside className="details-panel details-panel--empty">
				<p>Select an application to view details</p>
			</aside>
		)
	}

	const history = statusHistory(internship.status)
	const nextAction =
		internship.notes?.trim() ||
		'No notes yet — add notes when creating or editing this application.'

	return (
		<aside className="details-panel">
			<header className="details-header">
				<span>Details</span>
			</header>

			<div className="details-company">
				<h2>{internship.company}</h2>
			</div>
			<p className="details-role">{internship.role || 'Role not set'}</p>

			<div className="details-meta">
				<span className={`status-pill status-${internship.status}`}>
					{statusLabel(internship.status)}
				</span>
				<span className={`badge ${internship.priority}`}>
					{internship.priority} priority
				</span>
			</div>

			<div className="details-action-box">
				<span className="details-action-icon">!</span>
				<div>
					<p className="details-action-title">Next action needed</p>
					<p className="details-action-text">{nextAction}</p>
				</div>
			</div>

			<div className="details-timeline">
				<p className="details-section-label">Status history</p>
				<ul>
					{history.map((label, i) => (
						<li
							key={`${label}-${i}`}
							className={
								i === history.length - 1 ? 'current' : 'past'
							}
						>
							{label}
						</li>
					))}
				</ul>
			</div>
		</aside>
	)
}
