// app/components/Messenger.js
"use client";
import MessageList from "./MessageList";

const chats = [
  {
    id: "team",
    name: "졸업프로젝트 팀방",
    initial: "팀",
    time: "09:20",
    preview: "발표 리허설  7시 할게요!",
    unread: true,
    pinned: true,
    count: 3,
  },
  {
    id: "youngsoo",
    name: "영수",
    initial: "영",
    time: "어제",
    preview: "오케이! 파일 받았어 🙌",
  },
  {
    id: "prof",
    name: "교수님",
    initial: "교",
    time: "08:03",
    preview: "수정본 확인 바랍니다.",
    unread: true,
    count: 1,
  },
  {
    id: "notice",
    name: "알림 채널",
    initial: "알",
    time: "수",
    preview: "[공지] 서버 점검 안내 (금 02:00)",
    muted: true,
  },
  {
    id: "hyunsoo",
    name: "현수",
    initial: "현",
    time: "화",
    preview: "점심은 비빔면?",
  },
  {
    id: "club",
    name: "개발 동아리",
    initial: "개",
    time: "월",
    preview: "코드 리뷰 자료 업로드함",
  },
];

import "./css/messenger-list.css"
export default function Messenger() {
  return (
    <div className="app">
      {/* Top app bar */}
      <header className="appbar">
        <div className="brand">
          <button className="icon ghost" aria-label="프로필">
            <img className="avatar sm" src={null} alt="프로필" />
          </button>
          <h1>Chats</h1>
        </div>
        <div className="actions">
          <button className="icon" aria-label="검색" title="검색">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M15.5 14h-.79l-.28-.27a6.471 6.471 0 0 0 1.57-4.23A6.5 6.5 0 1 0 9.5 16.5c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0A4.5 4.5 0 1 1 14 9.5 4.505 4.505 0 0 1 9.5 14Z" fill="currentColor"/>
            </svg>
          </button>
          <button className="icon" aria-label="새 메시지" title="새 메시지">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </header>

      {/* 검색 */}
      <div className="search-row">
        <input className="search" type="search" placeholder="사람·채팅 검색" />
      </div>

      {/* 채팅 리스트 */}
      <main className="list" role="list">
          <MessageList items={chats} />
      </main>

      {/* 하단 nav */}
      <nav className="nav">
        <button className="nav-btn active">채팅</button>
        <button className="nav-btn">연락처</button>
        <button className="nav-btn">설정</button>
      </nav>

      {/* 플로팅 버튼 */}
      <button className="fab" title="새 대화">＋</button>
    </div>
  );
}

