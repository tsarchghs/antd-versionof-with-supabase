import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { HttpError } from "@/lib/api/errors";
import { readJson } from "@/lib/api/request";
import { jsonError, jsonOk } from "@/lib/api/response";
import {
  assertArrayNotEmpty,
  throwIfPostgrestError,
} from "@/lib/api/supabase-helpers";
import {
  optionalNumber,
  optionalString,
  requireUuid,
} from "@/lib/api/validation";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { supabase } = await requireAuth(request);
    const workLogId = requireUuid(params.id, "id");
    const body = await readJson<{
      qty_done?: number;
      hours?: number;
      note?: string;
    }>(request);

    const updates: Record<string, string | number> = {};
    const qtyDone = optionalNumber(body?.qty_done, "qty_done");
    if (qtyDone !== undefined) updates.qty_done = qtyDone;
    const hours = optionalNumber(body?.hours, "hours");
    if (hours !== undefined) updates.hours = hours;
    const note = optionalString(body?.note, "note");
    if (note !== undefined) updates.note = note;

    if (Object.keys(updates).length === 0) {
      throw new HttpError(400, "No fields to update");
    }

    const { data, error } = await supabase
      .from("work_logs")
      .update(updates)
      .eq("id", workLogId)
      .eq("status", "pending")
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
    const { supabase } = await requireAuth(request);
    const workLogId = requireUuid(params.id, "id");

    const { data, error } = await supabase
      .from("work_logs")
      .delete()
      .eq("id", workLogId)
      .eq("status", "pending")
      .select("id");
    throwIfPostgrestError(error);
    assertArrayNotEmpty(data);
    return jsonOk({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
