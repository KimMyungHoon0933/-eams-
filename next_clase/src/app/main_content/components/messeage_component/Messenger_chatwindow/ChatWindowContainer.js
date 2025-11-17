// app/components/messeage_component/Messenger_chatwindow/ChatWindowContainer.js
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ChatWindowView from "./ChatWindowView";

// 1) 공통 JSON fetch
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

/** 날짜/시간 → 정렬 키(ISO 비슷) */
function buildSortKey(created_date, create_hours, fallbackTs) {
  if (created_date && create_hours) return `${created_date}T${create_hours}`;
  if (created_date) return `${created_date}T00:00:00`;
  if (fallbackTs) return String(fallbackTs);
  return "";
}

// 2) 라우터 출력 형식에 맞춘 정규화
function normalizeMessage(m) {
  // 1번 라우터(채팅+작성자) 형식 참고: message_id, chatroom_id, sender_id, sender_name,
  // content, file_path, created_date, create_hours, (옵션) message_datetime
  const attachments = m.file_path
    ? [{ type: "file", url: m.file_path, name: "첨부파일" }]
    : Array.isArray(m.attachments)
    ? m.attachments
    : [];

  const created_date =
    m.created_date ?? m.message_date ?? m.createdAt ?? m.date ?? null;
  const create_hours =
    m.create_hours ?? m.message_time ?? m.time ?? m.timestamp ?? null;

  const sortKey = buildSortKey(created_date, create_hours, m.message_datetime);

  return {
    id: m.message_id ?? m.id ?? `msg-${Math.random().toString(36).slice(2)}`,
    chatroom_id: m.chatroom_id,
    created_date,     // YYYY-MM-DD
    create_hours,     // HH:MM:SS
    sortKey,          // 정렬용
    content: m.content ?? m.text ?? "",
    sender_id:
      m.sender_id ?? m.user_id ?? m.author_id ?? m.userId ?? 0,
    sender_name:
      m.sender_name ?? m.user_name ?? m.author_name ?? "알수없음",
    attachments,
  };
}

/** 작성일↑, 같은 날이면 시각↑ */
function compareByDateTimeAsc(a, b) {
  if (a.created_date !== b.created_date) {
    return (a.created_date || "").localeCompare(b.created_date || "");
  }
  // same date → compare time (fallback to sortKey)
  const t1 = a.create_hours || a.sortKey || "";
  const t2 = b.create_hours || b.sortKey || "";
  return t1.localeCompare(t2);
}

