// chat_insert.js
"use client";

/** KST 기준 HH:MM:SS 문자열 생성 */
function nowKST_HMS() {
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("hour")}:${get("minute")}:${get("second")}`;
}

/**
 * 채팅 메시지 삽입 헬퍼
 *  - 이제 더 이상 chatroomId 를 1로 강제하지 않음
 *  - chatroomId 가 안 넘어오면 에러로 막아 버림
 */
export async function chatInsert({
  chatroomId,
  content = "",
  filePath = null,
} = {}) {
  // ✅ 1) chatroomId가 반드시 전달되도록 체크
  if (chatroomId === undefined || chatroomId === null) {
    throw new Error("chatroomId가 넘어오지 않았습니다.");
  }

  const numericId = Number(chatroomId);
  if (!Number.isFinite(numericId) || numericId <= 0) {
    throw new Error(`유효하지 않은 chatroomId: ${chatroomId}`);
  }

  const res = await fetch(
    "http://localhost:3000/main_content/components/messeage_component/messager_route/chatting_insert",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatroom_id: numericId,       // ✅ 방 번호 그대로 사용
        content,                      // 비어있으면 서버에서 처리
        file_path: filePath,          // null 가능
        create_hours: nowKST_HMS(),   // 현재 시각
      }),
    }
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.detail || data?.reason || "채팅 삽입 실패";
    throw new Error(msg);
  }
  return data;
}
