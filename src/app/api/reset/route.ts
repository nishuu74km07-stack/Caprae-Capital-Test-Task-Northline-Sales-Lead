import { NextResponse } from "next/server";
import { errorResponse } from "@/server/http";
import { resetDemo } from "@/server/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function POST() {
  try {
    return NextResponse.json(resetDemo());
  } catch (error) {
    return errorResponse(error);
  }
}
