export default async function Home() {
  const res = await fetch(
    `/api/query?table=student&select=${encodeURIComponent(
      JSON.stringify(["student_id", "student_name", "phone"])
    )}`,
    { cache: "no-store" }
  );

  let body;
  let raw = "";
  try {
    raw = await res.text();
    try { body = JSON.parse(raw); } 
    catch { body = { raw }; }
  } catch {
    body = { error: "no response body" };
  }

  if (!res.ok) {
    return (
      <pre style={{ whiteSpace: "pre-wrap" }}>
{`API Error ${res.status}
${typeof body === "object" ? JSON.stringify(body, null, 2) : String(body)}`}
      </pre>
    );
  }

  // ✅ rows 변수 선언 + data→body로 수정
  const rows = body?.rows ?? [];

  return (
    <div className="font-sans p-8">
      <h1 className="text-xl mb-4">hello next.js</h1>
      <p className="text-sm text-gray-500 mb-2">SQL: {body.sql}</p>
      <ul className="space-y-1">
        {rows.map((r, i) => (
          <li key={i}>
            {r.student_id} / {r.student_name} / {r.phone ?? "no phone"}
          </li>
        ))}
      </ul>
    </div>
  );
}
