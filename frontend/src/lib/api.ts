import type { Internship, Goal, GoalProgress, Reminder, Todo , Focus} from "../types/index";

const BASE_URL = "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
}

export const api = {
    getFocus: () => request<Focus>('/focus/'),

    getInternships: () => request<Internship[]>("/internships/"),
    createInternship: (data: Omit<Internship, "id" | "created_at">) => request<Internship>("/internships/", { method: "POST", body: JSON.stringify(data) }),
    updateInternship: (id: number, data: Partial<Internship>) => request<Internship>(`/internships/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    deleteInternship: (id: number) => request<{ ok: boolean }>(`/internships/${id}`, { method: "DELETE" }),

    getGoals: () => request<Goal[]>("/goals/"),
    getGoalProgress: (id: number) => request<GoalProgress>(`/goals/${id}/progress`),
    createGoal: (data: Omit<Goal, "id">) => request<Goal>("/goals/", { method: "POST", body: JSON.stringify(data) }),
    updateGoal: (id: number, data: Partial<Goal>) => request<Goal>(`/goals/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    deleteGoal: (id: number) => request<{ ok: boolean }>(`/goals/${id}`, { method: "DELETE" }),

    getReminders: () => request<Reminder[]>("/reminders/"),
    createReminder: (data: Omit<Reminder, "id" | "created_at">) => request<Reminder>("/reminders/", { method: "POST", body: JSON.stringify(data) }),
    updateReminder: (id: number, data: Partial<Reminder>) => request<Reminder>(`/reminders/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    deleteReminder: (id: number) => request<{ ok: boolean }>(`/reminders/${id}`, { method: "DELETE" }),

    getTodos: () => request<Todo[]>("/todos/"),
    createTodo: (data: Omit<Todo, "id" | "created_at">) => request<Todo>("/todos/", { method: "POST", body: JSON.stringify(data) }),
    updateTodo: (id: number, data: Partial<Todo>) => request<Todo>(`/todos/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    deleteTodo: (id: number) => request<{ ok: boolean }>(`/todos/${id}`, { method: "DELETE" }),

    logFitness: (data: { date: string, completed: boolean, duration_minutes?: number, notes?: string }) => {
        const params = new URLSearchParams()
        params.append('date', data.date)
        params.append('completed', String(data.completed))
        if (data.duration_minutes) params.append('duration_minutes', String(data.duration_minutes))
        if (data.notes) params.append('notes', data.notes)
        return request<{ status: string, date: string }>(`/metrics/fitness/log?${params.toString()}`, {
            method: 'POST',
        })
    },

    getMetrics: () => request<{
        leetcode: {
            activity: {
                problem_solved_today: number
                total_problem_solved: number
                current_streak: number
            }
        } | null,
        github: {
            activity: {
                commits_today: number
                commits_this_week: number
                current_streak: number
            }
        } | null,
        fitness: {
            worked_out_today: boolean
            current_streak: number
            total_workouts_this_week: number
        } | null
    }>('/metrics/'),

    health: () => request<{ status: string }>("/health"),
};