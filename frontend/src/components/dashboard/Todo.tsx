import { useMemo, useState, useEffect } from 'react'
import { api } from '../../lib/api'
import type { Priority, Todo } from '../../types/index'
import { formatDateAdded } from '../../utils/dates'
import { sortByMode, type SortMode } from '../../utils/sort'
import { readCheckedIds, toggleChecked } from '../../utils/bucketList'
import ListControls from '../shared/ListControls'
import '../shared/forms.css'
import './todo.css'

export default function Todos() {
	const [todos, setTodos] = useState<Todo[]>([])
	const [text, setText] = useState('')
	const [priority, setPriority] = useState<Priority>('medium')
	const [sort, setSort] = useState<SortMode>('priority')
	const [checked, setChecked] = useState<Set<number>>(() => readCheckedIds())

	useEffect(() => {
		api.getTodos().then(setTodos)
	}, [])

	const sorted = useMemo(() => sortByMode(todos, sort), [todos, sort])

	async function add() {
		if (!text.trim()) return
		const newTodo = await api.createTodo({
			text,
			priority,
			done: false,
		})
		setTodos(prev => [...prev, newTodo])
		setText('')
		setPriority('medium')
	}

	function handleVisualCheck(id: number) {
		setChecked(toggleChecked(id))
	}

	async function updatePriority(t: Todo, newPriority: Priority) {
		const updated = await api.updateTodo(t.id!, { priority: newPriority })
		setTodos(prev => prev.map(x => (x.id === t.id ? updated : x)))
	}

	async function remove(id: number) {
		await api.deleteTodo(id)
		setTodos(prev => prev.filter(x => x.id !== id))
		const next = new Set(checked)
		next.delete(id)
		setChecked(next)
	}

	return (
		<div className="todos">
			<h2 className="section-title">Bucket list</h2>
			<p className="section-desc">
				Check items off visually — no alarms or strict completion tracking.
			</p>

			<div className="form-panel">
				<div className="field-row">
					<div className="field field--grow">
						<label className="field-label" htmlFor="todo-text">
							Task description
						</label>
						<input
							id="todo-text"
							className="input"
							placeholder="Something you want to do someday"
							value={text}
							onChange={e => setText(e.target.value)}
							onKeyDown={e => e.key === 'Enter' && add()}
						/>
					</div>
					<div className="field">
						<label className="field-label" htmlFor="todo-priority">
							Priority
						</label>
						<select
							id="todo-priority"
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
					<button type="button" className="btn" onClick={add}>
						Add to bucket
					</button>
				</div>
			</div>

			<ListControls sort={sort} onSortChange={setSort} />

			<div className="todo-list">
				{sorted.map(t => {
					const isChecked = t.id != null && checked.has(t.id)
					return (
						<div
							key={t.id}
							className={`todo-item priority-${t.priority} ${isChecked ? 'checked' : ''}`}
						>
							<input
								type="checkbox"
								checked={isChecked}
								onChange={() => t.id && handleVisualCheck(t.id)}
								aria-label={`Mark "${t.text}" visually complete`}
							/>
							<span className="todo-text">{t.text}</span>
							<select
								className="select select--inline"
								value={t.priority}
								onChange={e =>
									updatePriority(t, e.target.value as Priority)
								}
								aria-label="Change priority"
							>
								<option value="high">High</option>
								<option value="medium">Medium</option>
								<option value="low">Low</option>
							</select>
							<span className={`badge ${t.priority}`}>
								{t.priority}
							</span>
							<span className="item-date">
								Added {formatDateAdded(t.created_at)}
							</span>
							<button
								type="button"
								className="btn-ghost"
								onClick={() => remove(t.id!)}
							>
								Delete
							</button>
						</div>
					)
				})}
			</div>
		</div>
	)
}
