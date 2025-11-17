// app/login_form/login_check/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/db";                 // (유지)
import { createSession } from "@/lib/session"; // ★ 2번 파일 API 사용

export const dynamic = "force-dynamic";

// 공통: 로그인 페이지로 돌려보내기
function redirectToLogin(req, code = "invalid") {
  const url = new URL(`/login_form?e=${code}`, req.url);
  return NextResponse.redirect(url);
}

// 공통: 사용자 검증 + 세션 생성 + 메인으로 리다이렉트
async function handleAuthAndRedirect(req, idRaw, pw) {
  // ── (유지) 1차 입력 검증 ─────────────────────────────────────
  const id = (idRaw ?? "").toString().trim();
  const pwTrim = (pw ?? "").toString().trim();

  if (!/^\d+$/.test(id) || !pwTrim) {
    return redirectToLogin(req, "invalid");
  }
  const userId = Number(id);

  // ── (유지) DB 조회(평문 pw 기준) ────────────────────────────
  const [rows] = await db.query(
    `SELECT user_id, user_name
       FROM user
      WHERE user_id = ? AND user_password = ?
      LIMIT 1`,
    [userId, pwTrim]
  );

  if (!rows || rows.length === 0) {
    return redirectToLogin(req, "mismatch");
  }

  const user = rows[0];

  // ── (교체) 세션 생성: 2번 파일의 createSession 사용 ─────────
  // createSession은 { sid, maxAgeSec }를 반환함
  const { sid, maxAgeSec } = await createSession(
    { user_id: Number(user.user_id) }, // 최소 user_id 정수 필수
    { maxAgeSec: 60 * 60 * 2 }         // 2시간(원하면 상수/환경변수로 빼도 됨)
  );

  if (!sid || typeof sid !== "string") {
    return redirectToLogin(req, "session_fail");
  }

  // ── (교체) sid 쿠키 저장 ────────────────────────────────────
  const res = NextResponse.redirect(new URL("/main_content", req.url));
  res.cookies.set("sid", sid, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSec, // createSession과 만료 일치
  });
  return res;
}

// ✅ POST 전용 (폼 전송)
export async function POST(req) {
  try {
    // form-urlencoded / multipart / json 모두 지원
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await req.json();
      return await handleAuthAndRedirect(req, body.id, body.pw);
    } else {
      const form = await req.formData();
      const id = form.get("id");
      const pw = form.get("pw");
      return await handleAuthAndRedirect(req, id, pw);
    }
  } catch (err) {
    console.error("[login_check POST] error:", err);
    return redirectToLogin(req, "server");
  }
}

