// Next.js App Router (app/api/univer_city/leave_insert/route.js)
import { NextResponse } from "next/server";

/** "YYYY-1|2" → {year: 2026, sem: 1} */
function parseTerm(term) {
  if (!term || !/^\d{4}-(1|2)$/.test(term)) return null;
  const [y, s] = term.split("-");
  return { year: Number(y), sem: Number(s) };
}

// (선택) KST 기준 "YYYY-MM-DD HH:MM:SS" 만들고 싶을 때 사용
function nowKST() {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = kst.getUTCFullYear();
  const mm = pad(kst.getUTCMonth() + 1);
  const dd = pad(kst.getUTCDate());
  const HH = pad(kst.getUTCHours());
  const MM = pad(kst.getUTCMinutes());
  const SS = pad(kst.getUTCSeconds());
  return `${yyyy}-${mm}-${dd} ${HH}:${MM}:${SS}`;
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));

    const studentId  = String(body.studentId ?? body.student_id ?? "").trim();
    const reason     = String(body.reason ?? body.leaveReason ?? body.reason_text ?? "").trim();
    const leaveType  = String(body.leaveType ?? "").trim();     // "일반휴학" | "군휴학" | "질병휴학" | "기타"
    const startTerm  = String(body.startTerm ?? "").trim();     // "YYYY-1|2"
    const term       = parseTerm(startTerm);

    // 기본 검증
    if (!studentId)  return NextResponse.json({ ok:false, reason:"MISSING_STUDENT_ID" }, { status:400 });
    if (!reason)     return NextResponse.json({ ok:false, reason:"MISSING_REASON" }, { status:400 });
    if (!leaveType)  return NextResponse.json({ ok:false, reason:"MISSING_LEAVE_TYPE" }, { status:400 });
    if (!term)       return NextResponse.json({ ok:false, reason:"INVALID_START_TERM" }, { status:400 });

    // CK_LOA_TYPE 통과값만 허용
    const allowedTypes = new Set(["일반휴학","군휴학","질병휴학","기타"]);
    if (!allowedTypes.has(leaveType)) {
      return NextResponse.json({ ok:false, reason:"INVALID_LEAVE_TYPE" }, { status:400 });
    }

    // 학생 존재 확인
    const selectURL = new URL("http://localhost:3000/api/univer_city/select_where_route");
    selectURL.searchParams.set("table", "student");
    selectURL.searchParams.set("select", JSON.stringify(["student_id"]));
    selectURL.searchParams.set("where", `student_id = ${Number(studentId)}`);

    const selRes = await fetch(selectURL.toString(), { cache: "no-store" });
    const selJson = await selRes.json().catch(() => ({}));
    const rows = Array.isArray(selJson?.rows) ? selJson.rows : [];
    if (!selRes.ok) {
      return NextResponse.json({ ok:false, reason:"STUDENT_LOOKUP_FAILED", detail: selJson }, { status:500 });
    }
    if (rows.length === 0) {
      return NextResponse.json({ ok:false, reason:"STUDENT_NOT_FOUND", detail: { studentId } }, { status:404 });
    }

    // INSERT 준비
    // applied_at은 DEFAULT CURRENT_TIMESTAMP이므로 생략해도 "현재 시각" 자동 저장.
    const cols = ["student_id","reason","leave_year","leave_semester","leave_type"];
    const values = [[
      Number(studentId),
      reason,
      term.year,
      term.sem,
      leaveType
    ]];

    // (선택) applied_at을 명시적으로 넣고 싶다면 아래 2줄 주석 해제
    // cols.unshift("applied_at");
    // values[0].unshift(nowKST());

    const insertURL = new URL("http://localhost:3000/api/univer_city/insert_route");
    insertURL.searchParams.set("table", "Leave_of_Absence");
    insertURL.searchParams.set("cols", JSON.stringify(cols));
    insertURL.searchParams.set("values", JSON.stringify(values));

    const insRes  = await fetch(insertURL.toString(), { cache: "no-store" });
    const insJson = await insRes.json().catch(() => ({}));
    if (!insRes.ok || insJson?.ok === false) {
      return NextResponse.json(
        { ok:false, reason:"LEAVE_INSERT_FAILED", detail: insJson, payload:{ cols, values } },
        { status:500 }
      );
    }

    return NextResponse.json({
      ok: true,
      action: "LEAVE_INSERTED",
      studentId,
      leave_year: term.year,
      leave_semester: term.sem,
      leave_type: leaveType,
      insert_result: insJson
    });
  } catch (err) {
    console.error("[leave_insert] unexpected error:", err);
    return NextResponse.json(
      { ok:false, reason:"UNEXPECTED_ERROR", message: String(err?.message || err) },
      { status:500 }
    );
  }
}
