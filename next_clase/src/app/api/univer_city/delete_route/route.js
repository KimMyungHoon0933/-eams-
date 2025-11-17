// src/app/api/delete/route.js
export const runtime = "nodejs";
import { db } from "@/lib/db";

/**
 * 완전 단순 DELETE 엔드포인트 (INSERT 라우터와 동일 철학)
 *
 * 사용 예시:
 *  - /api/delete?table=테이블명&where={"id":1}                 ← JSON(안전 바인딩)
 *  - /api/delete?table=테이블명&where={"id":[1,2,3]}           ← JSON + IN 바인딩
 *  - /api/delete?table=테이블명&where=id IN (1,2,3)            ← 원문 문자열 그대로
 *
 * ⚠️ 주의: 의도적으로 검증/이스케이프가 거의 없음.
 *   - table/where(원문)는 그대로 삽입되므로 인젝션 위험이 있어.
 *   - JSON 객체면 플레이스홀더 바인딩(안전)하고,
 *     JSON이 아니면 WHERE 절을 원문 그대로 사용(위험)해.
 *   - 실수로 전체 삭제 방지를 위해 where 파라미터는 필수로 강제.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get("table");
    const whereParam = searchParams.get("where");

    if (!table) {
      return Response.json({ error: "Missing 'table' query parameter" }, { status: 400 });
    }
    if (!whereParam) {
      return Response.json({ error: "Missing 'where' query parameter (전체 삭제 방지)" }, { status: 400 });
    }

    let sql = "";
    let result;

    // JSON이면 안전 바인딩, 아니면 원문 WHERE 그대로 사용
    if (whereParam.trim().startsWith("{") || whereParam.trim().startsWith("[")) {
      try {
        const obj = JSON.parse(whereParam);
        if (obj && typeof obj === "object" && !Array.isArray(obj)) {
          // { col: value | [v1, v2] } 형태 가정
          const clauses = [];
          const params = [];
          for (const [col, val] of Object.entries(obj)) {
            if (Array.isArray(val)) {
              if (val.length === 0) {
                // 빈 IN 방지 → 항상 false
                clauses.push("1 = 0");
              } else {
                clauses.push(`${col} IN (${val.map(() => "?").join(", ")})`);
                params.push(...val);
              }
            } else if (val === null) {
              clauses.push(`${col} IS NULL`);
            } else {
              clauses.push(`${col} = ?`);
              params.push(val);
            }
          }

          if (clauses.length === 0) {
            return Response.json({ error: "유효한 where 조건이 필요합니다" }, { status: 400 });
          }

          const whereClause = clauses.join(" AND ");
          sql = `DELETE FROM ${table} WHERE ${whereClause}`;
          const [execRes] = await db.execute(sql, params);
          result = execRes;
        } else {
          // 배열 등 애매하면 원문 WHERE로 폴백
          const rawWhere = String(whereParam);
          sql = `DELETE FROM ${table} WHERE ${rawWhere}`;
          const [qRes] = await db.query(sql);
          result = qRes;
        }
      } catch {
        // JSON 파싱 실패 → 원문 WHERE 사용
        const rawWhere = String(whereParam);
        sql = `DELETE FROM ${table} WHERE ${rawWhere}`;
        const [qRes] = await db.query(sql);
        result = qRes;
      }
    } else {
      // 원문 WHERE 그대로 삽입
      const rawWhere = String(whereParam);
      sql = `DELETE FROM ${table} WHERE ${rawWhere}`;
      const [qRes] = await db.query(sql);
      result = qRes;
    }

    return Response.json({
      sql,
      affectedRows: result?.affectedRows ?? null,
      warningStatus: result?.warningStatus ?? null,
    });
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
    console.error("[/api/delete] Error:", payload);

    return new Response(JSON.stringify(payload, null, 2), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
