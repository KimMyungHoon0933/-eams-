// app/components/messeage_component/Messenger_home/MessengerContainer.js
"use client";

import MessengerView from "./MessengerView";
import { useMessengerData } from "./useMessenger_data";

export default function MessengerContainer() {
  // ✅ 1번 파일의 hook을 그대로 사용
  const {
    loading,
    error,
    items,              // 채팅방 목록
    currentUserId,      // 현재 로그인 유저 ID
    selectedRoom,       // 선택된 채팅방
    groupsForSelected,  // 선택된 채팅방의 메시지들(5번 채팅폼용)
    selectRoom,         // 방 선택 (클릭 시)
    closeRoom,          // 채팅폼 닫기
  } = useMessengerData();

  return (
    <MessengerView
      loading={loading}
      error={error}
      items={items}
      currentUserId={currentUserId}
      selectedRoom={selectedRoom}
      groupsForSelected={groupsForSelected}
      onItemClick={(room) => {
        // room.id → chatroom_id 로 선택
        selectRoom(room.id || room.chatroom_id);
      }}
      onCloseSelected={closeRoom}
    />
  );
}
