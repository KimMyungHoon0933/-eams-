// app/api/univer_city/lecture_professer/route.js
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

/** cookie reader (student_timetable에서 쓰던 거 그대로) */
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
    // 1) 세션 확인 → user_id 확보
    const cookieHeader = req.headers.get("cookie") || "";
    const sid = readCookie(cookieHeader, "sid");
    if (!sid) {
      return NextResponse.json(
        { ok: false, reason: "NO_SID_COOKIE" },
        { status: 401 }
      );
    }

    const sess = await getSession(sid); // { user_id, exp } | null
    if (!sess || !Number.isInteger(sess.user_id)) {
      return NextResponse.json(
        { ok: false, reason: "INVALID_OR_EXPIRED_SESSION", sid },
        { status: 401 }
      );
    }
    const userId = sess.user_id;

    const origin = req.nextUrl?.origin || "http://localhost:3000";

    // 2) 사용자 타입 조회 (교수인지 확인)
    const typeUrl = new URL("/api/univer_city/user_type", origin);
    typeUrl.searchParams.set("user_id", String(userId));
    const typeRes = await fetch(typeUrl.toString(), { cache: "no-store" });
    const typeData = await typeRes.json().catch(() => ({}));

    if (!typeRes.ok || typeData?.ok !== true) {
      return NextResponse.json(
        { ok: false, reason: "USER_TYPE_LOOKUP_FAILED", detail: typeData },
        { status: 500 }
      );
    }

    // ✅ 대소문자 섞여 와도 안전하게 처리
    const rawUserType =
      typeData.user_type ??
      typeData.user?.user_type ??
      typeData.user_type_source?.raw?.user_type ??
      null;

    const userType =
      typeof rawUserType === "string" ? rawUserType.toLowerCase() : null;

    if (userType !== "professor") {
      return NextResponse.json(
        {
          ok: false,
          reason: "NOT_PROFESSOR",
          user_type: rawUserType, // 원본 같이 내려주기 (디버깅용)
        },
        { status: 403 }
      );
    }

    // 3) Lecture 테이블에서 해당 교수의 강의 목록 조회
    //    컬럼/테이블명은 DDL 기준으로 가정: Lecture.professor_id = userId
    const lecUrl = new URL("/api/univer_city/select_where_route", origin);
    lecUrl.searchParams.set("table", "Lecture");
    lecUrl.searchParams.set(
      "select",
      JSON.stringify([
        "lecture_id",
        "lecture_name",
        "lecture_year",
        "lecture_semester",
        "day_of_week",
        "start_hours",
        "end_hours",
        "room",
        "professor_id",
      ])
    );
    lecUrl.searchParams.set("where", `professor_id = ${userId}`);

    const lecRes = await fetch(lecUrl.toString(), { cache: "no-store" });
    const lecData = await lecRes.json();

    if (!lecRes.ok) {
      return NextResponse.json(
        { ok: false, reason: "LECTURE_LOOKUP_FAILED", detail: lecData },
        { status: lecRes.status }
      );
    }

    const lectures = Array.isArray(lecData?.rows) ? lecData.rows : lecData;

    // 4) 최종 응답
    return NextResponse.json({
      ok: true,
      professor_id: userId,
      count: lectures.length,
      lectures, // [{ lecture_id, lecture_name, lecture_year, lecture_semester, ... }, ...]
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, reason: "INTERNAL_ERROR", detail: String(e) },
      { status: 500 }
    );
  }
}
