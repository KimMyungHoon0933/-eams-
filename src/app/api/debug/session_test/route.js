// app/api/session/check/route.js
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

function readCookie(cookieHeader = "", name) {
  const parts = cookieHeader.split(";").map((v) => v.trim());
  for (const part of parts) {
    if (part.startsWith(name + "=")) {
      return decodeURIComponent(part.substring(name.length + 1));
    }
  }
  return null;
}

const ORIGIN =
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.BASE_URL ||
  "http://localhost:3000";

async function fetchUserName(user_id) {
  if (!Number.isInteger(user_id)) return null;

  const selectCols = encodeURIComponent(JSON.stringify(["user_id", "user_name"]));
  const where = encodeURIComponent(`user_id = ${user_id}`);
  const url = `${ORIGIN}/api/univer_city/select_where_route?table=user&select=${selectCols}&where=${where}`;

  const res = await fetch(url, { cache: "no-store" });
  let data;
  try {
    data = await res.json();
  } catch {
    return null;
  }

  const row =
    (Array.isArray(data?.rows) && data.rows[0]) ||
    data?.result?.rows?.[0] ||
    data?.result?.[0] ||
    null;

  return row?.user_name ?? null;
}

// ⚠️ 함수 이름 유지 (GET)
export async function GET(req) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const sid = readCookie(cookieHeader, "sid");

    if (!sid) {
      return NextResponse.json(
        { ok: false, hasSession: false, reason: "NO_COOKIE" },
        { status: 401 }
      );
    }

    const sess = await getSession(sid);
    if (!sess) {
      // 무효/만료라도 쿠키는 건드리지 않음(요청사항)
      return NextResponse.json(
        { ok: false, hasSession: false, reason: "INVALID_OR_EXPIRED" },
        { status: 401 }
      );
    }

    let user_name = null;
    try {
      user_name = await fetchUserName(sess.user_id);
    } catch {
      // 무시: user_name 조회 실패해도 세션 정보만 반환
    }

    return NextResponse.json({
      ok: true,
      hasSession: true,
      user: user_name
        ? { user_id: sess.user_id, user_name }
        : { user_id: sess.user_id },
      exp: sess.exp,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        hasSession: false,
        reason: "INTERNAL_ERROR",
        detail: process.env.NODE_ENV !== "production" ? String(err) : undefined,
      },
      { status: 500 }
    );
  }
}

// ⚠️ 함수 이름 유지 (OPTIONS)
export function OPTIONS() {
  return NextResponse.json({}, { status: 204 });
}
