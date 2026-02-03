import { NextResponse } from "next/server";
import { HttpError } from "./errors";

export function jsonOk(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(err: unknown) {
  if (err instanceof HttpError) {
    return NextResponse.json({ message: err.message }, { status: err.status });
  }
  console.error("[api] Unhandled error:", err);
  return NextResponse.json(
    { message: "Internal server error" },
    { status: 500 },
  );
}
