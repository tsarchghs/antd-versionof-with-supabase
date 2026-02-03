import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { invokeEdgeFunction } from "@/lib/api/edge";
import { readJson } from "@/lib/api/request";
import { jsonError, jsonOk } from "@/lib/api/response";
import { requireString } from "@/lib/api/validation";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { supabase } = await requireAuth(request);
    const body = await readJson<{ email?: string }>(request);
    const email = requireString(body?.email, "email");
    const data = await invokeEdgeFunction<Record<string, unknown>>(
      supabase,
      "auth-invite",
      { email },
    );
    return jsonOk(data ?? { ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
