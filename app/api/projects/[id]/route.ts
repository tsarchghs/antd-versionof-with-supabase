import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { HttpError } from "@/lib/api/errors";
import { PROJECT_STATUSES } from "@/lib/api/enums";
import { readJson } from "@/lib/api/request";
import { jsonError, jsonOk } from "@/lib/api/response";
import { requireRole } from "@/lib/api/roles";
import {
  assertArrayNotEmpty,
  assertFound,
  throwIfPostgrestError,
} from "@/lib/api/supabase-helpers";
import {
  optionalDateString,
  optionalEnum,
  optionalString,
  requireUuid,
} from "@/lib/api/validation";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { supabase } = await requireAuth(request);
    const projectId = requireUuid(params.id, "id");

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .maybeSingle();
    throwIfPostgrestError(error);
    return jsonOk(assertFound(data));
  } catch (err) {
    return jsonError(err);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { supabase, user } = await requireAuth(request);
    await requireRole(supabase, user.id, ["manager"]);

    const projectId = requireUuid(params.id, "id");
    const body = await readJson<{
      name?: string;
      start_date?: string;
      end_date?: string;
      status?: string;
    }>(request);

    const name = optionalString(body?.name, "name");
    const startDate = optionalDateString(body?.start_date, "start_date");
    const endDate = optionalDateString(body?.end_date, "end_date");
    const status = optionalEnum(body?.status, PROJECT_STATUSES, "status");

    const updates: Record<string, string> = {};
    if (name !== undefined) updates.name = name;
    if (startDate !== undefined) updates.start_date = startDate;
    if (endDate !== undefined) updates.end_date = endDate;
    if (status !== undefined) updates.status = status;

    if (Object.keys(updates).length === 0) {
      throw new HttpError(400, "No fields to update");
    }

    const { data, error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", projectId)
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
  { params }: { params: { id: string } },
) {
  try {
    const { supabase, user } = await requireAuth(request);
    await requireRole(supabase, user.id, ["admin"]);

    const projectId = requireUuid(params.id, "id");
    const { data, error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId)
      .select("id");
    throwIfPostgrestError(error);
    assertArrayNotEmpty(data);
    return jsonOk({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
