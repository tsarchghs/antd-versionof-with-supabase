import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { summarizeWorkLogs } from "@/lib/api/reports";
import { jsonError, jsonOk } from "@/lib/api/response";
import { assertFound, throwIfPostgrestError } from "@/lib/api/supabase-helpers";
import { requireUuid } from "@/lib/api/validation";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { supabase } = await requireAuth(request);
    const projectId = requireUuid(params.id, "id");

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .maybeSingle();
    throwIfPostgrestError(projectError);
    const projectRow = assertFound(project);

    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("*")
      .eq("project_id", projectId);
    throwIfPostgrestError(tasksError);

    const { data: workLogs, error: logsError } = await supabase
      .from("work_logs")
      .select("*")
      .eq("project_id", projectId);
    throwIfPostgrestError(logsError);

    return jsonOk({
      project: projectRow,
      tasks: tasks ?? [],
      work_logs: workLogs ?? [],
      summary: summarizeWorkLogs(workLogs ?? []),
    });
  } catch (err) {
    return jsonError(err);
  }
}
