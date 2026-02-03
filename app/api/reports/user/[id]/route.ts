import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { summarizeWorkLogs } from "@/lib/api/reports";
import { jsonError, jsonOk } from "@/lib/api/response";
import { throwIfPostgrestError } from "@/lib/api/supabase-helpers";
import { requireUuid } from "@/lib/api/validation";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { supabase } = await requireAuth(request);
    const userId = requireUuid(params.id, "id");

    const { data: workLogs, error } = await supabase
      .from("work_logs")
      .select("*")
      .eq("user_id", userId);
    throwIfPostgrestError(error);

    return jsonOk({
      user_id: userId,
      work_logs: workLogs ?? [],
      summary: summarizeWorkLogs(workLogs ?? []),
    });
  } catch (err) {
    return jsonError(err);
  }
}
