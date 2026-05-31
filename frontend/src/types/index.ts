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
    start_date: string;
    end_date: string;
    unit: string;
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