// app/page.js (server component)
import { headers } from "next/headers";

export default async function Page() {
  const host = headers().get("host");
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? `http://${host}`;

  // ★ route.js 위치가 app/api/univer_city/select_route/route.js 라고 가정
  const url = new URL("/api/univer_city/select_route", base);
  url.searchParams.set("table", "department");
  url.searchParams.set(
    "select",
    JSON.stringify(["department_name", "established_date", "capacity"])
  );

  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();

  if (!res.ok) {
    return <pre>{`API Error ${res.status}\n${JSON.stringify(data, null, 2)}`}</pre>;
  }

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
