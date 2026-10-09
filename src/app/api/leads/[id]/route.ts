import { NextResponse } from "next/server";
import { isStatus } from "@/lib/labels";
import { errorResponse } from "@/server/http";
import { draftLead, enrichLead, setStatus } from "@/server/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = { action?: string; status?: unknown };

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as Payload;
    if (body.action === "status") {
      if (!isStatus(body.status)) throw new Error("Unknown status.");
      return NextResponse.json(setStatus(id, body.status));
    }
    if (body.action === "enrich") return NextResponse.json(enrichLead(id));
    if (body.action === "draft") return NextResponse.json(draftLead(id));
    throw new Error("Unknown action.");
  } catch (error) {
    return errorResponse(error);
  }
}
