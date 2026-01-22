import { apiFetch } from "./client";
import type {
  Approval,
  Attachment,
  Company,
  CompanyReport,
  DashboardSummary,
  Profile,
  Project,
  ProjectMember,
  ProjectReport,
  Task,
  UserReport,
  WorkLog,
} from "./types";

function requireToken(token: string | null | undefined) {
  if (!token) {
    throw new Error("Missing auth token. Please sign in again.");
  }
  return token;
}

export async function getCompanyMe(token: string | null) {
  return apiFetch<Company | null>("/companies/me", {
    token: requireToken(token),
  });
}

export async function createCompany(token: string | null, name: string) {
  return apiFetch<Company>("/companies", {
    method: "POST",
    token: requireToken(token),
    body: { name },
  });
}

export async function updateCompany(
  token: string | null,
  companyId: string,
  name: string,
) {
  return apiFetch<Company>(`/companies/${companyId}`, {
    method: "PATCH",
    token: requireToken(token),
    body: { name },
  });
}

export async function getProfileMe(token: string | null) {
  return apiFetch<Profile>("/profiles/me", {
    token: requireToken(token),
  });
}

export async function updateProfileMe(
  token: string | null,
  payload: { full_name?: string; phone?: string },
) {
  return apiFetch<Profile>("/profiles/me", {
    method: "PATCH",
    token: requireToken(token),
    body: payload,
  });
}

export async function getProfilesCompany(token: string | null) {
  return apiFetch<Profile[]>("/profiles/company", {
    token: requireToken(token),
  });
}

export async function inviteUser(token: string | null, email: string) {
  return apiFetch<{ ok?: boolean }>("/auth/invite", {
    method: "POST",
    token: requireToken(token),
    body: { email },
  });
}

export async function getProjects(token: string | null) {
  return apiFetch<Project[]>("/projects", {
    token: requireToken(token),
  });
}

export async function getProject(token: string | null, projectId: string) {
  return apiFetch<Project>(`/projects/${projectId}`, {
    token: requireToken(token),
  });
}

export async function createProject(
  token: string | null,
  payload: {
    name: string;
    start_date?: string | null;
    end_date?: string | null;
    status: Project["status"];
  },
) {
  return apiFetch<Project>("/projects", {
    method: "POST",
    token: requireToken(token),
    body: payload,
  });
}

export async function updateProject(
  token: string | null,
  projectId: string,
  payload: {
    name?: string;
    start_date?: string | null;
    end_date?: string | null;
    status?: Project["status"];
  },
) {
  return apiFetch<Project>(`/projects/${projectId}`, {
    method: "PATCH",
    token: requireToken(token),
    body: payload,
  });
}

export async function deleteProject(token: string | null, projectId: string) {
  return apiFetch<{ ok: true }>(`/projects/${projectId}`, {
    method: "DELETE",
    token: requireToken(token),
  });
}

export async function getProjectMembers(token: string | null, projectId: string) {
  return apiFetch<ProjectMember[]>(`/projects/${projectId}/members`, {
    token: requireToken(token),
  });
}

export async function addProjectMember(
  token: string | null,
  projectId: string,
  payload: { user_id: string; member_role: string },
) {
  return apiFetch<ProjectMember>(`/projects/${projectId}/members`, {
    method: "POST",
    token: requireToken(token),
    body: payload,
  });
}

export async function updateProjectMember(
  token: string | null,
  projectId: string,
  userId: string,
  payload: { member_role: string },
) {
  return apiFetch<ProjectMember>(
    `/projects/${projectId}/members/${userId}`,
    {
      method: "PATCH",
      token: requireToken(token),
      body: payload,
    },
  );
}

export async function removeProjectMember(
  token: string | null,
  projectId: string,
  userId: string,
) {
  return apiFetch<{ ok: true }>(`/projects/${projectId}/members/${userId}`, {
    method: "DELETE",
    token: requireToken(token),
  });
}

export async function getProjectTasks(token: string | null, projectId: string) {
  return apiFetch<Task[]>(`/projects/${projectId}/tasks`, {
    token: requireToken(token),
  });
}

export async function createTask(
  token: string | null,
  projectId: string,
  payload: {
    title: string;
    unit: string;
    planned_qty?: number | null;
    planned_hours?: number | null;
    start_date?: string | null;
    end_date?: string | null;
    status: Task["status"];
    approval_status?: Task["approval_status"];
    assigned_to?: string | null;
  },
) {
  return apiFetch<Task>(`/projects/${projectId}/tasks`, {
    method: "POST",
    token: requireToken(token),
    body: payload,
  });
}

export async function getTask(token: string | null, taskId: string) {
  return apiFetch<Task>(`/tasks/${taskId}`, {
    token: requireToken(token),
  });
}

