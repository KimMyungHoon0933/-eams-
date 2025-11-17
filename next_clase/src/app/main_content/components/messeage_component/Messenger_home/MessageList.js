// src/app/integreate/componate/MessageList.js
import MessageItem from "./MessageItem";

export default function MessageList({ items = [], onItemClick }) {
  // 디버깅용: 리스트 상태 확인
  console.log("[MessageList] items.length =", items?.length);
  if (!items || items.length === 0) {
    return (
      <div style={{ padding: 16, color: "#777" }}>
        채팅방이 없습니다.
      </div>
    );
  }

  return (
    <div role="list" style={{ padding: 0, margin: 0 }}>
      {items.map((it) => {
        const key = it.chatroom_id ?? it.id ?? it.room_id ?? it.name;
        const name =
          it.chatroom_name ?? it.name ?? it.title ?? `채팅방 ${key ?? ""}`;
        const preview =
          it.last_message?.content ??
          it.preview ??
          it.last_text ??
          it.description ??
          "";
        const time =
          it.last_message?.time ??
          it.time ??
          it.updated_at ??
          it.last_time ??
          "";
        const initial = name?.[0] ?? "?";
        const count = it.unread_count ?? it.count ?? 0;

        return (
          <MessageItem
            key={key}
            name={name}
            initial={initial}
            time={time}
            preview={preview}
            count={count}
            unread={count > 0}
            pinned={Boolean(it.pinned)}
            muted={Boolean(it.muted)}
            onClick={() => onItemClick?.(it)}   // ★ 클릭 → 상위로 전달
          />
        );
      })}
    </div>
  );
}
