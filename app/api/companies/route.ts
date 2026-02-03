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
    const body = await readJson<{ name?: string }>(request);
    const name = requireString(body?.name, "name");
    const data = await invokeEdgeFunction<Record<string, unknown>>(
      supabase,
      "companies-create",
      { name },
    );
    return jsonOk(data);
  } catch (err) {
    return jsonError(err);
  }
}
