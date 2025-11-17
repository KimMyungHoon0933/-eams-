// src/app/api/debug/sid/route.js
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session"; // 1번 파일의 검증을 그대로 사용

export const dynamic = "force-dynamic";

// 안전한 쿠키 파서
function parseCookieHeader(cookieHeader = "") {
  const out = {};
  cookieHeader.split(";").forEach((pair) => {
    const idx = pair.indexOf("=");
    if (idx > -1) {
      const k = pair.slice(0, idx).trim();
      const v = pair.slice(idx + 1).trim();
      try {
        out[k] = decodeURIComponent(v);
      } catch {
        out[k] = v;
      }
    }
  });
  return out;
}

export async function GET(req) {
  try {
    // 헤더에서 직접 쿠키 파싱 (앱 라우터 cookies() 이슈 회피용)
    const cookieHeader = req.headers.get("cookie") || "";
    const jar = parseCookieHeader(cookieHeader);
    const sid = jar.sid ?? null;

    if (!sid) {
      return NextResponse.json({
        ok: true,
        hasSid: false,
        hasSession: false,
        sid: null,
        reason: "NO_COOKIE",
      });
    }

    // 1번 파일의 규칙에 따라 세션 유효성 검증
    // - sid = "<session_id>.<token>"
    // - DB에서 token_hash/만료/상태 확인 후 { user_id, exp } 반환
    const sess = await getSession(sid);

    if (!sess) {
      return NextResponse.json({
        ok: true,
        hasSid: true,
        hasSession: false,
        sid,
        reason: "INVALID_OR_EXPIRED",
      });
    }

    return NextResponse.json({
      ok: true,
      hasSid: true,
      hasSession: true,
      sid,
      session: { user_id: sess.user_id, exp: sess.exp }, // UNIX seconds
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
