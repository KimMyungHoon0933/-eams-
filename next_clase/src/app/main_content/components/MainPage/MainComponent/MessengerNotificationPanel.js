// MessengerNotificationPanel.js
"use client";

import { useState, useMemo } from "react";
import "./MainComponent_css/messeage_panel.css";

import { useMessengerData } from "../../messeage_component/Messenger_home/useMessenger_data";   // 2번 훅
import MessageList from "../../messeage_component/Messenger_home/MessageList";                  // 4번 리스트
import ChatWindowContainer from "../../messeage_component/Messenger_chatwindow/ChatWindowContainer"; // 채팅방 뷰 컨테이너(2번)

export default function MessengerNotificationPanel() {
  const [opened, setOpened] = useState(true);

  // 2번 훅에서 메신저 데이터 가져오기
  const { loading, error, items, currentUserId } = useMessengerData();

  // 현재 클릭한 채팅방 정보 (→ 2번 컨테이너로 전달)
  const [activeRoom, setActiveRoom] = useState(null);
  // activeRoom = { chatroomId: number, chatroomName: string }

  // 전체 안 읽은 개수 (unread_count 또는 count 기준)
  const totalUnread = useMemo(
    () =>
      (items || []).reduce(
        (sum, it) => sum + Number(it.unread_count ?? it.count ?? 0),
        0
      ),
    [items]
  );

  // 리스트 아이템 클릭 시 → 2번 ChatWindowContainer에 넘길 값 세팅
  const handleItemClick = (item) => {
    // useMessengerData가 만든 items 구조: id = String(chatroom_id)
    const rawId = item.chatroom_id ?? item.id;
    const chatroomId = Number(rawId);
    if (!chatroomId) return;

    const chatroomName =
      item.chatroom_name ?? item.name ?? item.title ?? `채팅방 ${chatroomId}`;

    setActiveRoom({ chatroomId, chatroomName });
  };

  // 채팅방 뷰 닫기 (1번 뷰에서 닫기 버튼 누르면)
  const handleCloseChat = () => {
    setActiveRoom(null);
  };

  return (
    <>
      {/* 메신저 패널 (3번) */}
      <div className="card messenger-noti-card">
        {/* 상단 헤더 (클릭 시 접기/펼치기) */}
        <button
          type="button"
          className="messenger-noti-header"
          onClick={() => setOpened((prev) => !prev)}
        >
          <div className="messenger-noti-title">
            <span className="messenger-noti-icon">💬</span>
            <span>메신저 알림</span>
          </div>
          <div className="messenger-noti-right">
            {loading ? (
              <span className="messenger-noti-unread messenger-noti-unread--none">
                불러오는 중...
              </span>
            ) : error ? (
              <span className="messenger-noti-unread messenger-noti-unread--none">
                오류 발생
              </span>
            ) : totalUnread > 0 ? (
              <span className="messenger-noti-unread">
                새 메시지 {totalUnread}개
              </span>
            ) : (
              <span className="messenger-noti-unread messenger-noti-unread--none">
                새 메시지 없음
              </span>
            )}
            <span className="messenger-noti-toggle">
              {opened ? "▴" : "▾"}
            </span>
          </div>
        </button>

        {/* 알림 목록 영역 */}
        {opened && (
          <div className="messenger-noti-list">
            {loading && (
              <div className="messenger-noti-empty">
                메신저 데이터를 불러오는 중입니다…
              </div>
            )}

            {!loading && error && (
              <div className="messenger-noti-empty">
                메신저 데이터를 불러오지 못했습니다.
                <br />
                <small>{String(error)}</small>
              </div>
            )}

            {!loading && !error && (!items || items.length === 0) && (
              <div className="messenger-noti-empty">
                표시할 알림이 없습니다.
              </div>
            )}

            {!loading && !error && items && items.length > 0 && (
              <MessageList items={items} onItemClick={handleItemClick} />
            )}
          </div>
        )}
      </div>

      {/* 🔽 채팅방 뷰 (1번 + 2번) : 패널에서 채팅방 클릭했을 때 뜨는 창 */}
      {activeRoom && (
        <div
          // 간단한 전체 화면 오버레이
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1200,
          }}
        >
          <div
            style={{
              maxWidth: "960px",
              width: "100%",
              maxHeight: "90vh",
              padding: 8,
            }}
          >
            <ChatWindowContainer
              chatroomId={activeRoom.chatroomId}           // ← 2번이 받는 채팅방 id
              chatroomName={activeRoom.chatroomName}       // ← 1번 헤더에 표시할 이름
              currentUserId={currentUserId ?? 0}           // ← 말풍선 좌/우 정렬용
              onClose={handleCloseChat}                    // ← 1번의 ✕ 버튼에서 호출
            />
          </div>
        </div>
      )}
    </>
  );
}
