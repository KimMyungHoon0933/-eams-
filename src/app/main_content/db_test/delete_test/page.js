// src/app/db_test/delete/page.js  (전체 교체)
export const dynamic = "force-dynamic";

export default async function DeleteTest() {
  // 🔧 테스트: department 테이블에서 id 1001, 1002 삭제
  // (너가 방금 INSERT 테스트로 넣었던 예시와 매칭)
  const whereJson = { department_id: [1003] };

  const url = new URL("http://localhost:3000/api/univer_city/delete_route");
  url.searchParams.set("table", "department");
  url.searchParams.set("where", JSON.stringify(whereJson));

  const res = await fetch(url.toString(), { cache: "no-store" });

  // 응답 안전 파싱
  let body;
  let raw = "";
  try {
    raw = await res.text();
    try {
      body = JSON.parse(raw);
    } catch {
      body = { raw };
    }
  } catch {
    body = { error: "no response body" };
  }

  if (!res.ok) {
    return (
      <div className="font-sans p-8">
        <h1 className="text-xl mb-4">DELETE 테스트</h1>
        <pre style={{ whiteSpace: "pre-wrap" }}>
{`API Error ${res.status}
${typeof body === "object" ? JSON.stringify(body, null, 2) : String(body)}`}
        </pre>
      </div>
    );
  }

  const {
    affectedRows = null,
    warningStatus = null,
    sql = "(hidden)",
  } = body || {};

  return (
    <div className="font-sans p-8">
      <h1 className="text-xl mb-4">DELETE 테스트</h1>

      <h2 className="text-base font-semibold mt-2 mb-1">요청 파라미터</h2>
      <pre className="text-sm bg-gray-100 p-3 rounded">
        {JSON.stringify({ table: "department", where: whereJson }, null, 2)}
      </pre>

      <h2 className="text-base font-semibold mt-4 mb-1">응답</h2>
      <ul className="text-sm space-y-1">
        <li>affectedRows: {String(affectedRows)}</li>
        <li>warningStatus: {String(warningStatus)}</li>
      </ul>

      <h2 className="text-base font-semibold mt-4 mb-1">SQL (디버그)</h2>
      <pre className="text-sm bg-gray-100 p-3 rounded">{sql}</pre>

      <details className="mt-4">
        <summary className="cursor-pointer text-sm text-gray-600">원문 응답 보기</summary>
        <pre className="text-xs bg-gray-50 p-3 rounded mt-2">
          {typeof body === "object" ? JSON.stringify(body, null, 2) : String(body)}
        </pre>
      </details>
    </div>
  );
}

