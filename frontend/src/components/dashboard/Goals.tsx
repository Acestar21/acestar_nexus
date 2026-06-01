import { useState , useEffect } from "react";
import { api } from "../../lib/api";
import type { Goal, GoalProgress } from "../../types";
import "./goals.css"

export default function Goals(){
    const [goals , setGoals] = useState<Goal[]>([])
    const [name , setName] = useState('')
    const [target , setTarget] = useState('')
    const [unit, setUnit] = useState('problems')
    const [start_date, setStart_date] = useState('')
    const [end_date, setEnd_date] = useState('')
    const [progress, setProgress] = useState<Record<number, GoalProgress>>({})

    useEffect(()=> {
        api.getGoals().then(setGoals)
    }, [])

    useEffect(() => {
        goals.forEach(g => {
            if (g.id) {
                api.getGoalProgress(g.id).then(p => {
                    setProgress(prev => ({ ...prev, [g.id!]: p }))
                })
            }
        })
    }, [goals])

    async function add(){
        if (!name.trim()) return

        const newGoal = await api.createGoal({
            name,
            target : parseInt(target),
            unit,
            start_date,
            end_date,
            current : 0,
        })
        setGoals(prev => [...prev,newGoal])
        setName('')
        setTarget('')
        setStart_date('')
        setEnd_date('')
        setUnit('problems')
    }
    
    async function remove(id: number) {
        await api.deleteGoal(id)
        setGoals(prev => prev.filter(x => x.id !== id))
    }

    async function increment(goal: Goal) {
        const updated = await api.updateGoal(goal.id!, { current: goal.current + 1 })
        setGoals(prev => prev.map(g => g.id === goal.id ? updated : g))
    }

    return (
        <div className="goals">
            <h2 className="section-title">Goals</h2>

            <div className="goal-form">
                <input
                    className="input"
                    placeholder="Goal name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
                <input
                    className="input"
                    placeholder="Target"
                    type="number"
                    value={target}
                    onChange={e => setTarget(e.target.value)}
                />
                <input
                    className="input"
                    placeholder="Unit (e.g. problems)"
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                />
                <input
                    className="input"
                    type="date"
                    value={start_date}
                    onChange={e => setStart_date(e.target.value)}
                />
                <input
                    className="input"
                    type="date"
                    value={end_date}
                    onChange={e => setEnd_date(e.target.value)}
                />
                <button className="btn" onClick={add}>Add</button>
            </div>

            <div className="goal-list">
                {goals.map(g => {
                    const p = progress[g.id!]
                    return (
                        <div key={g.id} className={`goal-item ${p && !p.on_track ? 'behind' : ''} ${p && p.deadline_close ? 'deadline-close' : ''}`}>
                            <div className="goal-info">
                                <span className="goal-name">{g.name}</span>
                                <span className="goal-progress">{g.current} / {g.target} {g.unit}</span>
                            </div>
                            {p && (
                                <div className="goal-stats">
                                    <span className="goal-stat">Week {p.weeks_elapsed} of {p.weeks_elapsed + p.weeks_remaining}</span>
                                    <span className="goal-stat">{p.weekly_target}/week target</span>
                                    <span className={`goal-status ${p.on_track ? 'on-track' : 'behind'}`}>
                                        {p.deadline_close && !p.on_track ? '⚠ deadline close' : p.on_track ? '✓ on track' : '↓ behind pace'}
                                    </span>
                                </div>
                            )}
                            <div className="goal-actions">
                                <button className="btn" onClick={() => increment(g)}>+1</button>
                                <button className="btn-ghost" onClick={() => remove(g.id!)}>✕</button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}