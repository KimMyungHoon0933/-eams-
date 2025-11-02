// app/login_form/login_check/route.js
import { NextResponse } from "next/server";
import { createSession } from "@/lib/session";

/**
 * (예시) 내부 API를 호출해 사용자 검증
 * - 당신이 이미 만든 select_route를 활용 (id로 1행 조회)
 * - user_password는 VARCHAR로 저장된 평문/테스트값과 단순 비교
 */
async function verifyUserByAPI(req, { id, pw }) {
  // 현재 호스트 기준으로 내부 API 호출
  const url = new URL("/api/univer_city/select_where_route", req.url);
  url.searchParams.set("table", "user");
  url.searchParams.set("select", JSON.stringify(["user_id", "user_password"]));
 
  url.searchParams.set("where", `user_id=${id}`);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();

  const row = Array.isArray(data?.rows) ? data.rows[0] : null;
  if (!row) return null;

  // 테스트 환경: 평문 비교 (실서비스는 해시 비교)
  if (String(row.user_password) !== String(pw)) return null;

  return { user_id: Number(row.user_id) };
}

export async function POST(req) {
  const form = await req.formData();
  const id = form.get("id");
  const pw = form.get("pw");

  // 1) 입력값 체크
  if (!id || !pw) {
    return NextResponse.redirect(new URL("/login_form?e=missing", req.url));
  }

  // 2) DB 검증 (내부 API 사용 예시)
  const user = await verifyUserByAPI(req, { id, pw });
  if (!user?.user_id) {
    return NextResponse.redirect(new URL("/login_form?e=invalid", req.url));
  }

  // 3) 세션 발급 (쿠키는 여기서 따로 설정)
  //    lib/session.js 의 createSession은 Route에서 쓰라고 하셨던 그 함수
  const sid = createSession({ user_id: user.user_id }, { maxAgeSec: 60 * 60 * 2 });

  // 4) 쿠키 설정 + 메인으로 리다이렉트
  const res = NextResponse.redirect(new URL("/main_content", req.url));
  res.cookies.set("sid", sid, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 2, // 세션 만료와 동일 (2시간 예시)
  });
  return res;
}