import { NextResponse } from "next/server";
import { errorResponse } from "@/server/http";
import { importCsv } from "@/server/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { csv?: string };
    if (!body.csv?.trim()) throw new Error("Paste a CSV or choose a file first.");
    return NextResponse.json(importCsv(body.csv));
  } catch (error) {
    return errorResponse(error);
  }
}
