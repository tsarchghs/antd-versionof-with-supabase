import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { readJson } from "@/lib/api/request";
import { jsonError, jsonOk } from "@/lib/api/response";
import { assertFound, throwIfPostgrestError } from "@/lib/api/supabase-helpers";
import {
  optionalNumber,
  optionalString,
  requireDateString,
  requireUuid,
} from "@/lib/api/validation";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } },
) {
  try {
    const { supabase } = await requireAuth(request);
    const taskId = requireUuid(params.taskId, "taskId");

    const { data, error } = await supabase
      .from("work_logs")
      .select("*")
      .eq("task_id", taskId);
    throwIfPostgrestError(error);
    return jsonOk(data ?? []);
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { taskId: string } },
) {
  try {
    const { supabase, user } = await requireAuth(request);
    const taskId = requireUuid(params.taskId, "taskId");

    const body = await readJson<{
      log_date?: string;
      qty_done?: number | null;
      hours?: number | null;
      note?: string;
    }>(request);
    const logDate = requireDateString(body?.log_date, "log_date");
    const qtyDone = optionalNumber(body?.qty_done, "qty_done");
    const hours = optionalNumber(body?.hours, "hours");
    const note = optionalString(body?.note, "note");

    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("project_id")
      .eq("id", taskId)
      .maybeSingle();
    throwIfPostgrestError(taskError);
    const taskRow = assertFound(task);

    const { data, error } = await supabase
      .from("work_logs")
      .insert({
        task_id: taskId,
        project_id: taskRow.project_id,
        user_id: user.id,
        log_date: logDate,
        qty_done: qtyDone ?? null,
        hours: hours ?? null,
        note: note ?? null,
        status: "pending",
      })
      .select("*")
      .single();
    throwIfPostgrestError(error);
    return jsonOk(data);
  } catch (err) {
    return jsonError(err);
  }
}
