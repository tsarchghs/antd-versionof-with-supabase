import type { SupabaseClient } from "@supabase/supabase-js";
import { HttpError } from "./errors";

export async function invokeEdgeFunction<T>(
  supabase: SupabaseClient,
  name: string,
  body?: Record<string, unknown>,
  options?: { method?: string },
): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, {
    body,
    method: options?.method,
  });

  if (error) {
    const context = (error as { context?: Response }).context;
    let message = error.message;
    let status = 500;
    if (context) {
      status = context.status;
      try {
        const payload = await context.clone().json();
        if (payload && typeof payload === "object" && "message" in payload) {
          const ctxMessage = (payload as { message?: string }).message;
          if (ctxMessage) {
            message = ctxMessage;
          }
        }
      } catch {
        // ignore parse failures
      }
    }
    throw new HttpError(status, message);
  }

  return data as T;
}
