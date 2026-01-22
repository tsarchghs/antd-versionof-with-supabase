export type Role = "admin" | "manager" | "member";

export type ProjectStatus = "planned" | "active" | "completed" | "cancelled";
export type TaskStatus = "todo" | "in_progress" | "blocked" | "done";
export type TaskApprovalStatus = "draft" | "pending" | "approved";
export type WorkLogStatus = "pending" | "approved" | "rejected";
export type ApprovalStatus = "approved" | "rejected";

export interface Company {
  id: string;
  name: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: Role;
  company_id: string | null;
  created_at?: string;
}

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  start_date: string | null;
  end_date: string | null;
  created_at?: string;
}

export interface ProjectMember {
  project_id: string;
  user_id: string;
  member_role: string;
  profile?: Profile;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  unit: string;
  planned_qty: number | null;
  planned_hours: number | null;
  start_date: string | null;
  end_date: string | null;
  status: TaskStatus;
  approval_status: TaskApprovalStatus;
  assigned_to: string | null;
  created_at?: string;
}

export interface WorkLog {
  id: string;
  task_id: string;
  user_id: string;
  log_date: string;
  qty_done: number | null;
  hours: number | null;
  note: string | null;
  status: WorkLogStatus;
  created_at?: string;
}

export interface Approval {
  id: string;
  work_log_id: string;
  status: ApprovalStatus;
  note: string | null;
  created_at?: string;
}

export interface Attachment {
  id: string;
  project_id: string;
  task_id: string;
  work_log_id: string | null;
  kind: string;
  path: string;
  created_at?: string;
}

export interface DashboardSummary {
  total_hours: number;
  total_qty: number;
  pending_approvals: number;
  approved_hours: number;
  approved_qty: number;
  rejected_count: number;
}

export interface ProjectReport {
  project: Project;
  tasks: Task[];
  work_logs: WorkLog[];
  summary: ReportSummary;
}

export interface UserReport {
  user_id: string;
  work_logs: WorkLog[];
  summary: ReportSummary;
}

export interface CompanyReport {
  projects: Project[];
  summary: ReportSummary;
}

export interface ReportSummary {
  total_hours: number;
  total_qty: number;
  pending: number;
  approved: number;
  rejected: number;
}
