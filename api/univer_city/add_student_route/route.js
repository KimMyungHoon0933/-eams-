// 3️⃣ lecture 목록 조회 → 자동 enrollment 생성
const [lectures] = await db.query(`SELECT * FROM lecture`);

for (const lec of lectures) {

  // --- 1학기 Enrollment 생성 ---
  await db.query(
    `INSERT INTO enrollment 
      (student_id, lecture_id, lecture_year, lecture_semester, lecture_hours)
     VALUES (?, ?, ?, ?, ?)`,
    [
      user_id,
      lec.lecture_id,
      lec.lecture_year,
      1,          // 🔥 강제로 1학기
      lec.credit
    ]
  );

  // --- 2학기 Enrollment 생성 ---
  await db.query(
    `INSERT INTO enrollment 
      (student_id, lecture_id, lecture_year, lecture_semester, lecture_hours)
     VALUES (?, ?, ?, ?, ?)`,
    [
      user_id,
      lec.lecture_id,
      lec.lecture_year,
      2,          // 🔥 강제로 2학기
      lec.credit
    ]
  );
}
