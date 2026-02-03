import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { invokeEdgeFunction } from "@/lib/api/edge";
import { readJson } from "@/lib/api/request";
import { jsonError, jsonOk } from "@/lib/api/response";
import { optionalString } from "@/lib/api/validation";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { supabase } = await requireAuth(request);
    const data = await invokeEdgeFunction<Record<string, unknown>>(
      supabase,
      "profiles-me",
      { action: "get" },
    );
    return jsonOk(data);
  } catch (err) {
    return jsonError(err);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { supabase } = await requireAuth(request);
    const body = await readJson<{ full_name?: string; phone?: string }>(request);

    const fullName = optionalString(body?.full_name, "full_name");
    const phone = optionalString(body?.phone, "phone");

    const data = await invokeEdgeFunction<Record<string, unknown>>(
      supabase,
      "profiles-me",
      {
        full_name: fullName,
        phone,
      },
    );
    return jsonOk(data);
  } catch (err) {
    return jsonError(err);
  }
}
