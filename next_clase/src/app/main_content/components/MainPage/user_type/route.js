// app/api/user_type/route.js
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

/** 기본 테스트용 user_id (환경변수 TEST_USER_ID 우선, 없으면 1) */
const DEFAULT_USER_ID = Number(process.env.TEST_USER_ID ?? 1);

/** 내부 조회 유틸: GET /api/univer_city/select_where_route?table=...&select=[...]&where=... */
async function callSelectWhere(origin, { table, select, where }) {
  const url = new URL("/api/univer_city/select_where_route", origin);
  if (table) url.searchParams.set("table", table);
  if (select) url.searchParams.set("select", JSON.stringify(select));
  if (where) url.searchParams.set("where", where);

  const res = await fetch(url.toString(), { cache: "no-store" });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { ok: res.ok, status: res.status, data };
}

/** 다양한 형태의 결과에서 첫 레코드만 안전 추출 */
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
  const metaLikeKeys = new Set(["ok", "sql", "rows", "status", "message"]);
  const keys = Object.keys(payload);
  const looksLikeOnlyMeta = keys.every((k) => metaLikeKeys.has(k));
  if (!looksLikeOnlyMeta && keys.length > 0) {
    return payload;
  }
  return null;
}

/**
 * GET /api/user_type?user_id=1
 * - user_id 쿼리가 없으면 DEFAULT_USER_ID 사용(테스트 편의).
 * - user_id 쿼리가 있는데 정수가 아니거나 0 이하이면 400.
 */
export async function GET(req) {
  try {
    const origin = req.nextUrl?.origin || "http://localhost:3000";

    const userIdParam = req.nextUrl.searchParams.get("user_id");
    let usedDefault = false;
    let userId;

    if (userIdParam === null || userIdParam === "") {
      userId = DEFAULT_USER_ID;
      usedDefault = true;
    } else {
      const n = Number(userIdParam);
      if (!Number.isInteger(n) || n <= 0) {
        return NextResponse.json(
          { ok: false, reason: "INVALID_USER_ID", user_id: userIdParam },
          { status: 400 }
        );
      }
      userId = n;
    }

    // DDL에 맞춘 정확한 테이블/키 이름(Professor 대문자 주의)
    const targets = [
      {
        table: "student",
        idField: "student_id",
        userType: "student",
        select: ["student_id", "grade_class", "professor_id", "enrollment_status"],
      },
      {
        table: "Professor",
        idField: "professor_id",
        userType: "professor",
        select: ["professor_id", "lab"],
      },
      {
        table: "employee",
        idField: "employee_id",
        userType: "employee",
        select: ["employee_id"],
      },
      {
        table: "teaching_assistant",
        idField: "assistant_id",
        userType: "teaching_assistant",
        select: ["assistant_id", "office"],
      },
    ];

    for (const t of targets) {
      const where = `${t.idField} = ${userId}`;
      const { ok, status, data } = await callSelectWhere(origin, {
        table: t.table,
        select: t.select,
        where,
      });

      if (!ok) {
        if (status >= 500) {
          return NextResponse.json(
            { ok: false, reason: "SUBQUERY_FAILED", table: t.table, status, data },
            { status: 502 }
          );
        }
        continue; // 4xx/빈결과 등은 다음 후보로 진행
      }

      const row = extractFirstRow(data);
      if (row) {
        return NextResponse.json(
          {
            ok: true,
            session: { user_id: userId },
            user_type: t.userType,
            foundIn: t.table,
            used_default: usedDefault,
            detail: data,
            record: row,
          },
          { status: 200 }
        );
      }
    }

    // 어느 서브타입에서도 못 찾으면 슈퍼타입만 존재
    return NextResponse.json(
      {
        ok: true,
        session: { user_id: userId },
        user_type: "user",
        foundIn: null,
        used_default: usedDefault,
      },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json(
      { ok: false, reason: "INTERNAL_ERROR", detail: String(e) },
      { status: 500 }
    );
  }
}
