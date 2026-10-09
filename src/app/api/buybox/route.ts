import { NextResponse } from "next/server";
import { errorResponse } from "@/server/http";
import { saveBuyBox } from "@/server/workspace";
import type { BuyBox } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<BuyBox>;
    return NextResponse.json(saveBuyBox(body));
  } catch (error) {
    return errorResponse(error);
  }
}
