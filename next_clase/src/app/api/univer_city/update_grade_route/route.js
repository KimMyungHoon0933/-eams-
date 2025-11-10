import { db } from "@/lib/db";

export async function POST(req) {
  try {
    const { student_id, subject, grade, semester } = await req.json();

    if (!student_id || !subject || !grade || !semester) {
      return Response.json({ error: "필수 데이터 누락" }, { status: 400 });
    }

    console.log("📦 입력 데이터:", { student_id, subject, grade, semester });

    // ✅ Lecture 찾기 — 학기 불일치 시 보정 검색
    let [lectureRows] = await db.query(
      `SELECT lecture_id, professor_id FROM Lecture WHERE lecture_name = ? AND lecture_semester = ? LIMIT 1`,
      [subject, semester]
    );

    if (lectureRows.length === 0) {
      console.warn(`⚠️ ${subject} (${semester}학기) 과목이 없어 학기 무시 검색으로 재시도합니다.`);
      [lectureRows] = await db.query(
        `SELECT lecture_id, professor_id FROM Lecture WHERE lecture_name = ? LIMIT 1`,
        [subject]
      );
    }

    if (lectureRows.length === 0) {
      return Response.json(
        { error: `해당 과목(${subject})의 강의 정보가 존재하지 않습니다.` },
        { status: 400 }
      );
    }

    const { lecture_id, professor_id } = lectureRows[0];
    console.log("✅ 매칭된 Lecture:", { lecture_id, professor_id });

    // ✅ Enrollment 찾기 또는 생성
    const [enrollRows] = await db.query(
      `SELECT enrollment_id FROM Enrollment WHERE lecture_id = ? AND student_id = ? LIMIT 1`,
      [lecture_id, student_id]
    );

    let enrollment_id;
    const lectureYear = new Date().getFullYear().toString();

    if (enrollRows.length === 0) {
      const [insertEnroll] = await db.query(
        `INSERT INTO Enrollment (lecture_id, student_id, lecture_year, lecture_semester, lecture_hours)
         VALUES (?, ?, ?, ?, 3)`,
        [lecture_id, student_id, lectureYear, semester]
      );
      enrollment_id = insertEnroll.insertId;
      console.log("🆕 Enrollment 새로 생성:", enrollment_id);
    } else {
      enrollment_id = enrollRows[0].enrollment_id;
      console.log("🔁 기존 Enrollment 사용:", enrollment_id);
    }

    // ✅ Grade 처리
    const [gradeRows] = await db.query(
      `SELECT enrollment_id FROM Grade WHERE enrollment_id = ? LIMIT 1`,
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
