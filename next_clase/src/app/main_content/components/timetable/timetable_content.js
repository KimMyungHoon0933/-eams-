"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * 시간표 컴포넌트 (Next.js / React, JS)
 * - 현재 연도 & 학기 기준 필터링
 * - 요일별 정렬(시작시간 오름차순) 후 컬럼 형태로 출력
 */
export default function Timetable() {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // ✅ 라우터 URL 상수 (프로젝트에 맞게 필요하면 수정)
  const USER_ROUTE_URL =
    "http://localhost:3000/api/univer_city/user_route";
  const LECTURE_STUDENT_URL =
    "http://localhost:3000/main_content/components/timetable/timetable_route/lecture_student_route";
  const LECTURE_PROFESSOR_URL =
    "http://localhost:3000/main_content/components/timetable/timetable_route/lecture_professor_route";

  // 현재 연도/학기 계산
  const now = useMemo(() => new Date(), []);
  const currentYear = String(now.getFullYear());
  const month = now.getMonth() + 1;
  const currentSemester = month <= 8 ? 1 : 2;

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        // 1️⃣ 먼저 user_route 호출해서 user_type 가져오기
        const userRes = await fetch(USER_ROUTE_URL, { cache: "no-store" });
        const userData = await userRes.json();

        if (!userRes.ok || userData?.ok !== true) {
          throw new Error(userData?.reason || "사용자 정보 조회 실패");
        }

        // ✅ 응답 구조에 맞게 user_type 꺼내기
        const rawUserType  =
          userData.user_type ??
          userData.user?.user_type ??
          userData.user_type_source?.raw?.user_type;

      // 혹시 null/undefined 대비해서 문자열인 경우만 toLowerCase
        const userType =
          typeof rawUserType === "string" ? rawUserType.toLowerCase() : null;

        // 디버깅 해보고 싶으면 잠깐 열어봐도 됨
        // console.log("user_route userType:", rawUserType, "→", userType);

        let lectureUrl;
        if (userType === "professor") {
          lectureUrl = LECTURE_PROFESSOR_URL;
        } else if (userType === "student") {
          lectureUrl = LECTURE_STUDENT_URL;
        } else {
          throw new Error(`지원하지 않는 사용자 타입입니다: ${userType}`);
        }

        // 3️⃣ 결정된 라우터로 강의 목록 조회
        const r = await fetch(lectureUrl, { cache: "no-store" });
        const data = await r.json();
        if (!r.ok || data?.ok !== true) {
          throw new Error(data?.reason || "시간표 조회 실패");
        }

        setLectures(Array.isArray(data.lectures) ? data.lectures : []);
      } catch (e) {
        setErr(e.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []); // 최초 한 번만 실행

  // 현재 연도 & 학기만 남기기
  const filtered = useMemo(() => {
    return (lectures || []).filter((lec) => {
      const y = String(lec.lecture_year ?? "");
      const s = Number(lec.lecture_semester ?? 0);
      return y === currentYear && s === currentSemester;
    });
  }, [lectures, currentYear, currentSemester]);

  // 요일 순서 / 그룹핑
  const DAYS = ["월", "화", "수", "목", "금", "토", "일"];
  const byDay = useMemo(() => {
    const map = new Map(DAYS.map((d) => [d, []]));
    for (const lec of filtered) {
      const d = DAYS.includes(lec.day_of_week) ? lec.day_of_week : "기타";
      if (!map.has(d)) map.set(d, []);
      map.get(d).push(lec);
    }
    // 각 요일 내에서 시작시간 오름차순 정렬
    for (const d of map.keys()) {
      map.get(d).sort(
        (a, b) => timeToMinutes(a.start_hours) - timeToMinutes(b.start_hours),
      );
    }
    return map;
  }, [filtered]);

  if (loading) return <div style={{ padding: 12 }}>시간표 불러오는 중…</div>;
  if (err)
    return (
      <div style={{ padding: 12, color: "crimson" }}>에러: {err}</div>
    );

  const empty = [...byDay.values()].every((arr) => arr.length === 0);

  return (
    <div style={{ padding: 16 }}>
      <header style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontWeight: 700 }}>
          {currentYear}년 · {currentSemester}학기 시간표
        </h2>
        <p style={{ margin: "6px 0 0 0", color: "#666" }}>
          (월~일, 시작시간 순)
        </p>
      </header>

      {empty ? (
        <div
          style={{
            padding: 12,
            background: "#fafafa",
            border: "1px solid #eee",
            borderRadius: 8,
          }}
        >
          이번 학기에 해당하는 수강 강의가 없습니다.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 12,
          }}
        >
          {DAYS.map((day) => (
            <DayColumn key={day} day={day} items={byDay.get(day) || []} />
          ))}
        </div>
      )}
    </div>
  );
}

/** 요일 컬럼 */
function DayColumn({ day, items }) {
  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: 12,
        overflow: "hidden",
        background: "#fff",
      }}
    >
      <div
        style={{
          padding: "10px 12px",
          fontWeight: 700,
          borderBottom: "1px solid #eee",
          background: "#f8f9fa",
        }}
      >
        {day}
      </div>

      <div
        style={{
          padding: 10,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {items.length === 0 ? (
          <div style={{ color: "#aaa", fontSize: 13 }}>수업 없음</div>
        ) : (
          items.map((lec) => <LectureCard key={lec.lecture_id} lec={lec} />)
        )}
      </div>
    </div>
  );
}

/** 강의 카드 */
function LectureCard({ lec }) {
  const { lecture_name, start_hours, end_hours, room } = lec;
  return (
    <div
      style={{
        border: "1px solid #e6e6e6",
        borderRadius: 10,
        padding: "8px 10px",
        background: "#fcfcff",
      }}
      title={`${lecture_name || ""} ${fmtTime(start_hours)}~${fmtTime(
        end_hours,
      )} (${room || "-"})`}
    >
      <div style={{ fontWeight: 600, marginBottom: 4 }}>
        {lecture_name || "무제"}
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.35 }}>
        <div>
          시간: {fmtTime(start_hours)} ~ {fmtTime(end_hours)}
        </div>
        <div>강의실: {room || "-"}</div>
      </div>
    </div>
  );
}

/* -------------------- 유틸 -------------------- */
function timeToMinutes(hms) {
  // "HH:MM:SS" → 정수 분
  if (!hms || typeof hms !== "string") return 0;
  const [h = "0", m = "0", s = "0"] = hms.split(":");
  return Number(h) * 60 + Number(m) + Math.floor(Number(s) / 60);
}

function fmtTime(hms) {
  // "HH:MM:SS" → "HH:MM"
  if (!hms || typeof hms !== "string") return "-";
  const [h = "00", m = "00"] = hms.split(":");
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
}
