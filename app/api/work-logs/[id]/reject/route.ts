import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { readJson } from "@/lib/api/request";
import { jsonError, jsonOk } from "@/lib/api/response";
import { requireRole } from "@/lib/api/roles";
import { assertFound, throwIfPostgrestError } from "@/lib/api/supabase-helpers";
import { requireString, requireUuid } from "@/lib/api/validation";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { supabase, user } = await requireAuth(request);
    await requireRole(supabase, user.id, ["manager"]);

    const workLogId = requireUuid(params.id, "id");
    const body = await readJson<{ note?: string }>(request);
    const note = requireString(body?.note, "note");

    const { data: workLog, error: updateError } = await supabase
      .from("work_logs")
      .update({ status: "rejected" })
      .eq("id", workLogId)
      .eq("status", "pending")
      .select("*")
      .single();
    throwIfPostgrestError(updateError);
    assertFound(workLog);

    const { data, error } = await supabase
      .from("approvals")
      .insert({
        work_log_id: workLogId,
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        status: "rejected",
        note,
      })
      .select("*")
      .single();
    throwIfPostgrestError(error);
    return jsonOk(data);
  } catch (err) {
    return jsonError(err);
  }
}
