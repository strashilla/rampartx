import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const rows = await query("SELECT 1 AS ok");
    return NextResponse.json({
      ok: true,
      db: "connected",
      check: rows[0]?.ok === 1,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { ok: false, error: message },
      { status: 503 }
    );
  }
}
