// src/app/api/query/route.js
export const runtime = "nodejs";
import { db } from "@/lib/lib/db";

/**
 * 완전 단순 쿼리 엔드포인트 (검증 없음)
 * - /api/query?table=테이블명&select=["col1","col2"]  또는 select=col1,col2
 * - select 생략 시 *
 * - 전달값을 그대로 SQL에 삽입하므로 보안장치/검증/이스케이프 일절 없음(의도적)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get("table");
    const selectParam = searchParams.get("select");

    if (!table) {
      return Response.json({ error: "Missing 'table' query parameter" }, { status: 400 });
    }

    let selectClause = "*";
    if (selectParam) {
      if (selectParam.trim().startsWith("[")) {
        // JSON 배열로 온 경우 그대로 합치기 (검증 없음)
        try {
          const arr = JSON.parse(selectParam);
          if (Array.isArray(arr)) {
            selectClause = arr.join(", ");
          } else {
            selectClause = String(selectParam);
          }
        } catch {
          // JSON 파싱 실패하면 그대로 사용
          selectClause = String(selectParam);
        }
      } else {
        // CSV 또는 임의 문자열 그대로 사용
        selectClause = String(selectParam);
      }
    }

    // 아주 단순한 쿼리 (WHERE/ORDER/LIMIT 등 일절 없음)
    const sql = `SELECT ${selectClause} FROM ${table}`;
    const [rows] = await db.query(sql);

    return Response.json({ sql, rows });
  } catch (e) {
    // ✅ 어떤 지점에서든 터진 에러를 강제로 JSON으로 직렬화해 내려줌
    const payload = {
      error: String(e?.message || e),
      name: e?.name,
      code: e?.code,
      errno: e?.errno,
      sqlMessage: e?.sqlMessage,
      sqlState: e?.sqlState,
      stack: e?.stack,
      // 런타임/환경 힌트
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