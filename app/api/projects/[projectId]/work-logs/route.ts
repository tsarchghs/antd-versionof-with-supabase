import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/response";
import { throwIfPostgrestError } from "@/lib/api/supabase-helpers";
import { requireUuid } from "@/lib/api/validation";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } },
) {
  try {
    const { supabase } = await requireAuth(request);
    const projectId = requireUuid(params.projectId, "projectId");

    const { data, error } = await supabase
      .from("work_logs")
      .select("*")
      .eq("project_id", projectId);
    throwIfPostgrestError(error);
    return jsonOk(data ?? []);
  } catch (err) {
    return jsonError(err);
  }
}
