import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/response";
import { requireRole } from "@/lib/api/roles";
import { throwIfPostgrestError } from "@/lib/api/supabase-helpers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { supabase, user } = await requireAuth(request);
    await requireRole(supabase, user.id, ["manager"]);

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .maybeSingle();
    throwIfPostgrestError(profileError);

    const companyId = profile?.company_id;
    if (!companyId) {
      return jsonOk([]);
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("company_id", companyId);
    throwIfPostgrestError(error);
    return jsonOk(data ?? []);
  } catch (err) {
    return jsonError(err);
  }
}
