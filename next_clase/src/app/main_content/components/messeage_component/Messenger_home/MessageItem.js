// src/app/integreate/componate/MessageItem.js
export default function MessageItem({
  name,
  initial,
  time,
  preview,
  unread = false,
  pinned = false,
  muted = false,
  count = 0,
  onClick,
  href = "#",
}) {
  const cls = ["chat", unread && "unread", pinned && "pinned", muted && "muted"]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={cls}
      role="listitem"
      onClick={onClick}
      style={{
        all: "unset",
        display: "block",
        width: "100%",
        cursor: "pointer",
        padding: "8px 10px",
      }}
      data-href={href}
    >
      {/* 한 줄 정렬: 프로필(자) + 채팅방 이름 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        {/* 아바타 */}
        <div
          className="avatar lg"
          data-initial={initial}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            backgroundColor: "#ececec",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: "18px",
            flexShrink: 0,
          }}
        >
          {initial}
        </div>

        {/* 오른쪽 영역 */}
        <div
          className="msg-content"
          style={{
            flexGrow: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* 상단: 채팅방 이름 + 시간 */}
          <div
            className="top"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 2,
            }}
          >
            <span
              className="name"
              style={{
                fontWeight: unread ? "700" : "500",
                fontSize: "15px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {name}
            </span>
            <time
              className="time"
              style={{ fontSize: "12px", color: "#999", marginLeft: 8 }}
            >
              {time}
            </time>
          </div>

          {/* 하단: 미리보기 */}
          <div
            className="bottom"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              className="preview"
              style={{
                fontSize: "13px",
                color: "#777",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {preview}
            </span>

            {(count > 0 || pinned || muted) && (
              <span className="badges" style={{ marginLeft: 6 }}>
                {count > 0 && (
                  <span
                    className="pill count"
                    style={{
                      background: "#ff6b6b",
                      color: "#fff",
                      borderRadius: "10px",
                      padding: "0 6px",
                      fontSize: "12px",
                    }}
                  >
                    {count}
                  </span>
                )}
                {pinned && <span title="고정">📌</span>}
                {muted && <span title="음소거">🔕</span>}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
