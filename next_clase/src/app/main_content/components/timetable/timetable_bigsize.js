// timetable_bigsize.js
"use client";

import React, { useEffect, useMemo, useState } from "react";

// ✅ 라우터 URL 상수들
const USER_ROUTE_URL =
  "http://localhost:3000/api/univer_city/user_route";
const LECTURE_STUDENT_URL =
  "http://localhost:3000/main_content/components/timetable/timetable_route/lecture_student_route";
const LECTURE_PROFESSOR_URL =
  "http://localhost:3000/main_content/components/timetable/timetable_route/lecture_professor_route";

const DAYS = ["월", "화", "수", "목", "금", "토", "일"];

const PERIOD_DEFS = [
  { no: 1, label: "1교시", start: "09:00", end: "09:50" },
  { no: 2, label: "2교시", start: "10:00", end: "10:50" },
  { no: 3, label: "3교시", start: "11:00", end: "11:50" },
  { no: 4, label: "4교시", start: "13:00", end: "13:50" },
  { no: 5, label: "5교시", start: "14:00", end: "14:50" },
  { no: 6, label: "6교시", start: "15:00", end: "15:50" },
  { no: 7, label: "7교시", start: "16:00", end: "16:50" },
  { no: 8, label: "8교시", start: "17:00", end: "17:50" },
  { no: 9, label: "9교시", start: "18:00", end: "18:50" },
  { no: 10, label: "10교시", start: "19:00", end: "19:50" },
];

function timeToMinutes(hms) {
  if (!hms || typeof hms !== "string") return 0;
  const [h = "0", m = "0", s = "0"] = hms.split(":");
  return Number(h) * 60 + Number(m) + Math.floor(Number(s) / 60);
}

// 끝나는 시간은 00/50분 단위로 보정해서 사용 (레이아웃용)
function timeToMinutesEndForLayout(hms) {
  const base = timeToMinutes(hms);
  if (!base) return 0;
  const minuteInHour = base % 60;

  if (minuteInHour === 0 || minuteInHour === 50) return base;
  if (minuteInHour < 50) {
    return base + (50 - minuteInHour);
  }
  return base;
}

function fmtTime(hms) {
  if (!hms || typeof hms !== "string") return "-";
  const [h = "00", m = "00"] = hms.split(":");
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
}

function getPeriodsForLecture(start_hours, end_hours) {
  const s = timeToMinutes(start_hours);
  const e = timeToMinutesEndForLayout(end_hours);
  if (!s || !e) return [];

  const result = [];
  for (const p of PERIOD_DEFS) {
    const ps = timeToMinutes(p.start);
    const pe = timeToMinutes(p.end);
    if (e > ps && s < pe) {
      result.push(p.no);
    }
  }
  return result;
}

function buildDayMatrix(lectures) {
  const matrix = {};
  DAYS.forEach((d) => {
    matrix[d] = new Array(PERIOD_DEFS.length).fill(null);
  });

  lectures.forEach((lec) => {
    const day = lec.day_of_week;
    if (!DAYS.includes(day)) return;

    const periods = getPeriodsForLecture(lec.start_hours, lec.end_hours);
    if (periods.length === 0) return;

    const sorted = [...periods].sort((a, b) => a - b);
    const firstNo = sorted[0];
    const span = sorted.length;
    const firstIndex = firstNo - 1;

    matrix[day][firstIndex] = {
      type: "lecture",
      lecture: lec,
      rowSpan: span,
    };

    for (let i = 1; i < span; i++) {
      const idx = firstIndex + i;
      if (idx < PERIOD_DEFS.length) {
        matrix[day][idx] = { type: "skip" };
      }
    }
  });

  return matrix;
}

