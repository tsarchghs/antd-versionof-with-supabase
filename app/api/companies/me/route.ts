import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/response";
import { throwIfPostgrestError } from "@/lib/api/supabase-helpers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { supabase, user } = await requireAuth(request);
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .maybeSingle();
    throwIfPostgrestError(profileError);

    if (!profile?.company_id) {
      return jsonOk(null);
    }

    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id, name")
      .eq("id", profile.company_id)
      .maybeSingle();
    throwIfPostgrestError(companyError);
    return jsonOk(company);
  } catch (err) {
    return jsonError(err);
  }
}