/** 날짜별 그룹핑(표시용 라벨 포함) */
function groupByDay(messages = []) {
  // 정렬 보장: 작성일↑, 시간↑
  const sorted = [...messages].sort(compareByDateTimeAsc);

  const byDay = new Map();
  for (const m of sorted) {
    const dayLabel =
      m.created_date ??
      (typeof m.sortKey === "string" && m.sortKey.slice(0, 10)) ??
      "알수없음";

    // "HH:MM"로 간단 표현
    const timeLabel =
      (typeof m.create_hours === "string" && m.create_hours.slice(0, 5)) ||
      (() => {
        // 혹시 sortKey가 ISO면 시간 뽑기
        const t = (m.sortKey || "").split("T")[1] || "";
        return t.slice(0, 5) || "--:--";
      })();

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

const API_URL =
  "http://localhost:3000/main_content/components/messeage_component/messager_route/chatting_authorName";
const PAGE_LIMIT = 50;

export default function ChatWindowContainer({
  chatroomId,
  chatroomName,
  currentUserId,
  onClose,
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore]   = useState(false);

  const [input, setInput]   = useState("");
  const [sending, setSending] = useState(false);
  const [files, setFiles] = useState([]);

  const scrollerRef = useRef(null);
  const bottomRef   = useRef(null);

  // 최신 로드
  const loadLatest = useCallback(async () => {
    if (!chatroomId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchJSON(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatroom_id: chatroomId,
          limit: PAGE_LIMIT,
          order: "desc", // 라우터는 desc로 주지만, 아래에서 우리가 asc로 재정렬
        }),
      });
      const raw = Array.isArray(data?.messages) ? data.messages : [];
      const normalized = raw.map(normalizeMessage).sort(compareByDateTimeAsc);
      setMessages(normalized);
      setHasMore(normalized.length >= PAGE_LIMIT);
    } catch (e) {
      setError(e?.message || "FETCH_FAILED");
      setMessages([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      requestAnimationFrame(() =>
        bottomRef.current?.scrollIntoView({ block: "end" })
      );
    }
  }, [chatroomId]);

  useEffect(() => {
    loadLatest();
  }, [loadLatest]);

  // 무한 스크롤: 상단 도달 시 과거 메시지 로드
  const onScroll = useCallback(async (e) => {
    if (!hasMore || loading) return;
    const el = e.currentTarget;
    if (el.scrollTop < 40) {
      try {
        const data = await fetchJSON(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chatroom_id: chatroomId,
            limit: PAGE_LIMIT,
            order: "asc", // 더 과거를 받아오되, 나중에 전체 asc 재정렬
          }),
        });
        const raw = Array.isArray(data?.messages) ? data.messages : [];
        const normalized = raw.map(normalizeMessage);
        if (normalized.length) {
          setMessages((prev) =>
            [...normalized, ...prev].sort(compareByDateTimeAsc)
          );
          setHasMore(normalized.length >= PAGE_LIMIT);
        } else {
          setHasMore(false);
        }
      } catch {
        // 조용히 무시
      }
    }
  }, [chatroomId, hasMore, loading]);

  // 파일 첨부
  const onPickFiles = useCallback((fileList) => {
    const arr = Array.from(fileList || []);
    setFiles((prev) => [...prev, ...arr]);
  }, []);
  const onRemoveFileAt = useCallback((idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  // 전송 (실제 전송 라우터 연결 전, 낙관적 갱신)
  const onSend = useCallback(async () => {
    const text = input.trim();
    if (!text && files.length === 0) return;
    setSending(true);
    try {
      // 낙관적 메시지: 지금 시간으로 채워 넣기
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      const HH = String(now.getHours()).padStart(2, "0");
      const MM = String(now.getMinutes()).padStart(2, "0");
      const SS = String(now.getSeconds()).padStart(2, "0");

      const optimistic = normalizeMessage({
        message_id: `local-${Date.now()}`,
        chatroom_id: chatroomId,
        created_date: `${yyyy}-${mm}-${dd}`,
        create_hours: `${HH}:${MM}:${SS}`,
        content: text,
        sender_id: currentUserId ?? 0,
        sender_name: "나",
        attachments: files.map((f) => ({ name: f.name, url: "#" })),
      });

      setMessages((prev) =>
        [...prev, optimistic].sort(compareByDateTimeAsc)
      );
      setInput("");
      setFiles([]);
      requestAnimationFrame(() =>
        bottomRef.current?.scrollIntoView({ block: "end" })
      );
    } finally {
      setSending(false);
    }
  }, [chatroomId, currentUserId, files, input]);

  const groups = useMemo(() => groupByDay(messages), [messages]);

  return (
    <ChatWindowView
      chatroomId={chatroomId}
      chatroomName={chatroomName}
      currentUserId={currentUserId ?? 0}
      groups={groups}
      hasMore={hasMore}
      scrollerRef={scrollerRef}
      bottomRef={bottomRef}
      onScroll={onScroll}
      input={input}
      onInputChange={setInput}
      sending={sending}
      onSend={onSend}
      files={files}
      onPickFiles={onPickFiles}
      onRemoveFileAt={onRemoveFileAt}
      onClose={onClose}
      loading={loading}
      error={error}
      onReload={loadLatest}
    />
  );
}
