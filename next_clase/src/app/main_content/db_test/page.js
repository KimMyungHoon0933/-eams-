

export default async function Home() {
  const res = await fetch("http://localhost:3000/api/users", { cache: "no-store" });
  const users = res.ok ? await res.json() : [];
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      hello next.js
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.id} {user.name} ({user.email ?? "no email"}) {user.age}
          </li>
        ))}
      </ul>
    </div>
  );
}