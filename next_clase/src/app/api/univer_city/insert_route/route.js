// src/app/api/insert/route.js
export const runtime = "nodejs";
import { db } from "@/lib/db";

/**
 * 완전 단순 INSERT 엔드포인트 (select 라우터와 동일 철학: 검증/화이트리스트 없음)
 * - /api/insert?table=테이블명&cols=["c1","c2"]&values=["v1","v2"]           ← 단건
 * - /api/insert?table=테이블명&cols=c1,c2&values=[[ "v11","v12" ],[ "v21","v22" ]] ← 다건
 * - JSON 파싱 실패 시, select 라우터처럼 "그대로 문자열"을 VALUES 절에 삽입함(아래 주석 참조)
 *   예) /api/insert?table=t&cols=a,b&values=(1,'x'),(2,'y')  ← 원시 문자열 그대로
 *
 * ⚠️ 주의: 의도적으로 검증/이스케이프가 거의 없음.
 *   - table/column은 그대로 삽입되므로 식별자 인젝션 가능합니다.
 *   - values를 JSON으로 주면 플레이스홀더 바인딩(안전)하고,
 *     JSON이 아니면 원문을 그대로 VALUES에 삽입(위험)합니다.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get("table");
    const colsParam = searchParams.get("cols");
    const valuesParam = searchParams.get("values");

    if (!table) {
      return Response.json({ error: "Missing 'table' query parameter" }, { status: 400 });
    }
    if (!valuesParam) {
      return Response.json({ error: "Missing 'values' query parameter" }, { status: 400 });
    }

    // cols: select 라우터와 동일한 파싱 규칙 (JSON 배열이면 join, 아니면 원문 사용)
    let colsClause = "";
    if (colsParam) {
      if (colsParam.trim().startsWith("[")) {
        try {
          const arr = JSON.parse(colsParam);
          if (Array.isArray(arr)) {
            colsClause = `(${arr.join(", ")})`;
          } else {
            colsClause = `(${String(colsParam)})`;
          }
        } catch {
          colsClause = `(${String(colsParam)})`;
        }
      } else {
        colsClause = `(${String(colsParam)})`;
      }
    } else {
      // INSERT는 컬럼 생략 시 테이블 전체 컬럼 순서에 종속 → 의도치 않은 에러를 막으려 명시 강제 권장
      // select 라우터처럼 완전 프리하게 가려면 아래 주석 해제
      // colsClause = "";
      return Response.json({ error: "Missing 'cols' query parameter" }, { status: 400 });
    }

    // values: JSON 배열이면 안전 바인딩, 아니면 원문 그대로 VALUES 절에 삽입
    let sql = "";
    let result;
    if (valuesParam.trim().startsWith("[")) {
      // JSON 파싱 시도
      try {
        const parsed = JSON.parse(valuesParam);
        let rows = [];
        if (Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0])) {
          // 2차원 배열 → 다건
          rows = parsed;
        } else if (Array.isArray(parsed)) {
          // 1차원 배열 → 단건
          rows = [parsed];
        } else {
          // 이상하면 원문 사용 모드로 폴백
          const rawValues = String(valuesParam);
          sql = `INSERT INTO ${table} ${colsClause} VALUES ${rawValues}`;
          [result] = await db.query(sql);
          return Response.json({ sql, affectedRows: result?.affectedRows ?? null, insertId: result?.insertId ?? null });
        }

        // 플레이스홀더 구성
        const one = `(${rows[0].map(() => "?").join(", ")})`;
        const placeholders = rows.map(() => one).join(", ");
        const params = rows.flat();

        sql = `INSERT INTO ${table} ${colsClause} VALUES ${placeholders}`;
        const [execRes] = await db.execute(sql, params);
        result = execRes;
      } catch {
        // JSON 실패 → 원문 그대로
        const rawValues = String(valuesParam);
        sql = `INSERT INTO ${table} ${colsClause} VALUES ${rawValues}`;
        const [qRes] = await db.query(sql);
        result = qRes;
      }
    } else {
      // 원시 문자열 그대로 VALUES 절에 삽입 (select 라우터와 동일한 '그대로' 철학)
      const rawValues = String(valuesParam);
      sql = `INSERT INTO ${table} ${colsClause} VALUES ${rawValues}`;
      const [qRes] = await db.query(sql);
      result = qRes;
    }

    return Response.json({
      sql,
      affectedRows: result?.affectedRows ?? null,
      insertId: result?.insertId ?? null,
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
    console.error("[/api/insert] Error:", payload);

    return new Response(JSON.stringify(payload, null, 2), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}


