// src/app/api/query/route.js
export const runtime = "nodejs";
import { db } from "@/lib/db";

/**
 * 완전 단순 쿼리 엔드포인트 (검증 없음)
 * - /api/query?table=테이블명&select=["col1","col2"]  또는 select=col1,col2
 * - select 생략 시 * 사용
 * - where 파라미터를 추가 지원: /api/query?...&where=id=1  → ... WHERE id=1
 *   (보안/검증 없음: 전달 문자열이 그대로 SQL에 붙음)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get("table");
    const selectParam = searchParams.get("select");
    const whereParam = searchParams.get("where"); // ✅ 추가

    if (!table) {
      return Response.json({ error: "Missing 'table' query parameter" }, { status: 400 });
    }

    let selectClause = "*";
    if (selectParam) {
      if (selectParam.trim().startsWith("[")) {
        try {
          const arr = JSON.parse(selectParam);
          selectClause = Array.isArray(arr) ? arr.join(", ") : String(selectParam);
        } catch {
          selectClause = String(selectParam);
        }
      } else {
        selectClause = String(selectParam);
      }
    }

    // ✅ where 붙이기 (아주 단순히 그대로 이어붙임)
    const whereClause = whereParam && whereParam.trim() ? ` WHERE ${whereParam}` : "";

    const sql = `SELECT ${selectClause} FROM ${table}${whereClause}`;
    const [rows] = await db.query(sql);

    return Response.json({ sql, rows });
  } catch (e) {
    const payload = {
      error: String(e?.message || e),
      name: e?.name,
      code: e?.code,
      errno: e?.errno,
      sqlMessage: e?.sqlMessage,
      sqlState: e?.sqlState,
      stack: e?.stack,
      node: process?.versions?.node,
      platform: process?.platform,
    };
    console.error("[/api/query] Error:", payload);

    return new Response(JSON.stringify(payload, null, 2), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
