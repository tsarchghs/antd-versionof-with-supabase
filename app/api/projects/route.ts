import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { HttpError } from "@/lib/api/errors";
import { PROJECT_STATUSES } from "@/lib/api/enums";
import { readJson } from "@/lib/api/request";
import { jsonError, jsonOk } from "@/lib/api/response";
import { requireRole } from "@/lib/api/roles";
import { throwIfPostgrestError } from "@/lib/api/supabase-helpers";
import {
  optionalDateString,
  requireEnum,
  requireString,
} from "@/lib/api/validation";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { supabase } = await requireAuth(request);
    const { data, error } = await supabase.from("projects").select("*");
    throwIfPostgrestError(error);
    return jsonOk(data ?? []);
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await requireAuth(request);
    await requireRole(supabase, user.id, ["manager"]);

    const body = await readJson<{
      name?: string;
      start_date?: string;
      end_date?: string;
      status?: string;
    }>(request);

    const name = requireString(body?.name, "name");
    const startDate = optionalDateString(body?.start_date, "start_date");
    const endDate = optionalDateString(body?.end_date, "end_date");
    const status = requireEnum(body?.status, PROJECT_STATUSES, "status");

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .maybeSingle();
    throwIfPostgrestError(profileError);

    const companyId = profile?.company_id;
    if (!companyId) {
      throw new HttpError(400, "User is not assigned to a company");
    }

    const { data, error } = await supabase
      .from("projects")
      .insert({
        company_id: companyId,
        name,
        start_date: startDate ?? null,
        end_date: endDate ?? null,
        status,
      })
      .select("*")
      .single();
    throwIfPostgrestError(error);
    return jsonOk(data);
  } catch (err) {
    return jsonError(err);
  }
}
