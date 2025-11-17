// app/components/messeage_component/Messenger_home/MessengerView.js
"use client";

import { useState, useMemo, useCallback } from "react";
import MessageList from "./MessageList";
import ChatWindowContainer from "../Messenger_chatwindow/ChatWindowContainer";
import CreateChatWindowContainer from "./create_chatwindow_container"; // ✅ 새 채팅방 컨테이너
import "../../css/messenger-list.css";

export default function MessengerView({
  loading,
  error,
  items = [],
  currentUserId,
  selectedRoom,        // (선택) 상위에서 내려오면 우선 사용
  groupsForSelected,   // (선택)
  onItemClick,         // (선택)
  onCloseSelected,     // (선택)
}) {
  // --- 로컬 fallback 상태 ---
  const [localSelected, setLocalSelected] = useState(null);

  // 새 채팅방 만들기 모달 열림 여부
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // 상위에서 내려온 게 있으면 그걸 우선, 없으면 로컬 사용
  const effectiveSelected = useMemo(
    () => selectedRoom ?? localSelected,
    [selectedRoom, localSelected]
  );

  const closeLocal = useCallback(() => setLocalSelected(null), []);

  // 항목 클릭 시 동작: 상위 onItemClick 있으면 호출, 없으면 로컬 상태로 오픈
  const handleItemClick = useCallback(
    (item) => {
      if (onItemClick) onItemClick(item);
      else setLocalSelected(item);
    },
    [onItemClick]
  );

  const handleClose = useCallback(() => {
    if (onCloseSelected) onCloseSelected();
    else closeLocal();
  }, [onCloseSelected, closeLocal]);

  return (
    <div className="app">
      {/* 상단바 */}
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

      {/* 상태 */}
      {loading && (
        <div className="search-row">
          <div
            className="search"
            style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            로딩 중...
          </div>
        </div>
      )}
      {error && !loading && (
        <div className="search-row">
          <div className="search" style={{ color: "crimson" }}>
            불러오기 실패: {String(error)}
          </div>
        </div>
      )}

      {!loading && (
        <div className="search-row">
          <input className="search" type="search" placeholder="사람·채팅 검색" />
        </div>
      )}

      {/* 채팅방 리스트 */}
      <main className="list" role="list">
        <MessageList items={items} onItemClick={handleItemClick} />
      </main>

      {/* 하단 탭 */}
      <nav className="nav">
        <button className="nav-btn active">채팅</button>
        <button className="nav-btn">연락처</button>
        <button className="nav-btn">설정</button>
      </nav>

      {/* FAB : 새 채팅방 만들기 버튼 */}
      <button
        className="fab"
        title="새 대화"
        onClick={() => setIsCreateOpen(true)}   // ✅ 클릭 시 새 채팅방 모달 열기
      >
        ＋
      </button>

      {/* 기존 채팅방(4번) 모달 */}
      {effectiveSelected && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={handleClose}
        >
          <div
            style={{
              width: 420,
              maxWidth: "90%",
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 8px 32px rgba(0,0,0,.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <ChatWindowContainer
              chatroomId={effectiveSelected.chatroom_id}
              chatroomName={
                effectiveSelected.chatroom_name ||
                `채팅방 ${effectiveSelected.chatroom_id}`
              }
              currentUserId={currentUserId || 0}
              onClose={handleClose}
            />
          </div>
        </div>
      )}

      {/* 새 채팅방 생성 모달 */}
      {isCreateOpen && (
        <CreateChatWindowContainer
          currentUserId={currentUserId || 0}
          onClose={() => setIsCreateOpen(false)}
          onCreated={() => {
            // 필요하면 여기에서 채팅방 목록 리로드 함수 호출
            // 예: reloadRooms();
            setIsCreateOpen(false);
          }}
        />
      )}
    </div>
  );
}
