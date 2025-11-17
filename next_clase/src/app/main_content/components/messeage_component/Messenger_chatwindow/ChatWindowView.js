// app/components/messeage_component/Messenger_chatwindow/ChatWindowView.js
"use client";

import React from "react";
import PropTypes from "prop-types";
import "./chatwindow.css";
import ChatInputForm from "./chatForm";

/** 날짜 구분선 */
function DateDivider({ when }) {
  return <div className="cw-date">{when}</div>;
}

/** 말풍선 하나 */
function Bubble({ msg, mine }) {
  return (
    <div className={`cw-row ${mine ? "is-me" : "is-you"}`}>
      {!mine && <div className="cw-avatar">{msg.senderName?.[0] ?? "?"}</div>}
      <div className={`cw-bubble ${mine ? "cw-me" : "cw-you"}`}>
        {!mine && (
          <div className="cw-sender">
            {msg.senderName ?? `사용자#${msg.senderId}`}
          </div>
        )}
        {msg.text && <div className="cw-text">{msg.text}</div>}
        {!!msg.attachments?.length && (
          <div className="cw-attachwrap">
            {msg.attachments.map((a, i) => (
              <a
                key={a.id ?? `${a.name ?? "파일"}-${i}`}
                href={a.url}
                target="_blank"
                rel="noreferrer"
                className="cw-attach"
              >
                📎 {a.name ?? "첨부파일"}
              </a>
            ))}
          </div>
        )}
        <div className="cw-time">{msg.timeLabel}</div>
      </div>
    </div>
  );
}

export default function ChatWindowView(props) {
  const {
    chatroomId,
    chatroomName,
    currentUserId,

    groups = [],
    hasMore = false,

    scrollerRef,
    bottomRef,
    onScroll,

    input = "",
    onInputChange,
    sending = false,
    onSend,

    files = [],
    onPickFiles,
    onRemoveFileAt,

    onClose, // 상위에서 넘겨줄 수도 있고, 아닐 수도 있음
    loading = false,
    error = null,
    onReload,
  } = props;

  const handleCloseClick = () => {
    // 1) 메인 페이지에게 "메신저 띄워라" 신호 보내기
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("OPEN_MESSENGER_FROM_CHAT")
      );
    }

    // 2) 원래 있던 닫기 동작도 그대로 수행 (채팅방 뷰 닫기)
    if (typeof onClose === "function") {
      onClose();
    }
  };

  return (
    <div className="cw-root">
      {/* 헤더 */}
      <div className="cw-header">
        <div className="cw-titlewrap">
          <div className="cw-title">{chatroomName}</div>
          <div className="cw-subtitle">채팅방 #{chatroomId}</div>
        </div>

        {/* X 버튼 */}
        <button type="button" onClick={handleCloseClick}>
          ✖
        </button>
      </div>

      {/* 로딩/에러 */}
      {loading && (
        <div style={{ padding: 12, color: "#666" }}>메시지 불러오는 중…</div>
      )}
      {error && !loading && (
        <div style={{ padding: 12, color: "crimson" }}>
          불러오기 실패: {String(error)}
          {onReload && (
            <button
              type="button"
              className="cw-retry"
              onClick={onReload}
              style={{ marginLeft: 8 }}
            >
              다시 시도
            </button>
          )}
        </div>
      )}

      {/* 메시지 리스트 */}
      <div ref={scrollerRef} onScroll={onScroll} className="cw-scroll">
        {hasMore && (
          <div className="cw-hint">위로 스크롤하여 이전 메시지 불러오기</div>
        )}

        {groups.map(({ dayLabel, items }) => (
          <div key={dayLabel}>
            <DateDivider when={dayLabel} />
            {items.map((m) => (
              <Bubble
                key={m.id}
                msg={m}
                mine={m.senderId === currentUserId}
              />
            ))}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div className="cw-footer">
        {/* ✅ 여기서 현재 채팅방 ID를 ChatForm 으로 넘겨줌 */}
        <ChatInputForm
          chatroomId={chatroomId}
          onInserted={onReload} // 전송 후 다시 불러오기
        />
      </div>
    </div>
  );
}

ChatWindowView.propTypes = {
  chatroomId: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired,
  chatroomName: PropTypes.string.isRequired,
  currentUserId: PropTypes.number.isRequired,

  groups: PropTypes.array,
  hasMore: PropTypes.bool,

  scrollerRef: PropTypes.any,
  bottomRef: PropTypes.any,
  onScroll: PropTypes.func,

  input: PropTypes.string,
  onInputChange: PropTypes.func,
  sending: PropTypes.bool,
  onSend: PropTypes.func,

  files: PropTypes.array,
  onPickFiles: PropTypes.func,
  onRemoveFileAt: PropTypes.func,

  onClose: PropTypes.func,
  loading: PropTypes.bool,
  error: PropTypes.any,
  onReload: PropTypes.func,
};
