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
  href = "#",
}) {
  const cls = ["chat", unread && "unread", pinned && "pinned", muted && "muted"]
    .filter(Boolean)
    .join(" ");

  return (
    <a className={cls} href={href} role="listitem">
      <div className="avatar lg" data-initial={initial}></div>
      <div className="msg-content">
        <div className="top">
          <span className="name">{name}</span>
          <time className="time">{time}</time>
        </div>
        <div className="bottom">
          <span className="preview">{preview}</span>
          {(count > 0 || pinned || muted) && (
            <span className="badges">
              {count > 0 && <span className="pill count">{count}</span>}
              {pinned && (
                <span className="pill pin" title="고정">
                  📌
                </span>
              )}
              {muted && <span className="pill mute">🔕</span>}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}
