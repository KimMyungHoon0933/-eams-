// app/page.js
"use client"; // 클라이언트 컴포넌트로 지정 (React 훅 사용 가능)
import React, { useState } from "react";
import ChatWindow from "../../components/messeage_component/Messenger_chatwindow/messenger_chatwindow"; // 1번 import

export default function Page() {
  // 예시용 state
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      senderId: 1,
      senderName: "이학생",
      text: "안녕하세요!",
      timeLabel: "오전 9:01",
    },
    {
      id: 2,
      senderId: 2,
      senderName: "교수님",
      text: "안녕하세요. 오늘 회의 합시다.",
      timeLabel: "오전 9:03",
    },
  ]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg = {
      id: Date.now(),
      senderId: 1,
      senderName: "이학생",
      text: input,
      timeLabel: new Date().toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages([...messages, newMsg]);
    setInput("");
  };

  return (
    <ChatWindow
      chatroomId={1}
      chatroomName="졸업과제 채팅방"
      currentUserId={1}
      groups={[
        {
          dayLabel: "2025-11-04",
          items: messages,
        },
      ]}
      input={input}
      onInputChange={setInput}
      onSend={handleSend}
      onClose={() => alert("채팅창 닫기")}
    />
  );
}
