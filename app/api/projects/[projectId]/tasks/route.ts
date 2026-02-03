import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import {
  TASK_APPROVAL_STATUSES,
  TASK_STATUSES,
} from "@/lib/api/enums";
import { HttpError } from "@/lib/api/errors";
import { readJson } from "@/lib/api/request";
import { jsonError, jsonOk } from "@/lib/api/response";
import { requireRole } from "@/lib/api/roles";
import { throwIfPostgrestError } from "@/lib/api/supabase-helpers";
import {
  optionalDateString,
  optionalEnum,
  optionalNumber,
  optionalString,
  requireEnum,
  requireString,
  requireUuid,
} from "@/lib/api/validation";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } },
) {
  try {
    const { supabase } = await requireAuth(request);
    const projectId = requireUuid(params.projectId, "projectId");

    const { data, error } = await supabase
      .from("tasks")
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
    await requireRole(supabase, user.id, ["member"]);

    const projectId = requireUuid(params.projectId, "projectId");
    const body = await readJson<{
      title?: string;
      unit?: string;
      planned_qty?: number | null;
      planned_hours?: number | null;
      start_date?: string | null;
      end_date?: string | null;
      status?: string;
      assigned_to?: string | null;
      approval_status?: string;
    }>(request);

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    throwIfPostgrestError(profileError);
    const role = profile?.role ?? "member";

    const title = requireString(body?.title, "title");
    const unit = requireString(body?.unit, "unit");
    const plannedQty = optionalNumber(body?.planned_qty, "planned_qty");
    const plannedHours = optionalNumber(body?.planned_hours, "planned_hours");
    const startDate = optionalDateString(body?.start_date, "start_date");
    const endDate = optionalDateString(body?.end_date, "end_date");
    const status = requireEnum(body?.status, TASK_STATUSES, "status");

    const assignedTo =
      role === "member"
        ? user.id
        : optionalString(body?.assigned_to, "assigned_to");

    const approvalStatusInput = optionalEnum(
      body?.approval_status,
      TASK_APPROVAL_STATUSES,
      "approval_status",
    );
    const approvalStatus =
      role === "member"
        ? approvalStatusInput ?? "draft"
        : approvalStatusInput ?? "approved";

    if (role === "member" && approvalStatus === "approved") {
      throw new HttpError(
        400,
        "Members can only create draft or pending tasks.",
      );
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        project_id: projectId,
        title,
        unit,
        planned_qty: plannedQty ?? null,
        planned_hours: plannedHours ?? null,
        start_date: startDate ?? null,
        end_date: endDate ?? null,
        status,
        assigned_to: assignedTo ?? null,
        approval_status: approvalStatus,
      })
      .select("*")
      .single();
    throwIfPostgrestError(error);
    return jsonOk(data);
  } catch (err) {
    return jsonError(err);
  }
}
