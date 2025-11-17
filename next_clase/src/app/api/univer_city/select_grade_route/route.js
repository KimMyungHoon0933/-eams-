// /api/.../grade_route/route.js
import { db } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const semester = searchParams.get("semester"); // 1, 2, 전체

    let query = `
      SELECT 
        s.student_id,
        u.user_name AS student_name,
        d.department_name,
        l.lecture_name AS lecture_name,            -- ✅ 강의명
        prof_u.user_name AS professor_name,        -- ✅ 교수 이름
        g.grade,
        e.lecture_year,
        e.lecture_semester
      FROM grades g
      JOIN enrollment e ON g.enrollment_id = e.enrollment_id
      JOIN student s ON e.student_id = s.student_id
      JOIN user u ON s.student_id = u.user_id
      JOIN department d ON u.department_id = d.department_id
      JOIN lecture l ON e.lecture_id = l.lecture_id
      JOIN professor p ON l.professor_id = p.professor_id
      JOIN user prof_u ON p.professor_id = prof_u.user_id
    `;

    const params = [];

    if (semester && semester !== "전체") {
      query += ` WHERE e.lecture_semester = ?`;
      params.push(Number(semester));
    }

    query += `
      ORDER BY 
        e.lecture_year DESC,
        e.lecture_semester ASC,
        u.user_name ASC
    `;

    const [rows] = await db.query(query, params);
    return Response.json(rows);
  } catch (err) {
    return Response.json(
      { error: "DB 조회 실패: " + err.message },
      { status: 500 }
    );
  }
}
