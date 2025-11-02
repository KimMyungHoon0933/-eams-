// app/components/MainContent.js
"use client";

import Messenger from "../messeage_component/Messenger";
import { useEffect, useState } from "react";
import LoginBox from "./MainComponent/profile";
import Announcement from "./MainComponent/Announcement";
import QuickMenu from "./MainComponent/QuickMenu";
import LectureSchedule from "./MainComponent/lecture_schedule";
import Shortcuts from "./MainComponent/Shortcuts";
import News from "./MainComponent/News";
import Calendar from "./MainComponent/Calendar";
import Community from "./MainComponent/Community";

export default function MainContent() {
  const [showMessenger, setShowMessenger] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // ✅ 현재 시간 상태
  const [lastLoginTime, setLastLoginTime] = useState("");

  // ---- 전처리 유틸 ----
  const v = (x) => (x === null || x === undefined || x === "" ? "-" : String(x));

  const formatDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (isNaN(d)) return v(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}.${m}.${day}`;
  };

  const formatGender = (g) => {
    if (!g) return "-";
    const s = String(g).toUpperCase();
    if (s === "M") return "남";
    if (s === "F") return "여";
    return s;
  };

  const formatPhone = (p) => {
    if (!p) return "-";
    const d = String(p).replace(/\D/g, "");
    if (d.length === 11 && d.startsWith("010")) {
      return `010-${d.slice(3, 7)}-${d.slice(7)}`;
    }
    return p;
  };

  // ✅ 현재 시간 1회 세팅
  useEffect(() => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    setLastLoginTime(
      `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
    );
  }, []);

  // ✅ (수정) 단일 라우트로 통합 조회: /api/debug/echo_session
  useEffect(() => {
    let ignore = false;

    (async () => {
      setLoading(true);
      setFetchError(null);

      try {
        const res = await fetch("http://localhost:3000/api/univer_city/user_route", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));

        if (!res.ok || data?.ok === false) {
          if (!ignore) setFetchError(data?.reason || data?.error || `HTTP_${res.status}`);
          return;
        }

        // 1) user 기본 정보 레코드 안전 추출
        const result = data?.result;
        let row = null;
        if (Array.isArray(result) && result.length) row = result[0];
        else if (Array.isArray(result?.rows) && result.rows.length) row = result.rows[0];
        else if (Array.isArray(result?.data) && result.data.length) row = result.data[0];
        else if (result && typeof result === "object") row = result;

        if (!row) {
          if (!ignore) setProfileData(null);
          return;
        }

        // 2) 기본 프로필 전처리
        const cleaned = {
          user_id: v(row.user_id),
          user_name: v(row.user_name),
          department_id: v(row.department_id),
          birth_date: formatDate(row.birth_date),
          gender: formatGender(row.gender),
          phone: formatPhone(row.phone),
          address: v(row.address),
          account_number: v(row.account_number),
        };

        // 3) (수정) user_type 및 서브타입 레코드 수신 처리
        //    2번 라우트가 3번 라우트(/api/user_type)의 응답을 raw로 같이 전달함
        //    예: { ok:true, user_type:"Professor", Professor:{...} }
        const typeVal = data?.user_type ?? "unknown";
        const typeSrc = data?.user_type_source ?? null;
        const raw = typeSrc?.raw ?? null;

        cleaned.user_type = typeVal;                 // "student" | "Professor" | "employee" | "teaching_assistant" | "user" | "unknown"
        cleaned.user_type_foundIn = typeSrc?.foundIn ?? null;

        // 테이블명 그대로 들어오는 필드에서 레코드 뽑기
        // raw.user_type 에 테이블명이 있고, raw[테이블명] 에 1행 레코드가 존재
        let subtypeRecord = null;
        if (raw && typeof raw === "object") {
          const tableName = raw.user_type; // 예: "Professor"
          if (tableName && raw[tableName] && typeof raw[tableName] === "object") {
            subtypeRecord = raw[tableName];
          }
        }
        cleaned.user_type_record = subtypeRecord;

        if (!ignore) setProfileData(cleaned);
      } catch (e) {
        if (!ignore) setFetchError(e?.message || "UNKNOWN_ERROR");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <>
      <link rel="stylesheet" href="/assest/css/seoulUniversity_Copy.css" />
      <link rel="stylesheet" href="/assest/css/seoulUniverContent.css" />
      <link rel="stylesheet" href="/assest/css/notice.css" />
      <link rel="stylesheet" href="/assest/css/DsuNews.css" />
      <link rel="stylesheet" href="/assest/css/Quickmenu.css" />
      <link rel="stylesheet" href="/assest/css/timetable.css" />
      <link rel="stylesheet" href="/assest/css/herder.css" />

      {/* 로그인 박스: 전처리된 profileData + 현재 시간 전달 */}
      <LoginBox
        data={profileData}
        loading={loading}
        fetchError={fetchError}
        onOpenMessenger={() => setShowMessenger(true)}
        showDetails={false}
        lastLoginTime={lastLoginTime}
        userType={profileData?.user_type ?? null}

      />

      <Announcement />
      <QuickMenu />
      <LectureSchedule />
      <Shortcuts />
      <News />
      <Calendar />
      <Community />

      <div className="card">
        <div className="announcementArea">
          <div>
            <h1>공고 1</h1>
          </div>
          <div>
            <h1>공고 2</h1>
          </div>
        </div>
      </div>

      {/* Messenger 모달 */}
      {showMessenger && (
        <div className="messenger-overlay" onClick={() => setShowMessenger(false)}>
          <div className="messenger-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-btn"
              onClick={() => setShowMessenger(false)}
              aria-label="닫기"
              title="닫기"
            >
              ✖
            </button>
            <Messenger />
          </div>
        </div>
      )}
    </>
  );
}