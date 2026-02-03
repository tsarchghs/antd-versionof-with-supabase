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
    const body = await readJson<{ filename?: string; task_id?: string }>(
      request,
    );
    const filename = requireString(body?.filename, "filename");
    const taskId = requireString(body?.task_id, "task_id");
    const data = await invokeEdgeFunction<{ url: string; path: string }>(
      supabase,
      "attachments-upload-url",
      { filename, task_id: taskId },
    );
    return jsonOk(data);
  } catch (err) {
    return jsonError(err);
  }
}
