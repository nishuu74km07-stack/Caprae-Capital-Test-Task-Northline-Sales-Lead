import { NextResponse } from "next/server";
import { errorResponse } from "@/server/http";
import { shortlistInBox } from "@/server/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { action?: string };
    if (body.action === "shortlist-inbox") return NextResponse.json(shortlistInBox());
    throw new Error("Unknown bulk action.");
  } catch (error) {
    return errorResponse(error);
  }
}
