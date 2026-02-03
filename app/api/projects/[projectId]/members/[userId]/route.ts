import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { ROLES } from "@/lib/api/enums";
import { readJson } from "@/lib/api/request";
import { jsonError, jsonOk } from "@/lib/api/response";
import { requireRole } from "@/lib/api/roles";
import {
  assertArrayNotEmpty,
  throwIfPostgrestError,
} from "@/lib/api/supabase-helpers";
import { requireEnum, requireUuid } from "@/lib/api/validation";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { projectId: string; userId: string } },
) {
  try {
    const { supabase, user } = await requireAuth(request);
    await requireRole(supabase, user.id, ["manager"]);

    const projectId = requireUuid(params.projectId, "projectId");
    const userId = requireUuid(params.userId, "userId");
    const body = await readJson<{ member_role?: string }>(request);
    const memberRole = requireEnum(body?.member_role, ROLES, "member_role");

    const { data, error } = await supabase
      .from("project_members")
      .update({ member_role: memberRole })
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .select("*")
      .single();
    throwIfPostgrestError(error);
    return jsonOk(data);
  } catch (err) {
    return jsonError(err);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string; userId: string } },
) {
  try {
    const { supabase, user } = await requireAuth(request);
    await requireRole(supabase, user.id, ["manager"]);

    const projectId = requireUuid(params.projectId, "projectId");
    const userId = requireUuid(params.userId, "userId");
    const { data, error } = await supabase
      .from("project_members")
      .delete()
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .select("user_id");
    throwIfPostgrestError(error);
    assertArrayNotEmpty(data);
    return jsonOk({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