export async function updateTask(
  token: string | null,
  taskId: string,
  payload: Partial<{
    title: string;
    unit: string;
    planned_qty: number | null;
    planned_hours: number | null;
    start_date: string | null;
    end_date: string | null;
    status: Task["status"];
    assigned_to: string | null;
    approval_status: Task["approval_status"];
  }>,
) {
  return apiFetch<Task>(`/tasks/${taskId}`, {
    method: "PATCH",
    token: requireToken(token),
    body: payload,
  });
}

export async function approveTask(token: string | null, taskId: string) {
  return apiFetch<Task>(`/tasks/${taskId}/approve`, {
    method: "POST",
    token: requireToken(token),
  });
}

export async function deleteTask(token: string | null, taskId: string) {
  return apiFetch<{ ok: true }>(`/tasks/${taskId}`, {
    method: "DELETE",
    token: requireToken(token),
  });
}

export async function getTaskWorkLogs(token: string | null, taskId: string) {
  return apiFetch<WorkLog[]>(`/tasks/${taskId}/work-logs`, {
    token: requireToken(token),
  });
}

export async function getProjectWorkLogs(
  token: string | null,
  projectId: string,
) {
  return apiFetch<WorkLog[]>(`/projects/${projectId}/work-logs`, {
    token: requireToken(token),
  });
}

export async function createWorkLog(
  token: string | null,
  taskId: string,
  payload: {
    log_date: string;
    qty_done?: number | null;
    hours?: number | null;
    note?: string | null;
  },
) {
  return apiFetch<WorkLog>(`/tasks/${taskId}/work-logs`, {
    method: "POST",
    token: requireToken(token),
    body: payload,
  });
}

export async function updateWorkLog(
  token: string | null,
  workLogId: string,
  payload: Partial<{
    qty_done: number | null;
    hours: number | null;
    note: string | null;
  }>,
) {
  return apiFetch<WorkLog>(`/work-logs/${workLogId}`, {
    method: "PATCH",
    token: requireToken(token),
    body: payload,
  });
}

export async function deleteWorkLog(token: string | null, workLogId: string) {
  return apiFetch<{ ok: true }>(`/work-logs/${workLogId}`, {
    method: "DELETE",
    token: requireToken(token),
  });
}

export async function getPendingApprovals(token: string | null) {
  return apiFetch<WorkLog[]>("/approvals/pending", {
    token: requireToken(token),
  });
}

export async function approveWorkLog(
  token: string | null,
  workLogId: string,
  payload: { note?: string | null },
) {
  return apiFetch<Approval>(`/work-logs/${workLogId}/approve`, {
    method: "POST",
    token: requireToken(token),
    body: payload,
  });
}

export async function rejectWorkLog(
  token: string | null,
  workLogId: string,
  payload: { note: string },
) {
  return apiFetch<Approval>(`/work-logs/${workLogId}/reject`, {
    method: "POST",
    token: requireToken(token),
    body: payload,
  });
}

export async function getWorkLogApproval(
  token: string | null,
  workLogId: string,
) {
  return apiFetch<Approval>(`/work-logs/${workLogId}/approval`, {
    token: requireToken(token),
  });
}

export async function getAttachments(token: string | null, taskId: string) {
  return apiFetch<Attachment[]>("/attachments", {
    token: requireToken(token),
    query: { task_id: taskId },
  });
}

export async function createUploadUrl(
  token: string | null,
  payload: { filename: string; task_id: string },
) {
  return apiFetch<{ url: string; path: string }>("/attachments/upload-url", {
    method: "POST",
    token: requireToken(token),
    body: payload,
  });
}

export async function createAttachment(
  token: string | null,
  payload: {
    path: string;
    project_id: string;
    task_id: string;
    work_log_id?: string | null;
    kind: string;
  },
) {
  return apiFetch<Attachment>("/attachments", {
    method: "POST",
    token: requireToken(token),
    body: payload,
  });
}

export async function deleteAttachment(
  token: string | null,
  attachmentId: string,
) {
  return apiFetch<{ ok: true }>(`/attachments/${attachmentId}`, {
    method: "DELETE",
    token: requireToken(token),
  });
}

export async function getDashboardSummary(token: string | null) {
  return apiFetch<DashboardSummary>("/dashboard/summary", {
    token: requireToken(token),
  });
}

export async function getProjectReport(token: string | null, projectId: string) {
  return apiFetch<ProjectReport>(`/reports/project/${projectId}`, {
    token: requireToken(token),
  });
}

export async function getUserReport(token: string | null, userId: string) {
  return apiFetch<UserReport>(`/reports/user/${userId}`, {
    token: requireToken(token),
  });
}

export async function getCompanyReport(token: string | null) {
  return apiFetch<CompanyReport>("/reports/company", {
    token: requireToken(token),
  });
}
