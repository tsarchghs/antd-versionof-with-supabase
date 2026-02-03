export const ROLES = ["admin", "manager", "member"] as const;
export type Role = (typeof ROLES)[number];

export const PROJECT_STATUSES = [
  "planned",
  "active",
  "completed",
  "cancelled",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const TASK_STATUSES = ["todo", "in_progress", "blocked", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_APPROVAL_STATUSES = ["draft", "pending", "approved"] as const;
export type TaskApprovalStatus = (typeof TASK_APPROVAL_STATUSES)[number];

export const WORK_LOG_STATUSES = [
  "pending",
  "approved",
  "rejected",
] as const;
export type WorkLogStatus = (typeof WORK_LOG_STATUSES)[number];

export const APPROVAL_STATUSES = ["approved", "rejected"] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export const ROLE_RANK: Record<Role, number> = {
  admin: 3,
  manager: 2,
  member: 1,
};
