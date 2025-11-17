import mysql from "mysql2/promise";

export async function POST(req) {
  try {
    const { enrollment_id, grade } = await req.json();
    const id = parseInt(enrollment_id, 10);
    console.log("📩 받은 데이터:", id, grade);

    const conn = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "1234",   // 🔹 실제 비밀번호 입력
      database: "univer", // 🔹 DB 이름 Workbench와 동일해야 함
    });

    // ✅ 새 데이터 추가 (없으면 추가, 있으면 수정)
    const [result] = await conn.execute(
      `
      INSERT INTO grade (enrollment_id, grade)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE
        grade = VALUES(grade)
      `,
      [id, grade]
    );

    console.log("🧾 SQL 결과:", result);
    await conn.end();

    return new Response(
      JSON.stringify({
        success: true,
        message: "성적이 DB에 반영되었습니다 (INSERT or UPDATE).",
        result,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("❌ DB 저장 실패:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
