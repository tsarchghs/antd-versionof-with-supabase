import type {
  ApprovalStatus,
  ProjectStatus,
  TaskStatus,
  TaskApprovalStatus,
  WorkLogStatus,
} from "@/api/types";

export function projectStatusColor(status: ProjectStatus) {
  switch (status) {
    case "planned":
      return "default";
    case "active":
      return "processing";
    case "completed":
      return "success";
    case "cancelled":
      return "error";
    default:
      return "default";
  }
}

export function taskStatusColor(status: TaskStatus) {
  switch (status) {
    case "todo":
      return "default";
    case "in_progress":
      return "processing";
    case "blocked":
      return "warning";
    case "done":
      return "success";
    default:
      return "default";
  }
}

export function workLogStatusColor(status: WorkLogStatus) {
  switch (status) {
    case "pending":
      return "warning";
    case "approved":
      return "success";
    case "rejected":
      return "error";
    default:
      return "default";
  }
}

export function taskApprovalStatusColor(status: TaskApprovalStatus) {
  switch (status) {
    case "draft":
      return "default";
    case "pending":
      return "warning";
    case "approved":
      return "success";
    default:
      return "default";
  }
}

export function approvalStatusColor(status: ApprovalStatus) {
  switch (status) {
    case "approved":
      return "success";
    case "rejected":
      return "error";
    default:
      return "default";
  }
}
