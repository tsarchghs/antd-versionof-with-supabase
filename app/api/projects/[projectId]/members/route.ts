import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { ROLES } from "@/lib/api/enums";
import { readJson } from "@/lib/api/request";
import { jsonError, jsonOk } from "@/lib/api/response";
import { requireRole } from "@/lib/api/roles";
import { throwIfPostgrestError } from "@/lib/api/supabase-helpers";
import { requireEnum, requireString, requireUuid } from "@/lib/api/validation";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } },
) {
  try {
    const { supabase } = await requireAuth(request);
    const projectId = requireUuid(params.projectId, "projectId");

    const { data, error } = await supabase
      .from("project_members")
      .select("*")
      .eq("project_id", projectId);
    throwIfPostgrestError(error);
    return jsonOk(data ?? []);
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } },
) {
  try {
    const { supabase, user } = await requireAuth(request);
    await requireRole(supabase, user.id, ["manager"]);

    const projectId = requireUuid(params.projectId, "projectId");
    const body = await readJson<{ user_id?: string; member_role?: string }>(
      request,
    );
    const userId = requireString(body?.user_id, "user_id");
    const memberRole = requireEnum(body?.member_role, ROLES, "member_role");

    const { data, error } = await supabase
      .from("project_members")
      .insert({
        project_id: projectId,
        user_id: userId,
        member_role: memberRole,
      })
      .select("*")
      .single();
    throwIfPostgrestError(error);
    return jsonOk(data);
  } catch (err) {
    return jsonError(err);
  }
}
