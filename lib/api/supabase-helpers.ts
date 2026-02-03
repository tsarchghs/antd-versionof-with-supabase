import type { PostgrestError } from "@supabase/supabase-js";
import { HttpError } from "./errors";

const NOT_FOUND_CODE = "PGRST116";

export function throwIfPostgrestError(error?: PostgrestError | null): void {
  if (!error) {
    return;
  }
  if (error.code === NOT_FOUND_CODE) {
    throw new HttpError(404, "Resource not found");
  }
  throw new HttpError(400, error.message);
}

export function throwIfStorageError(error?: { message?: string } | null): void {
  if (!error) {
    return;
  }
  throw new HttpError(400, error.message ?? "Storage operation failed");
}

export function assertFound<T>(data: T | null | undefined): T {
  if (!data) {
    throw new HttpError(404, "Resource not found");
  }
  return data;
}

export function assertArrayNotEmpty<T>(data: T[] | null | undefined): T[] {
  if (!data || data.length === 0) {
    throw new HttpError(404, "Resource not found");
  }
  return data;
}

export function assertInserted<T>(data: T | null | undefined): T {
  if (!data) {
    throw new HttpError(500, "Insert failed");
  }
  return data;
}
