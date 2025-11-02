// src/app/integreate/componate/MessageList.js
import MessageItem from "./MessageItem";

export default function MessageList({ items = [] }) {
  return (
    <main className="list" role="list">
      {items.map((it) => (
        <MessageItem key={it.id ?? it.name} {...it} />
      ))}
    </main>
  );
}
