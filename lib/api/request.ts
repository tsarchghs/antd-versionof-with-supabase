import type { NextRequest } from "next/server";
import { HttpError } from "./errors";

export async function readJson<T>(request: NextRequest): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new HttpError(400, "Invalid JSON body");
  }
}
