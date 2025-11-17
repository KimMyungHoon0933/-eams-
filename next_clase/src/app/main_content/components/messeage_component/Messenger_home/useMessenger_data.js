// app/components/messenger/useMessengerData.js
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/** 공용 JSON fetch (same-origin 쿠키 포함) */
async function fetchJSON(url, init = {}) {
  const res = await fetch(url, {
    ...init,
    cache: "no-store",
    credentials: "include",
    headers: { ...(init.headers || {}) },
  });
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`INVALID_JSON from ${url}`);
  }
  if (!res.ok || data?.ok === false) {
    const reason = data?.reason || `HTTP_${res.status}`;
    const err = new Error(reason);
    err.payload = data;
    err.status = res.status;
    throw err;
  }
  return data;
}

function formatTime(ts) {
  if (!ts) return "-";
  const d = new Date(ts);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  return sameDay
    ? d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" });
}

/** chatting_select 응답 -> UI에서 바로 쓰기 좋게 평탄화 */
function normalizeMessage(m) {
  const author = m?.author || {};
  const senderId =
    m.sender_id ??
    m.user_id ??
    author.user_id ??
    m.author_id ??
    m.userId ??
    0;

  const senderName =
    m.sender_name ??
    m.user_name ??
    author.user_name ??
    m.author_name ??
    "알수없음";

  // 파일 경로가 단일 문자열이면 간단히 첨부 배열로 변환
  const attachments = Array.isArray(m.attachments)
    ? m.attachments
    : (m.file_path ? [{ type: "file", url: m.file_path }] : []);

  return {
    id: m.message_id ?? m.id ?? `msg-${Math.random().toString(36).slice(2)}`,
    chatroom_id: m.chatroom_id,
    created_date: m.created_date || m.createdAt || m.time || m.timestamp,
    content: m.content ?? m.text ?? "",
    sender_id: senderId,
    sender_name: senderName,
    attachments,
  };
}

function groupByDay(messages = []) {
  const byDay = new Map();
  for (const m of messages) {
    const ts = m.created_date;
    const d = ts ? new Date(ts) : new Date();
    const dayLabel = d.toISOString().slice(0, 10); // YYYY-MM-DD
    const timeLabel = d.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const msg = {
      id: m.id,
      senderId: m.sender_id ?? 0,
      senderName: m.sender_name ?? "알수없음",
      text: m.content ?? "",
      attachments: Array.isArray(m.attachments) ? m.attachments : [],
      timeLabel,
    };

    if (!byDay.has(dayLabel)) byDay.set(dayLabel, []);
    byDay.get(dayLabel).push(msg);
  }
  return [...byDay.entries()].map(([dayLabel, items]) => ({ dayLabel, items }));
}

export function useMessengerData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 채팅방 메타
  const [chatrooms, setChatrooms] = useState([]);
  // 채팅방별 메시지
  const [messagesByRoom, setMessagesByRoom] = useState(new Map());

  // 선택된 채팅방
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  // 현재 사용자 id (말풍선 좌/우 구분)
  const [currentUserId, setCurrentUserId] = useState(0);

  const abortRef = useRef(null);

  useEffect(() => {
    const aborter = new AbortController();
    abortRef.current = aborter;

    async function run() {
      setLoading(true);
      setError(null);

      try {
        // 1) 사용자가 속한 채팅방 목록 받아오기 (이 부분은 수정하지 말라고 했으므로 그대로)
        const meta = await fetchJSON(
          "http://localhost:3000/main_content/components/messeage_component/messager_route/chatting_room_select"
        );

        const uid =
          meta?.current_user_id ??
          meta?.session?.user_id ??
          meta?.user?.user_id ??
          0;
        setCurrentUserId(Number(uid) || 0);

        const rooms = Array.isArray(meta?.chatrooms) ? meta.chatrooms : [];
        setChatrooms(rooms);

        if (!rooms.length) {
          setMessagesByRoom(new Map());
          setLoading(false);
          return;
        }

        // 2) 각 채팅방 메시지 조회 (2번 chatting_select를 사용)
     // 2) 각 채팅방 최신 메시지 1개만 조회 (POST JSON 바디로 2번 chatting_select 호출)
        const tasks = rooms.map((r) =>
        fetchJSON(
            "http://localhost:3000/main_content/components/messeage_component/messager_route/chatting_select",
            {
            method: "POST",
            headers: { "Content-Type": "application/json" }, // ← 라우터가 검사함
            body: JSON.stringify({
                chatroom_id: r.chatroom_id,
                limit: 1,          // 최신 1개만
                order: "desc",     // 최근순
            }),
            }
        ).then((data) => {
            const raw = Array.isArray(data?.messages) ? data.messages : [];
            // 2번 라우터의 author {user_id, user_name} 구조를 평탄화
            const normalized = raw.map(normalizeMessage);
            return { chatroom_id: r.chatroom_id, messages: normalized };
        })
        );


        const results = await Promise.allSettled(tasks);
        const map = new Map();
        for (const res of results) {
          if (res.status === "fulfilled") {
            map.set(res.value.chatroom_id, res.value.messages);
          } else {
            // 실패한 방은 빈 배열로
            map.set(res.reason?.chatroom_id ?? -1, []);
          }
        }
        setMessagesByRoom(map);
      } catch (e) {
        setError(e?.message || "FETCH_FAILED");
        setMessagesByRoom(new Map());
      } finally {
        setLoading(false);
      }
    }

    run();
    return () => aborter.abort();
  }, []);

  const items = useMemo(() => {
    if (!chatrooms?.length) return [];
    return chatrooms.map((room) => {
      const msgs = messagesByRoom.get(room.chatroom_id) || [];
      const last = msgs.length ? msgs[msgs.length - 1] : null;
      const preview =
        (last?.content || "").trim() ||
        (msgs.length ? "(첨부 또는 내용 없음)" : "(메시지 없음)");
      const time = last?.created_date || room?.last_message_time || null;

      const name = room?.chatroom_name || `채팅방 ${room.chatroom_id}`;
      const initial = name?.[0] || "?";

      return {
        id: String(room.chatroom_id),
        name,
        initial,
        time: formatTime(time),
        preview,
      };
    });
  }, [chatrooms, messagesByRoom]);

  const selectedRoom =
    selectedRoomId != null
      ? chatrooms.find((r) => r.chatroom_id === selectedRoomId)
      : null;

  const groupsForSelected = useMemo(() => {
    if (!selectedRoom) return [];
    const rawMsgs = messagesByRoom.get(selectedRoom.chatroom_id) || [];
    return groupByDay(rawMsgs);
  }, [selectedRoom, messagesByRoom]);

  const actions = {
    selectRoom: (idStr) => {
      const id = Number(idStr);
      if (!Number.isFinite(id)) return;
      setSelectedRoomId(id);
    },
    closeRoom: () => setSelectedRoomId(null),
  };

  return {
    loading,
    error,
    items,
    currentUserId,
    selectedRoom,
    groupsForSelected,
    ...actions,
  };
}
