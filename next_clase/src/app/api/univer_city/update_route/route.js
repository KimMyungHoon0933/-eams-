// src/app/api/update/route.js
export const runtime = "nodejs";
import { db } from "@/lib/db";

/**
 * 아주 단순한 UPDATE 엔드포인트
 *
 * - /api/update?table=테이블명&cols=["c1","c2"]&values=["v1","v2"]&where=user_id=1
 *      → JSON 배열이면 플레이스홀더(?) 바인딩 (안전)
 *
 * - /api/update?table=테이블명&values=col1=1,col2='x'&where=user_id=1
 *      → values를 그냥 SET절 원시 문자열로 사용 (위험하지만 유연)
 *
 * ⚠️ insert 라우터와 마찬가지로 table/column에 대한 별도 검증 없음.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const table = searchParams.get("table");
    const colsParam = searchParams.get("cols");     // SET에 사용할 컬럼들
    const valuesParam = searchParams.get("values"); // 해당 값들 또는 SET 원시 문자열
    const whereParam = searchParams.get("where");   // WHERE 절 (원시 문자열)

    if (!table) {
      return Response.json(
        { error: "Missing 'table' query parameter" },
        { status: 400 }
      );
    }
    if (!valuesParam) {
      return Response.json(
        { error: "Missing 'values' query parameter" },
        { status: 400 }
      );
    }
    if (!whereParam) {
      return Response.json(
        { error: "Missing 'where' query parameter" },
        { status: 400 }
      );
    }

    let sql = "";
    let result;

    // 1) valuesParam 이 JSON 배열이면 → 컬럼 배열(cols)과 매칭해서 ? 바인딩
    if (valuesParam.trim().startsWith("[")) {
      // cols도 반드시 필요
      if (!colsParam) {
        return Response.json(
          {
            error:
              "When 'values' is JSON, 'cols' must also be provided as JSON array.",
          },
          { status: 400 }
        );
      }

      // cols 파싱
      let colsArr;
      if (colsParam.trim().startsWith("[")) {
        try {
          const parsedCols = JSON.parse(colsParam);
          if (!Array.isArray(parsedCols) || parsedCols.length === 0) {
            return Response.json(
              { error: "Parsed 'cols' must be a non-empty JSON array." },
              { status: 400 }
            );
          }
          colsArr = parsedCols;
        } catch {
          return Response.json(
            { error: "Failed to parse 'cols' JSON array." },
            { status: 400 }
          );
        }
      } else {
        // JSON이 아니라면 콤마로 나눠서 배열화
        colsArr = colsParam
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean);
        if (colsArr.length === 0) {
          return Response.json(
            { error: "Parsed 'cols' must contain at least one column." },
            { status: 400 }
          );
        }
      }

      // values 파싱
      let valsArr;
      try {
        const parsedVals = JSON.parse(valuesParam);
        if (!Array.isArray(parsedVals)) {
          return Response.json(
            { error: "'values' JSON must be a 1D array for UPDATE." },
            { status: 400 }
          );
        }
        valsArr = parsedVals;
      } catch {
        return Response.json(
          { error: "Failed to parse 'values' JSON array." },
          { status: 400 }
        );
      }

      if (colsArr.length !== valsArr.length) {
        return Response.json(
          {
            error: "Length of 'cols' and 'values' must match for UPDATE.",
          },
          { status: 400 }
        );
      }

      const setClause = colsArr.map((c) => `${c} = ?`).join(", ");
      sql = `UPDATE ${table} SET ${setClause} WHERE ${whereParam}`;

      const [execRes] = await db.execute(sql, valsArr);
      result = execRes;
    } else {
      // 2) valuesParam 이 JSON이 아니면 → 원시 문자열 그대로 SET 절로 사용
      //
      // 예)
      //   /api/update?table=department
      //      &values=department_name='수정학과',capacity=99
      //      &where=department_id=1003
      //
      const rawSet = String(valuesParam);
      sql = `UPDATE ${table} SET ${rawSet} WHERE ${whereParam}`;

      const [qRes] = await db.query(sql);
      result = qRes;
    }

    return Response.json({
      sql,
      affectedRows: result?.affectedRows ?? null,
      changedRows: result?.changedRows ?? null,
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
    console.error("[/api/update] Error:", payload);

    return new Response(JSON.stringify(payload, null, 2), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
