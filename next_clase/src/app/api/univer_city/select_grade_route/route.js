import { db } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const semester = searchParams.get("semester"); // 1 or 2

    // ✅ 기본 쿼리
    let query = `
      SELECT 
        s.student_id,
        u.user_name AS student_name,
        d.department_name,
        l.lecture_name AS subject,
        p.lab AS professor_name,
        g.grade,
        l.lecture_year,
        l.lecture_semester
      FROM grade g
      JOIN enrollment e ON g.enrollment_id = e.enrollment_id
      JOIN student s ON e.student_id = s.student_id
      JOIN user u ON s.student_id = u.user_id
      JOIN lecture l ON e.lecture_id = l.lecture_id
      JOIN professor p ON l.professor_id = p.professor_id
      JOIN department d ON u.department_id = d.department_id
    `;

    const params = [];

    // ✅ 학기별 필터링
    if (semester) {
      query += " WHERE l.lecture_semester = ?";
      params.push(Number(semester));
    }

    query += " ORDER BY l.lecture_year DESC, l.lecture_semester ASC;";

    const [rows] = await db.query(query, params);
    return Response.json(rows);
  } catch (err) {
    console.error("❌ DB 조회 오류:", err);
    return Response.json({ error: "DB 조회 실패" }, { status: 500 });
  }
}
