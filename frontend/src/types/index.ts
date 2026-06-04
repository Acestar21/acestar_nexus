export type Priority = "high" | "medium" | "low";

export type InternshipStatus = 
    | "applied" 
    | "oa" 
    | "interview" 
    | "offer" 
    | "rejected" 
    | "withdrawn";

export interface Internship {
    id?: number;
    company: string;
    role: string;
    applied_at?: string;
    status: InternshipStatus;
    priority: Priority;
    notes?: string;
    followup_at?: string;
    created_at?: string;
}

export interface Goal {
    id?: number;
    name: string;
    target: number;
    current: number
    start_date: string;
    end_date: string;
    unit: string;
    priority: Priority;
}

export interface Reminder {
    id?: number;
    text: string;
    priority: Priority;
    remind_at?: string;
    done: boolean;
    created_at?: string;
}

export interface Todo {
    id?: number;
    text: string;
    priority: Priority;
    remind_at?: string;
    done: boolean;
    created_at?: string;
}

export interface GoalProgress {
	goal: Goal
	current: number
	weeks_elapsed: number
	weeks_remaining: number
	weekly_target: number
	expected_by_now: number
	on_track: boolean
    deadline_close: boolean
}

export interface Focus {
	type: string
	priority: string
	message: string
	id: number | null
}