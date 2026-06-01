import type { Internship, Goal, GoalProgress, Reminder, Todo } from "../types/index";

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

    health: () => request<{ status: string }>("/health"),
};