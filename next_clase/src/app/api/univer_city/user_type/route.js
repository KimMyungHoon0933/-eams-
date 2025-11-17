// app/api/user_type/route.js
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

/** /api/univer_city/select_where_route 호출 유틸 */
async function callSelectWhere(origin, { table, select, where }) {
  const url = new URL("/api/univer_city/select_where_route", origin);
  if (table)  url.searchParams.set("table", table);
  if (select) url.searchParams.set("select", JSON.stringify(select));
  if (where)  url.searchParams.set("where", where);

  const res = await fetch(url.toString(), { cache: "no-store" });
  let data = null;
  try { data = await res.json(); } catch { data = null; }
  return { ok: res.ok, status: res.status, data };
}

/** 다양한 응답에서 첫 레코드만 안전 추출 */
function extractFirstRow(payload) {
  if (!payload || typeof payload !== "object") return null;
  const candidates = [
    payload?.rows,
    payload?.result?.rows,
    payload?.result,
    payload?.data,
  ].filter(Array.isArray);
  for (const arr of candidates) {
    if (arr.length > 0 && typeof arr[0] === "object") return arr[0];
  }
  // rows 배열이 아닌 단일 객체만 떨어지는 경우
  const metaKeys = new Set(["ok", "sql", "rows", "status", "message"]);
  const keys = Object.keys(payload);
  const onlyMeta = keys.every((k) => metaKeys.has(k));
  if (!onlyMeta && keys.length > 0) return payload;
  return null;
}

/**
 * GET /api/user_type?user_id=1
 * - 응답 예: { ok: true, user_type: "Professor", Professor: { professor_id: 1, lab: "A-501" } }
 */
export async function GET(req) {
  try {
    const origin = req.nextUrl?.origin || "http://localhost:3000";
    const userIdParam = req.nextUrl.searchParams.get("user_id");
    const userId = Number(userIdParam);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { ok: false, reason: "INVALID_USER_ID", user_id: userIdParam },
        { status: 400 }
      );
    }

    // 스키마 테이블명/키 (Professor는 대문자 P)
    const targets = [
      { table: "student",             idField: "student_id",   select: ["student_id", "grade_class", "professor_id", "enrollment_status"] },
      { table: "Professor",           idField: "professor_id", select: ["professor_id", "lab"] },
      { table: "employee",            idField: "employee_id",  select: ["employee_id"] },
      { table: "teaching_assistant",  idField: "assistant_id", select: ["assistant_id", "office"] },
    ];

    for (const t of targets) {
      const where = `${t.idField} = ${userId}`;
      const { ok, data } = await callSelectWhere(origin, {
        table: t.table,
        select: t.select,
        where,
      });
      if (!ok) continue;

      const row = extractFirstRow(data);
      if (row) {
        // ✅ user_type을 테이블명 그대로
        const payload = { ok: true, user_type: t.table };
        payload[t.table] = row; // 예: payload["Professor"] = { ... }
        return NextResponse.json(payload, { status: 200 });
      }
    }

    // 어떤 서브타입도 아니면 'user'
    return NextResponse.json(
      { ok: true, user_type: "user" },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json(
      { ok: false, reason: "INTERNAL_ERROR", detail: String(e) },
      { status: 500 }
    );
  }
}
