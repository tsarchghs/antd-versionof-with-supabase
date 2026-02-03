import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { readJson } from "@/lib/api/request";
import { jsonError, jsonOk } from "@/lib/api/response";
import { requireRole } from "@/lib/api/roles";
import { throwIfPostgrestError } from "@/lib/api/supabase-helpers";
import { requireString, requireUuid } from "@/lib/api/validation";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { supabase, user } = await requireAuth(request);
    await requireRole(supabase, user.id, ["admin"]);

    const companyId = requireUuid(params.id, "id");
    const body = await readJson<{ name?: string }>(request);
    const name = requireString(body?.name, "name");

    const { data, error } = await supabase
      .from("companies")
      .update({ name })
      .eq("id", companyId)
      .select("*")
      .single();
    throwIfPostgrestError(error);
    return jsonOk(data);
  } catch (err) {
    return jsonError(err);
  }
}
