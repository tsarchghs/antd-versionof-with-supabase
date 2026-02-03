import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth(request);
    return jsonOk({ user });
  } catch (err) {
    return jsonError(err);
  }
}
