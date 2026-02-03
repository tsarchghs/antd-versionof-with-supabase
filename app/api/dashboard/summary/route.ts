import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/response";
import { throwIfPostgrestError } from "@/lib/api/supabase-helpers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { supabase } = await requireAuth(request);
    const { data, error } = await supabase
      .from("work_logs")
      .select("hours, qty_done, status");
    throwIfPostgrestError(error);

    const summary = {
      total_hours: 0,
      total_qty: 0,
      pending_approvals: 0,
      approved_hours: 0,
      approved_qty: 0,
      rejected_count: 0,
    };

    for (const log of data ?? []) {
      summary.total_hours += Number(log.hours ?? 0);
      summary.total_qty += Number(log.qty_done ?? 0);
      if (log.status === "pending") {
        summary.pending_approvals += 1;
      }
      if (log.status === "approved") {
        summary.approved_hours += Number(log.hours ?? 0);
        summary.approved_qty += Number(log.qty_done ?? 0);
      }
      if (log.status === "rejected") {
        summary.rejected_count += 1;
      }
    }

    return jsonOk(summary);
  } catch (err) {
    return jsonError(err);
  }
}
