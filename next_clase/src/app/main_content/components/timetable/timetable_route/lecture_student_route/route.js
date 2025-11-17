// app/api/univer_city/student_timetable/route.js
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

/** cookie reader (기존 라우터에서 쓰던 형태와 동일) */
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
      return NextResponse.json({ ok: false, reason: "NO_SID_COOKIE" }, { status: 401 });
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

    // 2) 사용자 타입 조회 (student인지 확인)
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

    const userType = typeData.user_type ?? null; // "student" | ...
    if (userType !== "student") {
      return NextResponse.json(
        { ok: false, reason: "NOT_STUDENT", user_type: userType },
        { status: 403 }
      );
    }

    // 3) enrollment에서 해당 학생의 lecture_id 목록 조회
    //    (테이블/컬럼 명은 DDL 기준: enrollment.student_id, enrollment.lecture_id)
    const enrollUrl = new URL("/api/univer_city/select_where_route", origin);
    enrollUrl.searchParams.set("table", "enrollment");
    enrollUrl.searchParams.set("select", JSON.stringify(["lecture_id"]));
    enrollUrl.searchParams.set("where", `student_id = ${userId}`);

    const enrollRes = await fetch(enrollUrl.toString(), { cache: "no-store" });
    const enrollData = await enrollRes.json();

    if (!enrollRes.ok) {
      return NextResponse.json(
        { ok: false, reason: "ENROLLMENT_LOOKUP_FAILED", detail: enrollData },
        { status: enrollRes.status }
      );
    }

    const lectureIdsRaw = Array.isArray(enrollData?.rows) ? enrollData.rows : enrollData;
    const lectureIds = [...new Set((lectureIdsRaw || []).map((r) => Number(r.lecture_id)).filter(Boolean))];

    if (lectureIds.length === 0) {
      // 수강 내역 없음
      return NextResponse.json({
        ok: true,
        student_id: userId,
        lectures: [],
        count: 0,
      });
    }

    // 4) Lecture 테이블에서 개설년도/요일/학기 가져오기
    //    컬럼: lecture_id, lecture_year, day_of_week, lecture_semester
    const listStr = lectureIds.join(","); // IN (...) 용
    const lecUrl = new URL("/api/univer_city/select_where_route", origin);
    lecUrl.searchParams.set("table", "Lecture");
    lecUrl.searchParams.set(
      "select",
       JSON.stringify(["lecture_id", "lecture_name", "lecture_year", "day_of_week", "lecture_semester","start_hours","end_hours","room"])
    );
    lecUrl.searchParams.set("where", `lecture_id IN (${listStr})`);

    const lecRes = await fetch(lecUrl.toString(), { cache: "no-store" });
    const lecData = await lecRes.json();

    if (!lecRes.ok) {
      return NextResponse.json(
        { ok: false, reason: "LECTURE_LOOKUP_FAILED", detail: lecData },
        { status: lecRes.status }
      );
    }

    const lectures = Array.isArray(lecData?.rows) ? lecData.rows : lecData;

    // 5) 최종 응답
    return NextResponse.json({
      ok: true,
      student_id: userId,
      count: lectures.length,
      lectures, // [{ lecture_id, lecture_year, day_of_week, lecture_semester }, ...]
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, reason: "INTERNAL_ERROR", detail: String(e) },
      { status: 500 }
    );
  }
}
