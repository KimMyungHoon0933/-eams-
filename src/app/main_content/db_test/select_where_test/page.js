// app/page.js (server component)
import { headers } from "next/headers";

export default async function Page() {
  // ★ route.js 위치가 app/api/univer_city/select_route/route.js 라고 가정
  const url = new URL("http://localhost:3000/api/univer_city/select_where_route");
  url.searchParams.set("table", "department");
  url.searchParams.set(
    "select",
    JSON.stringify(["department_name", "established_date", "capacity"])
  );

  // ✅ where 파라미터 예시 (요청대로 id=1)
  url.searchParams.set("where", "department_name LIKE '%전자과%'");

  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();

  if (!res.ok) {
    return <pre>{`API Error ${res.status}\n${JSON.stringify(data, null, 2)}`}</pre>;
  }

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
