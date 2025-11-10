// src/app/api/univer_city/select_student_list_route/route.js
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT 
        s.student_id, 
        u.user_name AS name, 
        d.department_name AS department, 
        s.grade_class
      FROM student s
      JOIN user u ON s.student_id = u.user_id
      JOIN department d ON u.department_id = d.department_id
      ORDER BY s.student_id ASC;
    `);

    return Response.json(rows);
  } catch (err) {
    console.error("❌ 학생 리스트 조회 오류:", err);
    return Response.json({ error: "학생 목록을 불러오는 중 오류 발생" }, { status: 500 });
  }
}
