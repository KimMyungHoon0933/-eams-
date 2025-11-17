// src/app/main_content/components/messeage_component/Messenger_chatwindow/chatForm.js
"use client";

import React, { useState } from "react";
import PropTypes from "prop-types";
import { chatInsert } from "./chat_insert"; // 동일 폴더의 클라이언트 헬퍼

export default function ChatForm({ chatroomId = 1, onInserted }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  async function onSubmit(e) {
    e.preventDefault(); // 기본 GET 제출 방지
    if (sending) return;

    try {
      setSending(true);
      const res = await chatInsert({
        chatroomId,
        content: text,   // 비어있으면 서버가 [TEST] 기본값으로 채움
        filePath: null,
      });
      setText("");
      onInserted?.(res);
    } catch (err) {
      console.error(err);
      alert(err?.message || "메시지 전송 실패");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="메시지를 입력하세요"
        aria-label="메시지 입력"
      />
      <button type="submit" disabled={sending}>
        {sending ? "전송 중..." : "보내기"}
      </button>
    </form>
  );
}

// ✅ 컴포넌트 이름 정확히 매칭
ChatForm.propTypes = {
  chatroomId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onInserted: PropTypes.func,
};
