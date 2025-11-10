import { db } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const semester = searchParams.get("semester"); // "1", "2", or "전체"

    // ✅ 안전하고 누락 방지된 쿼리
    let query = `
      SELECT 
        s.student_id,
        u.user_name AS student_name,
        d.department_name,
        COALESCE(l.lecture_name, '-') AS subject,       -- 과목명 NULL 방지
        COALESCE(p.lab, '-') AS professor_name,         -- 교수명 NULL 방지
        g.grade,
        COALESCE(l.lecture_year, e.lecture_year) AS lecture_year,
        COALESCE(l.lecture_semester, e.lecture_semester) AS lecture_semester
      FROM grade g
      LEFT JOIN enrollment e ON g.enrollment_id = e.enrollment_id
      LEFT JOIN student s ON e.student_id = s.student_id
      LEFT JOIN user u ON s.student_id = u.user_id
      LEFT JOIN lecture l ON e.lecture_id = l.lecture_id
      LEFT JOIN professor p ON l.professor_id = p.professor_id
      LEFT JOIN department d ON u.department_id = d.department_id
    `;

    const params = [];

    // ✅ 학기별 필터링 (전체 보기 포함)
    if (semester && semester !== "전체") {
      query += " WHERE l.lecture_semester = ?";
      params.push(Number(semester));
    }

    // ✅ 정렬 순서 (연도 → 학기 → 이름)
    query += `
      ORDER BY 
        COALESCE(l.lecture_year, e.lecture_year) DESC,
        COALESCE(l.lecture_semester, e.lecture_semester) ASC,
        u.user_name ASC;
    `;

    const [rows] = await db.query(query, params);

    console.log("✅ 성적 데이터 조회 완료:", rows.length, "건");
    return Response.json(rows);
  } catch (err) {
    console.error("❌ DB 조회 오류:", err);
    return Response.json({ error: "DB 조회 실패: " + err.message }, { status: 500 });
  }
}
