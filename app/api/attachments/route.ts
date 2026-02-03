import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { readJson } from "@/lib/api/request";
import { jsonError, jsonOk } from "@/lib/api/response";
import {
  assertArrayNotEmpty,
  throwIfPostgrestError,
} from "@/lib/api/supabase-helpers";
import {
  optionalString,
  requireString,
  requireUuid,
} from "@/lib/api/validation";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { supabase } = await requireAuth(request);
    const taskId = request.nextUrl.searchParams.get("task_id") ?? undefined;

    let query = supabase.from("attachments").select("*");
    if (taskId) {
      requireUuid(taskId, "task_id");
      query = query.eq("task_id", taskId);
    }

    const { data, error } = await query;
    throwIfPostgrestError(error);
    return jsonOk(data ?? []);
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await requireAuth(request);
    const body = await readJson<{
      path?: string;
      project_id?: string;
      task_id?: string;
      work_log_id?: string;
      kind?: string;
    }>(request);

    const path = requireString(body?.path, "path");
    const projectId = requireString(body?.project_id, "project_id");
    const taskId = requireString(body?.task_id, "task_id");
    const workLogId = optionalString(body?.work_log_id, "work_log_id");
    const kind = requireString(body?.kind, "kind");

    const { data, error } = await supabase
      .from("attachments")
      .insert({
        path,
        project_id: projectId,
        task_id: taskId,
        work_log_id: workLogId ?? null,
        kind,
        created_by: user.id,
      })
      .select("*")
      .single();
    throwIfPostgrestError(error);
    return jsonOk(data);
  } catch (err) {
    return jsonError(err);
  }
}
