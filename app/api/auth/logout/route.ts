import { jsonError, jsonOk } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    return jsonOk({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
