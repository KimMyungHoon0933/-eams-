// app/api/debug/echo_session/route.js  ← 1번 파일 (수정본)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getSession } from "@/lib/session"; // 2번 파일 API 사용

// --- 쿠키 읽기 (그대로 둠)
function readCookie(cookieHeader = "", name) {
  const parts = cookieHeader.split(";").map((v) => v.trim());
  for (const part of parts) {
    if (part.startsWith(name + "=")) {
      const raw = part.slice(name.length + 1);
      try {
        return decodeURIComponent(raw);
      } catch {
        return raw;
      }
    }
  }
  return null;
}

export async function GET(req) {
  try {
    // 1) sid 쿠키 읽기
    const cookieHeader = req.headers.get("cookie") || "";
    const sid = readCookie(cookieHeader, "sid");
    if (!sid) {
      return NextResponse.json(
        { ok: false, reason: "NO_SID_COOKIE" },
        { status: 401 }
      );
    }

    // 2) 2번 파일의 getSession으로 세션 검증 및 user_id 획득
    const sess = await getSession(sid); // { user_id, exp } | null
    if (!sess || !Number.isInteger(sess.user_id)) {
      return NextResponse.json(
        { ok: false, reason: "INVALID_OR_EXPIRED_SESSION", sid },
        { status: 401 }
      );
    }
    const userId = sess.user_id;

    // 3) 내부 조회 라우터 호출 준비 (user 테이블에서 user_id로 조회)
    const origin = req.nextUrl?.origin || "http://localhost:3000";
    const url = new URL("/api/univer_city/select_where_route", origin);

    url.searchParams.set("table", "user");
    url.searchParams.set(
      "select",
      JSON.stringify([
        "user_id",
        "user_name",
        "birth_date",
        "gender",
        "phone",
        "address",
        "account_number",
        "department_id",
        "user_password",
      ])
    );
    url.searchParams.set("where", `user_id = ${userId}`);

    // 4) 내부 API 호출 (캐시 X)
    const res = await fetch(url.toString(), { cache: "no-store" });
    const data = await res.json();

    // 5) 결과 전달
    return NextResponse.json(
      {
        ok: res.ok,
        from: "/api/univer_city/select_where_route",
        query: { table: "user", where: `user_id = ${userId}` },
        session: { user_id: userId, exp: sess.exp },
        result: data,
      },
      { status: res.status }
    );
  } catch (e) {
    return NextResponse.json(
      { ok: false, reason: "INTERNAL_ERROR", detail: String(e) },
      { status: 500 }
    );
  }
}
