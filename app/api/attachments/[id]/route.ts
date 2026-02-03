import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/response";
import {
  assertArrayNotEmpty,
  throwIfPostgrestError,
} from "@/lib/api/supabase-helpers";
import { requireUuid } from "@/lib/api/validation";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { supabase } = await requireAuth(request);
    const attachmentId = requireUuid(params.id, "id");

    const { data, error } = await supabase
      .from("attachments")
      .delete()
      .eq("id", attachmentId)
      .select("id");
    throwIfPostgrestError(error);
    assertArrayNotEmpty(data);
    return jsonOk({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