export default function TimetableBigSize() {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const now = useMemo(() => new Date(), []);
  const currentYear = String(now.getFullYear());
  const month = now.getMonth() + 1;
  const currentSemester = month <= 8 ? 1 : 2;

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        // 1️⃣ user_route 호출해서 user_type 가져오기
        const userRes = await fetch(USER_ROUTE_URL, { cache: "no-store" });
        const userData = await userRes.json();

        if (!userRes.ok || userData?.ok !== true) {
          throw new Error(userData?.reason || "사용자 정보 조회 실패");
        }

        // user_type 추출 (대소문자 보정)
        const rawUserType =
          userData.user_type ??
          userData.user?.user_type ??
          userData.user_type_source?.raw?.user_type;

        const userType =
          typeof rawUserType === "string" ? rawUserType.toLowerCase() : null;

        let lectureUrl;
        if (userType === "professor") {
          lectureUrl = LECTURE_PROFESSOR_URL;
        } else if (userType === "student") {
          lectureUrl = LECTURE_STUDENT_URL;
        } else {
          throw new Error(`지원하지 않는 사용자 타입입니다: ${userType}`);
        }

        // 2️⃣ 결정된 라우터로 강의 목록 조회
        const res = await fetch(lectureUrl, { cache: "no-store" });
        const data = await res.json();

        if (!res.ok || data?.ok !== true) {
          throw new Error(data?.reason || "시간표 조회 실패");
        }

        setLectures(Array.isArray(data.lectures) ? data.lectures : []);
      } catch (e) {
        console.error(e);
        setErr(e.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredLectures = useMemo(() => {
    return (lectures || []).filter((lec) => {
      const y = String(lec.lecture_year ?? "");
      const s = Number(lec.lecture_semester ?? 0);
      return y === currentYear && s === currentSemester;
    });
  }, [lectures, currentYear, currentSemester]);

  const dayMatrix = useMemo(
    () => buildDayMatrix(filteredLectures),
    [filteredLectures]
  );

  if (loading)
    return <div style={{ padding: 12 }}>시간표를 불러오는 중입니다…</div>;
  if (err)
    return <div style={{ color: "red", padding: 12 }}>에러: {err}</div>;

  const empty = filteredLectures.length === 0;

  return (
    <section
      className="timetable-big-wrapper"
      style={{ width: "100%", marginTop: "1rem" }}
    >
      <header style={{ marginBottom: "0.5rem" }}>
        <h2 style={{ margin: 0, fontWeight: 700 }}>
          {currentYear}년 · {currentSemester}학기 시간표 (큰 표)
        </h2>
        <p style={{ margin: "4px 0 0 0", color: "#666" }}>
          교시 × 요일 형태의 전체 시간표
        </p>
      </header>

      {empty ? (
        <div
          style={{
            padding: 12,
            background: "#fafafa",
            borderRadius: 8,
            border: "1px solid #eee",
          }}
        >
          이번 학기에 해당하는 수강 강의가 없습니다.
        </div>
      ) : (
        <table
          className="timetable-big-table"
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  width: "80px",
                  background: "#f5f5f5",
                }}
              >
                교시
              </th>
              {DAYS.map((day) => (
                <th
                  key={day}
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    background: "#f5f5f5",
                  }}
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERIOD_DEFS.map((p, rowIndex) => (
              <tr key={p.no}>
                {/* 교시 정보 칸 */}
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    textAlign: "center",
                    background: "#fafafa",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  {p.label}
                  <br />
                  <span style={{ fontSize: 11, color: "#777" }}>
                    {p.start}~{p.end}
                  </span>
                </th>

                {/* 요일별 칸 */}
                {DAYS.map((day) => {
                  const cell = dayMatrix[day]?.[rowIndex];

                  if (cell && cell.type === "skip") {
                    return null;
                  }

                  if (cell && cell.type === "lecture") {
                    const lec = cell.lecture;
                    const textName = lec.lecture_name || "무제";
                    const textTime = `${fmtTime(
                      lec.start_hours
                    )}~${fmtTime(lec.end_hours)}`;
                    const textRoom = lec.room || "-";

                    return (
                      <td
                        key={day}
                        rowSpan={cell.rowSpan}
                        style={{
                          border: "2px solid #4a90e2",
                          padding: "4px 6px",
                          verticalAlign: "middle",
                          background: "#e8f3ff",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                            fontSize: 13,
                          }}
                        >
                          <strong>{textName}</strong>
                          <span style={{ fontSize: 12, marginTop: 4 }}>
                            {textTime}
                            <br />
                            {textRoom}
                          </span>
                        </div>
                      </td>
                    );
                  }

                  // 빈 칸
                  return (
                    <td
                      key={day}
                      style={{
                        border: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "left",
                        fontSize: 13,
                        verticalAlign: "top",
                        background: "#fff",
                      }}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
  