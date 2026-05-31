import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import type { Priority, Todo } from '../../types/index'
import './todo.css'

export default function Todos() {
    const [todos, setTodos] = useState<Todo[]>([])
    const [text, setText] = useState('')
    const [priority, setPriority] = useState<Priority>('medium')
    const [remindAt, setRemindAt] = useState('')

    useEffect(() => {
        api.getTodos().then(setTodos)
    }, [])

    async function add() {
        if (!text.trim()) return
        const newTodo = await api.createTodo({
        text,
        priority,
        remind_at: remindAt || undefined,
        done: false,
        })
        setTodos(prev => [...prev, newTodo])
        setText('')
        setPriority('medium')
        setRemindAt('')
    }

    async function toggle(t: Todo) {
        const updated = await api.updateTodo(t.id!, { done: !t.done })
        setTodos(prev => prev.map(x => x.id === t.id ? updated : x))
    }

    async function remove(id: number) {
        await api.deleteTodo(id)
        setTodos(prev => prev.filter(x => x.id !== id))
    }

    const pending = todos.filter(t => !t.done)
    const done = todos.filter(t => t.done)

    return (
        <div className="todos">
        <h2 className="section-title">To-Do's</h2>

        <div className="todo-form">
            <input
            className="input"
            placeholder="Add a todo..."
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

        <div className="todo-list">
            {pending.map(t => (
                <div key={t.id} className={`todo-item priority-${t.priority}`}>
                    <input type="checkbox" checked={false} onChange={() => toggle(t)} />
                    <span className="todo-text">{t.text}</span>
                    <span className={`badge ${t.priority}`}>{t.priority}</span>
                    {t.remind_at && <span className="todo-time">{new Date(t.remind_at).toLocaleString()}</span>}
                    <button className="btn-ghost" onClick={() => remove(t.id!)}>✕</button>
                </div>
            ))}
        </div>

        {done.length > 0 && (
            <div className="todo-done">
            <p className="done-label">Completed ({done.length})</p>
                {done.map(t => (
                    <div key={t.id} className="todo-item done">
                        <input type="checkbox" checked={true} onChange={() => toggle(t)} />
                        <span className="todo-text">{t.text}</span>
                        <button className="btn-ghost" onClick={() => remove(t.id!)}>✕</button>
                    </div>
                ))}
            </div>
        )}
        </div>
    )
}