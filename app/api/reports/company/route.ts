import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { summarizeWorkLogs } from "@/lib/api/reports";
import { jsonError, jsonOk } from "@/lib/api/response";
import { throwIfPostgrestError } from "@/lib/api/supabase-helpers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { supabase } = await requireAuth(request);

    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("*");
    throwIfPostgrestError(projectsError);

    const { data: workLogs, error: logsError } = await supabase
      .from("work_logs")
      .select("*");
    throwIfPostgrestError(logsError);

    return jsonOk({
      projects: projects ?? [],
      summary: summarizeWorkLogs(workLogs ?? []),
    });
  } catch (err) {
    return jsonError(err);
  }
}
