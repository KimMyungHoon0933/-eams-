// src/app/api/univer_city/select_student_route/route.js
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = parseInt(searchParams.get("student_id"));

    if (!studentId) {
      return Response.json({ error: "student_id가 필요합니다." }, { status: 400 });
    }

    // ✅ user_id 기준으로 조인 (student_id와 일치)
    const [rows] = await db.query(
      `
      SELECT
        u.user_id AS student_id,
        u.user_name AS name,
        d.department_name AS department,
        s.grade_class AS grade_class,
        u.phone,
        u.address
      FROM student s
      JOIN user u ON s.student_id = u.user_id
      JOIN department d ON u.department_id = d.department_id
      WHERE u.user_id = ?;
      `,
      [studentId]
    );

    if (rows.length === 0) {
      return Response.json({ error: "해당 학생을 찾을 수 없습니다." }, { status: 404 });
    }

    return Response.json(rows[0]);
  } catch (err) {
    console.error("❌ DB 쿼리 오류:", err);
    return Response.json({ error: "DB 조회 중 오류 발생" }, { status: 500 });
  }
}
