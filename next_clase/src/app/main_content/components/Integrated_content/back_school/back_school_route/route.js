// app/api/univer_city/back_school_route/route.js
import { NextResponse } from "next/server";

// 환경에 따라 베이스 URL 조절 (없으면 로컬 기준)
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// 공통 복학 처리 로직 (이제 DB 직접접속 X, 다른 라우터 호출 방식)
async function processReturn(studentId, returnReason) {
  if (!studentId) {
    return NextResponse.json(
      { ok: false, message: "studentId가 없습니다." },
      { status: 400 }
    );
  }

  const sid = Number(studentId);
  if (!Number.isInteger(sid) || sid <= 0) {
    return NextResponse.json(
      { ok: false, message: "studentId 형식이 잘못되었습니다." },
      { status: 400 }
    );
  }

  const reason =
    (returnReason && String(returnReason).trim()) || "복학 신청";

  // 1) 휴학 테이블에서 해당 학생 휴학 정보 조회 (최신 1건)
  //    → /api/univer_city/select_where_route 사용
  const selectUrl = new URL(
    "/api/univer_city/select_where_route",
    BASE_URL
  );
  selectUrl.searchParams.set("table", "Leave_of_Absence");
  selectUrl.searchParams.set(
    "select",
    JSON.stringify(["leave_id", "is_on_leave"])
  );
  // ORDER BY / LIMIT 을 where 뒤에 붙여서 넘기는 패턴 그대로 사용
  selectUrl.searchParams.set(
    "where",
    `student_id = ${sid} ORDER BY applied_at DESC LIMIT 1`
  );

  let leaveRows;
  try {
    const res = await fetch(selectUrl.toString(), { cache: "no-store" });
    const json = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        {
          ok: false,
          message: "휴학 정보를 조회하는 중 오류가 발생했습니다.",
          detail: json,
        },
        { status: 500 }
      );
    }

    // select_where_route 가 배열을 그대로 돌려준다고 가정
    leaveRows = Array.isArray(json) ? json : json.rows || [];
  } catch (err) {
    console.error("back_school_route select_where_route error:", err);
    return NextResponse.json(
      { ok: false, message: "휴학 정보를 조회하지 못했습니다.", error: String(err) },
      { status: 500 }
    );
  }

  // 휴학 기록이 아예 없거나, is_on_leave = 'F' 면 → 휴학 정보 없음
  if (!leaveRows.length || leaveRows[0].is_on_leave === "F") {
    return NextResponse.json(
      {
        ok: false,
        message: "휴학 정보가 없습니다.",
      },
      { status: 400 }
    );
  }

  const leaveId = leaveRows[0].leave_id;

  // 2) back_school 테이블에 복학 정보 INSERT
  //    → /api/univer_city/insert_route 사용
  const insertUrl = new URL(
    "/api/univer_city/insert_route",
    BASE_URL
  );

  const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'

  const cols = [
    "leave_id",
    "manager",
    "return_reason",
    "return_date",
    "is_returned",
  ];
  const values = [
    [leaveId, null, reason, today, "f"], // manager = NULL, is_returned = 'f'
  ];

  insertUrl.searchParams.set("table", "back_school");
  insertUrl.searchParams.set("cols", JSON.stringify(cols));
  insertUrl.searchParams.set("values", JSON.stringify(values));

  let insertBody;
  try {
    const res = await fetch(insertUrl.toString(), { cache: "no-store" });
    insertBody = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        {
          ok: false,
          message: "복학 정보를 저장하는 중 오류가 발생했습니다.",
          detail: insertBody,
        },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("back_school_route insert_route error:", err);
    return NextResponse.json(
      { ok: false, message: "복학 정보를 저장하지 못했습니다.", error: String(err) },
      { status: 500 }
    );
  }

  const returnId = insertBody?.insertId ?? null;

  return NextResponse.json(
    {
      ok: true,
      message: "복학 신청이 접수되었습니다.",
      leave_id: leaveId,
      return_id: returnId,
      debug: insertBody, // 필요 없으면 나중에 제거 가능
    },
    { status: 200 }
  );
}

// POST: 복학 폼에서 JSON으로 보내는 경우
// body: { studentId: "...", reason: "복학 사유 ..." }
export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const { studentId, reason } = body;

  return processReturn(studentId, reason);
}

// GET: 쿼리스트링으로 호출하고 싶을 때
// /api/univer_city/back_school_route?studentId=20250001&reason=복학신청
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  const reason = searchParams.get("reason");

  return processReturn(studentId, reason);
}
