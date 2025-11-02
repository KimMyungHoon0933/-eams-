// src/app/api/users/route.js
export const runtime = "nodejs";

import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, age, created_at FROM users ORDER BY id DESC"
    );
    return Response.json(rows);
  } catch (e) {
    console.error("GET /api/users error:", e); // 콘솔에 전체 에러
    return Response.json(
      { error: String(e?.message || e), code: e?.code, errno: e?.errno },
      { status: 500 }
    );
  }
}
