import { NextResponse } from "next/server";

export function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Something went wrong.";
  const status = message.toLowerCase().includes("not found") ? 404 : 400;
  return NextResponse.json({ error: message }, { status });
}
