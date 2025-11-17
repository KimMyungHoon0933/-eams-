// /main_content/db_test/update_test/page.js

// 서버 컴포넌트 (Next.js app router)
export default async function UpdateTestPage() {
  let message = "";

  // 라우터 URL
  const url = new URL("http://localhost:3000/api/univer_city/update_route");

  // ✅ 수정할 컬럼/값 설정
  const cols = ["address"];
  const values = ["서울시 구로구"];

  // ✅ 어떤 테이블/조건인지 설정
  url.searchParams.set("table", "user");
  url.searchParams.set("cols", JSON.stringify(cols));
  url.searchParams.set("values", JSON.stringify(values));
  url.searchParams.set("where", "user_id = 7");

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    const body = await res.json();

    if (!res.ok || body.error) {
      console.error("에러:", body.error ?? body);
      message = `에러: ${body.error ?? "알 수 없는 에러가 발생했습니다."}`;
    } else {
      console.log("정상 출력되었습니다.");
      message = "정상 출력되었습니다.";
    }
  } catch (err) {
    console.error("에러:", err);
    message = `에러: ${String(err)}`;
  }

  // ✅ 화면에 출력
  return (
    <div style={{ padding: "20px" }}>
      <h1>UPDATE 테스트</h1>
      <p>{message}</p>
    </div>
  );
}
