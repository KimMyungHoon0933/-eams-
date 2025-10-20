// app/components/Messenger.js
"use client";

import { useEffect, useState } from "react";
import "./css/messenger-list.css";

export default function Messenger({ open = true, onClose }) {
  const [isOpen, setIsOpen] = useState(open);

  // 오버레이가 열려 있을 때 바디 스크롤 잠금
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="msgr">
      {/* ✔︎ 어두운 배경 오버레이 */}
      <div
        className="messenger-overlay"
        onClick={handleClose}                      // 배경 클릭 닫기
      >
        {/* ✔︎ 중앙 모달 */}
        <div
          className="messenger-modal"
          onClick={(e) => e.stopPropagation()}    // 모달 내부 클릭은 전파 막기
          role="dialog"
          aria-modal="true"
          aria-label="메신저"
        >
          <button className="close-btn" onClick={handleClose} aria-label="닫기">×</button>

          {/* 실제 메신저 앱 프레임 */}
          <div className="msgr-app">
            {/* Top app bar */}
            <header className="appbar">
              <div className="brand">
                <div className="avatar sm" data-initial="N" aria-hidden="true"></div>
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
              <a className="chat unread pinned" href="#" role="listitem">
                <div className="avatar lg" data-initial="팀"></div>
                <div className="msg-content">
                  <div className="top">
                    <span className="name">졸업프로젝트 팀방</span>
                    <time className="time">09:20</time>
                  </div>
                  <div className="bottom">
                    <span className="preview">발표 리허설 2시에 모일게요!</span>
                    <span className="badges">
                      <span className="pill count">3</span>
                      <span className="pill pin" title="고정">📌</span>
                    </span>
                  </div>
                </div>
              </a>

              <a className="chat" href="#" role="listitem">
                <div className="avatar lg" data-initial="영"></div>
                <div className="msg-content">
                  <div className="top">
                    <span className="name">영수</span>
                    <time className="time">어제</time>
                  </div>
                  <div className="bottom">
                    <span className="preview">오케이! 파일 받았어 🙌</span>
                  </div>
                </div>
              </a>

              <a className="chat unread" href="#" role="listitem">
                <div className="avatar lg" data-initial="교"></div>
                <div className="msg-content">
                  <div className="top">
                    <span className="name">교수님</span>
                    <time className="time">08:03</time>
                  </div>
                  <div className="bottom">
                    <span className="preview">수정본 확인 바랍니다.</span>
                    <span className="badges"><span className="pill count">1</span></span>
                  </div>
                </div>
              </a>

              <a className="chat muted" href="#">
                <div className="avatar lg" data-initial="알"></div>
                <div className="msg-content">
                  <div className="top">
                    <span className="name">알림 채널</span>
                    <time className="time">수</time>
                  </div>
                  <div className="bottom">
                    <span className="preview">[공지] 서버 점검 안내 (금 02:00)</span>
                    <span className="badges"><span className="pill mute">🔕</span></span>
                  </div>
                </div>
              </a>

              <a className="chat" href="#">
                <div className="avatar lg" data-initial="현"></div>
                <div className="msg-content">
                  <div className="top">
                    <span className="name">현수</span>
                    <time className="time">화</time>
                  </div>
                  <div className="bottom">
                    <span className="preview">점심은 비빔면?</span>
                  </div>
                </div>
              </a>

              <a className="chat" href="#">
                <div className="avatar lg" data-initial="개"></div>
                <div className="msg-content">
                  <div className="top">
                    <span className="name">개발 동아리</span>
                    <time className="time">월</time>
                  </div>
                  <div className="bottom">
                    <span className="preview">코드 리뷰 자료 업로드함</span>
                  </div>
                </div>
              </a>
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
        </div>
      </div>
    </div>
  );
}

