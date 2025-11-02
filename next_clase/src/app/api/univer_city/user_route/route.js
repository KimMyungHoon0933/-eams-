// app/api/debug/echo_session/route.js
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getSession } from "@/lib/session"; // (기존 그대로)

// --- 쿠키 읽기 (기존 그대로 유지)
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
    // 1) sid 쿠키 읽기 (기존 그대로)
    const cookieHeader = req.headers.get("cookie") || "";
    const sid = readCookie(cookieHeader, "sid");
    if (!sid) {
      return NextResponse.json(
        { ok: false, reason: "NO_SID_COOKIE" },
        { status: 401 }
      );
    }

    // 2) 세션 검증 및 user_id 획득 (기존 그대로)
    const sess = await getSession(sid); // { user_id, exp } | null
    if (!sess || !Number.isInteger(sess.user_id)) {
      return NextResponse.json(
        { ok: false, reason: "INVALID_OR_EXPIRED_SESSION", sid },
        { status: 401 }
      );
    }
    const userId = sess.user_id;

    // 3) 내부 조회 라우터 호출 준비 (기존 그대로)
    const origin = req.nextUrl?.origin || "http://localhost:3000";
    const userUrl = new URL("/api/univer_city/select_where_route", origin);

    userUrl.searchParams.set("table", "user");
    userUrl.searchParams.set(
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
    userUrl.searchParams.set("where", `user_id = ${userId}`);

    // 4) 사용자 정보 조회 (기존 그대로)
    const userRes = await fetch(userUrl.toString(), { cache: "no-store" });
    const userData = await userRes.json();

    // ---------- ⬇ 추가: user_type 조회 (2번 라우트 호출) ----------
    let userType = null;
    let userTypeSource = { ok: false, status: null, foundIn: null, raw: null };

    try {
      const typeUrl = new URL("http://localhost:3000/api/univer_city/user_type", origin);
      typeUrl.searchParams.set("user_id", String(userId));

      const typeRes = await fetch(typeUrl.toString(), { cache: "no-store" });
      const typeData = await typeRes.json().catch(() => ({}));

      userTypeSource.status = typeRes.status;
      userTypeSource.raw = typeData;

      if (typeRes.ok && typeData?.ok === true) {
        userType = typeData.user_type ?? null;           // "student"|"professor"|"employee"|"teaching_assistant"|"user"
        userTypeSource.ok = true;
        userTypeSource.foundIn = typeData.foundIn ?? null;
      }
    } catch {
      // 타입 조회 실패는 치명적 아님 — 조용히 무시
    }
    // ---------- ⬆ 추가 끝 ---------------------------------------

    // 5) 결과 전달 (기존 응답에 user_type만 추가)
    return NextResponse.json(
      {
        ok: userRes.ok,
        from: "/api/univer_city/select_where_route",
        query: { table: "user", where: `user_id = ${userId}` },
        session: { user_id: userId, exp: sess.exp },
        result: userData,
        // ⬇ 추가된 필드
        user_type: userType,
        user_type_source: userTypeSource,
      },
      { status: userRes.status }
    );
  } catch (e) {
    return NextResponse.json(
      { ok: false, reason: "INTERNAL_ERROR", detail: String(e) },
      { status: 500 }
    );
  }
}
