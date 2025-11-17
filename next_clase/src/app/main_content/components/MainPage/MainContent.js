// app/components/MainContent.js
"use client";

import { useEffect, useState } from "react";

import Messenger from "../messeage_component/Messenger_home/MessengerContainer";
import LoginBox from "./MainComponent/profile";
import QuickMenu from "./MainComponent/QuickMenu";
import LectureSchedule from "./MainComponent/lecture_schedule";
import Shortcuts from "./MainComponent/Shortcuts";
import News from "./MainComponent/News";
import Calendar from "./MainComponent/Calendar";
import Community from "./MainComponent/Community";
import Timetable from "../timetable/timetable_content";
import MessengerNotificationPanel from "./MainComponent/MessengerNotificationPanel";

// 메신저 모달 컴포넌트 (x_to_messenger)
import MessengerModal from "../messeage_component/Messenger_chatwindow/x_to_messenger";

// ✅ 새 채팅방 생성 모달(1번 창)
//   경로를 실제 파일 위치에 맞게! (Messenger_home 이 아니라 Messenger_chatwindow 라면 이렇게)
import CreateChatWindowContainer from "../messeage_component/Messenger_home/create_chatwindow_container";

export default function MainContent() {
  const [showMessenger, setShowMessenger] = useState(false);

  // ✅ 1번 창(새 채팅방 만들기) 모달 표시 여부
  const [showCreateChatWindow, setShowCreateChatWindow] = useState(false);

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [lastLoginTime, setLastLoginTime] = useState("");

  const v = (x) =>
    x === null || x === undefined || x === "" ? "-" : String(x);

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

  // 마지막 로그인 시간 표시용
  useEffect(() => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    setLastLoginTime(
      `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(
        d.getDate()
      )} ${pad(d.getHours())}:${pad(d.getMinutes())}`
    );
  }, []);

  // 프로필 데이터 fetch
  useEffect(() => {
    let ignore = false;

    (async () => {
      setLoading(true);
      setFetchError(null);

      try {
        const res = await fetch(
          "http://localhost:3000/api/univer_city/user_route",
          { cache: "no-store" }
        );
        const data = await res.json().catch(() => ({}));

        if (!res.ok || data?.ok === false) {
          if (!ignore) {
            setFetchError(
              data?.reason || data?.error || `HTTP_${res.status}`
            );
          }
          return;
        }

        const result = data?.result;
        let row = null;
        if (Array.isArray(result) && result.length) row = result[0];
        else if (Array.isArray(result?.rows) && result.rows.length)
          row = result.rows[0];
        else if (Array.isArray(result?.data) && result.data.length)
          row = result.data[0];
        else if (result && typeof result === "object") row = result;

        if (!row) {
          if (!ignore) setProfileData(null);
          return;
        }

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

        const typeVal = data?.user_type ?? "unknown";
        const typeSrc = data?.user_type_source ?? null;
        const raw = typeSrc?.raw ?? null;

        cleaned.user_type = typeVal;
        cleaned.user_type_foundIn = typeSrc?.foundIn ?? null;

        let subtypeRecord = null;
        if (raw && typeof raw === "object") {
          const tableName = raw.user_type;
          if (
            tableName &&
            raw[tableName] &&
            typeof raw[tableName] === "object"
          ) {
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

  // 채팅방 뷰 → 메신저 패널로 돌아올 때 쓰는 이벤트
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = () => {
      setShowMessenger(true);
    };

    window.addEventListener("OPEN_MESSENGER_FROM_CHAT", handler);

    return () => {
      window.removeEventListener("OPEN_MESSENGER_FROM_CHAT", handler);
    };
  }, []);

  // ✅ 어디서든 `OPEN_CREATE_CHAT_WINDOW` 이벤트만 쏘면
  //    여기서 1번 창(새 채팅방 만들기) 모달을 띄움
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = () => {
      setShowCreateChatWindow(true);
    };

    window.addEventListener("OPEN_CREATE_CHAT_WINDOW", handler);

    return () => {
      window.removeEventListener("OPEN_CREATE_CHAT_WINDOW", handler);
    };
  }, []);

  const currentUserId =
    profileData && profileData.user_id && profileData.user_id !== "-"
      ? profileData.user_id
      : null;

  return (
    <>
      <LoginBox
        data={profileData}
        loading={loading}
        fetchError={fetchError}
        onOpenMessenger={() => setShowMessenger(true)}
        showDetails={false}
        lastLoginTime={lastLoginTime}
        userType={profileData?.user_type ?? null}
      />

     <Shortcuts /> 
      <QuickMenu />
      <Calendar />
      <div className="card">
        <Timetable />
      </div>  

      <MessengerNotificationPanel />

      {showMessenger && (
        <MessengerModal onClose={() => setShowMessenger(false)} />
      )}

      {/* ✅ 새 채팅방 만들기 모달(1번 창) */}
      {showCreateChatWindow && (
        <CreateChatWindowContainer
          currentUserId={currentUserId}
          onClose={() => setShowCreateChatWindow(false)}
          onCreated={() => {
            setShowCreateChatWindow(false);
            setShowMessenger(true);
          }}
        />
      )}
    </>
  );
}

