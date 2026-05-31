import { useState, useEffect } from 'react'
import { api } from '../lib/api'

export interface Snapshot {
  internships: number
  reminders: number
  todos: number
}

export function useSnapshot() {
  const [snapshot, setSnapshot] = useState<Snapshot>({
    internships: 0,
    reminders: 0,
    todos: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      try {
        const [internships, reminders, todos] = await Promise.all([
          api.getInternships(),
          api.getReminders(),
          api.getTodos(),
        ])
        setSnapshot({
          internships: internships.length,
          reminders: reminders.filter(r => !r.done).length,
          todos: todos.filter(t => !t.done).length,
        })
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return { snapshot, loading }
}