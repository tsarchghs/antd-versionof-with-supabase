export function summarizeWorkLogs(
  workLogs: Array<{ hours?: number; qty_done?: number; status?: string }>,
) {
  const summary = {
    total_hours: 0,
    total_qty: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  };

  for (const log of workLogs) {
    summary.total_hours += Number(log.hours ?? 0);
    summary.total_qty += Number(log.qty_done ?? 0);
    if (log.status === "pending") summary.pending += 1;
    if (log.status === "approved") summary.approved += 1;
    if (log.status === "rejected") summary.rejected += 1;
  }

  return summary;
}
