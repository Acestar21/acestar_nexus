import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import type { InternshipStatus, Internship, Priority } from '../../types/index'
import './internship.css'

export default function Internships(){
    const [internships, setInternships] = useState<Internship[]>([])
    const [company , setCompany] = useState('')
    const [role , setRole] = useState('')
    const [notes, setNotes] = useState('')
    const [priority, setPriority] = useState<Priority>('medium')
    const [applied_at, setApplied_at] = useState('')
    const [follow_up_At, setfollow_up_At] = useState('')
    const [status , setStatus] = useState<InternshipStatus>('applied')

    useEffect(() => {
        api.getInternships().then(setInternships)
    }, [])

    async function add(){
        if (!company.trim()) return

        const newInternship = await api.createInternship({
            company,
            role,
            priority,
            applied_at,
            status,
            notes,
            followup_at : follow_up_At || undefined
        })
        setInternships(prev => [...prev, newInternship])
        setCompany('')
        setRole('')
        setPriority('medium')
        setfollow_up_At('')
    }

    async function updateStatus(internship: Internship, newStatus: InternshipStatus) {
        const updated = await api.updateInternship(internship.id!, { status: newStatus })
        setInternships(prev => prev.map(x => x.id === internship.id ? updated : x))
    }
    
    async function remove(id: number) {
        await api.deleteInternship(id)
        setInternships(prev => prev.filter(x => x.id !== id))
    }

    return (
        <div className="internships">
            <h2 className="section-title">Internships</h2>

            <div className="internship-form">
                <input
                    className="input"
                    placeholder="Company"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                />
                <input
                    className="input"
                    placeholder="Role"
                    value={role}
                    onChange={e => setRole(e.target.value)}
                />
                <input
                    className="input"
                    type="date"
                    value={applied_at}
                    onChange={e => setApplied_at(e.target.value)}
                />
                <select
                    className="select"
                    value={status}
                    onChange={e => setStatus(e.target.value as InternshipStatus)}
                >
                    <option value="applied">Applied</option>
                    <option value="oa">OA</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                    <option value="withdrawn">Withdrawn</option>
                </select>
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
                    placeholder="Notes (optional)"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                />
                <input
                    className="input"
                    type="datetime-local"
                    value={follow_up_At}
                    onChange={e => setfollow_up_At(e.target.value)}
                />
                <button className="btn" onClick={add}>Add</button>
            </div>

            <div className="internship-list">
                {internships.map(i => (
                    <div key={i.id} className={`internship-item priority-${i.priority} status-${i.status}`}>
                        <div className="internship-info">
                            <span className="internship-company">{i.company}</span>
                            <span className="internship-role">{i.role}</span>
                        </div>
                        <select
                            className="select"
                            value={i.status}
                            onChange={e => updateStatus(i, e.target.value as InternshipStatus)}
                        >
                            <option value="applied">Applied</option>
                            <option value="oa">OA</option>
                            <option value="interview">Interview</option>
                            <option value="offer">Offer</option>
                            <option value="rejected">Rejected</option>
                            <option value="withdrawn">Withdrawn</option>
                        </select>
                        <span className={`badge ${i.priority}`}>{i.priority}</span>
                        {i.applied_at && <span className="internship-date">{i.applied_at}</span>}
                        {i.notes && <span className="internship-notes">{i.notes}</span>}
                        <button className="btn-ghost" onClick={() => remove(i.id!)}>✕</button>
                    </div>
                ))}
            </div>
        </div>
    )

}