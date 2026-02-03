import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
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
    const workLogId = requireUuid(params.id, "id");

    const { data, error } = await supabase
      .from("approvals")
      .select("*")
      .eq("work_log_id", workLogId)
      .maybeSingle();
    throwIfPostgrestError(error);
    return jsonOk(assertFound(data));
  } catch (err) {
    return jsonError(err);
  }
}
