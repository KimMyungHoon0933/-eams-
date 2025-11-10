import { db } from "@/lib/db";

export async function POST(req) {
  try {
    const { student_id, subject, grade, semester } = await req.json();

    if (!student_id || !subject || !grade || !semester) {
      return Response.json({ error: "필수 데이터 누락" }, { status: 400 });
    }

    console.log("📦 입력 데이터:", { student_id, subject, grade, semester });

    // ✅ Lecture 찾기
    const [lectureRows] = await db.query(
      `SELECT lecture_id FROM Lecture WHERE lecture_name = ? AND lecture_semester = ? LIMIT 1`,
      [subject, semester]
    );

    if (lectureRows.length === 0) {
      console.error(`❌ Lecture 데이터 없음: ${subject}, ${semester}`);
      return Response.json(
        { error: `해당 과목(${subject})의 ${semester}학기 강의 정보가 없습니다.` },
        { status: 400 }
      );
    }

    const lecture_id = lectureRows[0].lecture_id;

    // ✅ Enrollment 찾기 (없으면 생성)
    const [enrollRows] = await db.query(
      `SELECT enrollment_id FROM Enrollment WHERE lecture_id = ? AND student_id = ? LIMIT 1`,
      [lecture_id, student_id]
    );

    let enrollment_id;
    if (enrollRows.length === 0) {
      const [insertEnroll] = await db.query(
        `INSERT INTO Enrollment (lecture_id, student_id, lecture_year, lecture_semester, lecture_hours)
         VALUES (?, ?, '2025년', ?, 3)`,
        [lecture_id, student_id, semester]
      );
      enrollment_id = insertEnroll.insertId;
      console.log("🆕 Enrollment 새로 생성됨:", enrollment_id);
    } else {
      enrollment_id = enrollRows[0].enrollment_id;
      console.log("🔁 기존 Enrollment 사용:", enrollment_id);
    }

    // ✅ Grade 찾기 (없으면 추가, 있으면 업데이트)
    const [gradeRows] = await db.query(
      `SELECT grade_id FROM Grade WHERE enrollment_id = ? LIMIT 1`,
      [enrollment_id]
    );

    if (gradeRows.length > 0) {
      await db.query(`UPDATE Grade SET grade = ? WHERE enrollment_id = ?`, [
        grade,
        enrollment_id,
      ]);
      console.log("✏️ Grade 업데이트 완료");
    } else {
      await db.query(`INSERT INTO Grade (enrollment_id, grade) VALUES (?, ?)`, [
        enrollment_id,
        grade,
      ]);
      console.log("🆕 Grade 추가 완료");
    }

    return Response.json({ success: true, message: "성적 저장 완료" });
  } catch (err) {
    console.error("❌ 서버 내부 오류:", err.message);
    return Response.json(
      { error: "서버 오류 발생: " + err.message },
      { status: 500 }
    );
  }
}
