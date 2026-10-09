import { NextResponse } from "next/server";
import { getWorkspace } from "@/server/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  try {
    return NextResponse.json(getWorkspace());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load the desk.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
