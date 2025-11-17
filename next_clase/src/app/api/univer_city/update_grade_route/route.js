import { db } from "@/lib/db";

export async function POST(req) {
  try {
    const { student_id, subject, grade, semester } = await req.json();

    // 필수값 검증
    if (!student_id || !subject || !grade || !semester) {
      return Response.json({ error: "필수 데이터 누락" }, { status: 400 });
    }

    console.log("📦 입력 데이터:", { student_id, subject, grade, semester });

    /*
     -------------------------------------------------------
      1) Lecture 찾기 (학기는 쓰지 않음 — 이름으로만 찾기)
     -------------------------------------------------------
    */
    const [lectureRows] = await db.query(
      `SELECT lecture_id, professor_id, lecture_year 
       FROM lecture 
       WHERE lecture_name = ?
       LIMIT 1`,
      [subject]
    );

    if (lectureRows.length === 0) {
      return Response.json(
        { error: `${subject} 과목의 Lecture 데이터가 존재하지 않습니다.` },
        { status: 400 }
      );
    }

    const { lecture_id, lecture_year } = lectureRows[0];

    console.log("✅ Lecture 매칭:", {
      lecture_id,
      lecture_year
    });

    /*
     -------------------------------------------------------
      2) Enrollment 찾기 (🔥 여기서 학기를 반드시 사용해야 함)
     -------------------------------------------------------
    */
    const [enrollRows] = await db.query(
      `SELECT enrollment_id 
       FROM enrollment 
       WHERE lecture_id = ? AND student_id = ? AND lecture_semester = ?
       LIMIT 1`,
      [lecture_id, student_id, semester]   // 🔥 학기 조건 추가
    );

    let enrollment_id;

    if (enrollRows.length === 0) {
      // Enrollment 신규 생성 (🔥 학생이 선택한 학기 그대로 사용)
      const [insertEnroll] = await db.query(
        `INSERT INTO enrollment 
         (lecture_id, student_id, lecture_year, lecture_semester, lecture_hours)
         VALUES (?, ?, ?, ?, 3)`,
        [lecture_id, student_id, lecture_year, semester]   // ← semester 사용
      );

      enrollment_id = insertEnroll.insertId;
      console.log("🆕 Enrollment 생성:", enrollment_id);
    } else {
      enrollment_id = enrollRows[0].enrollment_id;
      console.log("🔁 기존 Enrollment 사용:", enrollment_id);
    }

    /*
     -------------------------------------------------------
      3) Grade 테이블 업데이트 또는 삽입
     -------------------------------------------------------
    */
    const [gradeRows] = await db.query(
      `SELECT * FROM grades WHERE enrollment_id = ? LIMIT 1`,
      [enrollment_id]
    );

    if (gradeRows.length > 0) {
      await db.query(
        `UPDATE grades SET grade = ? WHERE enrollment_id = ?`,
        [grade, enrollment_id]
      );
      console.log("✏️ Grade 업데이트 완료");
    } else {
      await db.query(
        `INSERT INTO grades (enrollment_id, grade) VALUES (?, ?)`,
        [enrollment_id, grade]
      );
      console.log("🆕 Grade 추가 완료");
    }

    return Response.json({ success: true, message: "성적 저장 완료" });

  } catch (err) {
    console.error("❌ 서버 내부 오류:", err);
    return Response.json({ error: "서버 오류: " + err.message }, { status: 500 });
  }
}
