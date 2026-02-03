import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { TASK_APPROVAL_STATUSES, TASK_STATUSES } from "@/lib/api/enums";
import { HttpError } from "@/lib/api/errors";
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
  optionalNumber,
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
    const taskId = requireUuid(params.id, "id");

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", taskId)
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
    const taskId = requireUuid(params.id, "id");

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    throwIfPostgrestError(profileError);
    const role = profile?.role ?? "member";

    const body = await readJson<{
      title?: string;
      unit?: string;
      planned_qty?: number;
      planned_hours?: number;
      start_date?: string;
      end_date?: string;
      status?: string;
      assigned_to?: string;
      approval_status?: string;
    }>(request);

    const updates: Record<string, string | number> = {};

    const title = optionalString(body?.title, "title");
    if (title !== undefined) updates.title = title;

    const unit = optionalString(body?.unit, "unit");
    if (unit !== undefined) updates.unit = unit;

    const plannedQty = optionalNumber(body?.planned_qty, "planned_qty");
    if (plannedQty !== undefined) updates.planned_qty = plannedQty;

    const plannedHours = optionalNumber(body?.planned_hours, "planned_hours");
    if (plannedHours !== undefined) updates.planned_hours = plannedHours;

    const startDate = optionalDateString(body?.start_date, "start_date");
    if (startDate !== undefined) updates.start_date = startDate;

    const endDate = optionalDateString(body?.end_date, "end_date");
    if (endDate !== undefined) updates.end_date = endDate;

    const status = optionalEnum(body?.status, TASK_STATUSES, "status");
    if (status !== undefined) updates.status = status;

    const assignedTo = optionalString(body?.assigned_to, "assigned_to");
    if (assignedTo !== undefined) {
      if (role === "member") {
        throw new HttpError(400, "Members cannot reassign tasks.");
      }
      updates.assigned_to = assignedTo;
    }

    const approvalStatus = optionalEnum(
      body?.approval_status,
      TASK_APPROVAL_STATUSES,
      "approval_status",
    );
    if (approvalStatus !== undefined) {
      if (role === "member" && approvalStatus === "approved") {
        throw new HttpError(
          400,
          "Members can only move tasks to draft or pending.",
        );
      }
      updates.approval_status = approvalStatus;
    }

    if (Object.keys(updates).length === 0) {
      throw new HttpError(400, "No fields to update");
    }

    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", taskId)
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
    await requireRole(supabase, user.id, ["manager"]);

    const taskId = requireUuid(params.id, "id");
    const { data, error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId)
      .select("id");
    throwIfPostgrestError(error);
    assertArrayNotEmpty(data);
    return jsonOk({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
