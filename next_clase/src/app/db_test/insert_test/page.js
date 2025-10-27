
// src/app/db_test/page.js  (전체 교체)

// Next.js 서버 컴포넌트에서 테스트용으로 1건 INSERT 실행
export const dynamic = "force-dynamic";

export default async function Home() {
  // 🔧 필요에 맞게 테이블/컬럼/값 수정하세요.
  const payload = {
    table: "department", // 예: 이전 테스트에서 사용하던 테이블명
    data: {
      // student_id 가 AUTO_INCREMENT라면 넣지 마세요.
      department_name: "테스트학과",
      established_date: "2025-01-01",                 // CHECK: '^[1-9]/[A-Z]$'
      capacity: 1
    },
  };

  // INSERT 호출 (POST + JSON 바디)
const url = new URL("http://localhost:3000/api/univer_city/insert_route");

const cols = ["department_id","department_name","established_date","capacity"];
const values = [
  [1001,"컴공과-1001","1990-03-01",200],
  [1002,"전자과-1002","1992-03-01",180],
];

url.searchParams.set("table", "department");
url.searchParams.set("cols", JSON.stringify(cols));
url.searchParams.set("values", JSON.stringify(values));

const res = await fetch(url.toString(), { cache: "no-store" });


  // 응답 바디를 안전하게 처리 (텍스트 → 가능하면 JSON 파싱)
  let body;
  let raw = "";
  try {
    raw = await res.text();
    try {
      body = JSON.parse(raw);
    } catch {
      body = { raw }; // JSON 아니면 원문 노출
    }
  } catch {
    body = { error: "no response body" };
  }

  // 에러 응답 처리
  if (!res.ok) {
    return (
      <div className="font-sans p-8">
        <h1 className="text-xl mb-4">INSERT 테스트</h1>
        <pre style={{ whiteSpace: "pre-wrap" }}>
{`API Error ${res.status}
${typeof body === "object" ? JSON.stringify(body, null, 2) : String(body)}`}
        </pre>
      </div>
    );
  }

  // 성공 응답 표시 (insertId, affectedRows, 디버그 sql 등)
  const {
    insertId = null,
    affectedRows = null,
    rowsSent = null,
    sql = "(hidden)",
  } = body || {};

  return (
    <div className="font-sans p-8">
      <h1 className="text-xl mb-4">INSERT 테스트</h1>

      <h2 className="text-base font-semibold mt-2 mb-1">요청 페이로드</h2>
      <pre className="text-sm bg-gray-100 p-3 rounded">
        {JSON.stringify(payload, null, 2)}
      </pre>

      <h2 className="text-base font-semibold mt-4 mb-1">응답</h2>
      <ul className="text-sm space-y-1">
        <li>insertId: {String(insertId)}</li>
        <li>affectedRows: {String(affectedRows)}</li>
        <li>rowsSent: {String(rowsSent)}</li>
      </ul>

      <h2 className="text-base font-semibold mt-4 mb-1">SQL (디버그)</h2>
      <pre className="text-sm bg-gray-100 p-3 rounded">{sql}</pre>

      {/* 원문/전체 응답 확인용 */}
      <details className="mt-4">
        <summary className="cursor-pointer text-sm text-gray-600">원문 응답 보기</summary>
        <pre className="text-xs bg-gray-50 p-3 rounded mt-2">
          {typeof body === "object" ? JSON.stringify(body, null, 2) : String(body)}
        </pre>
      </details>
    </div>
  );
}