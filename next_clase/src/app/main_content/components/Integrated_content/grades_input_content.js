'use client';
import { useState } from "react";

export function GradesInputContent() {

  const [subjects, setSubjects] = useState([
  { id: 1, name: "자료구조", professor: "김교수", exam: "중간고사", score: "", grade: "" },
  { id: 2, name: "전자회로", professor: "김교수", exam: "기말고사", score: "", grade: "" },
]);


// ✅ 점수 → 숫자 등급 변환 함수 (화면 표시용)
const getGrade = (score) => {
  if (score >= 90) return "1등급";
  if (score >= 80) return "2등급";
  if (score >= 70) return "3등급";
  if (score >= 60) return "4등급";
  if (score >= 50) return "5등급";
  if (score >= 40) return "6등급";
  if (score >= 0) return "7등급";
  return "";
};

// ✅ 점수 → 문자 학점 변환 함수 (DB 저장용)
const getLetterGrade = (score) => {
  if (score >= 95) return "A+";
  if (score >= 90) return "A";
  if (score >= 85) return "B+";
  if (score >= 80) return "B";
  if (score >= 75) return "C+";
  if (score >= 70) return "C";
  if (score >= 65) return "D+";
  if (score >= 60) return "D";
  return "F";
};



  // ✅ 점수 입력 시 즉시 반영
  const handleScoreChange = (id, value) => {
    let num = parseInt(value);
    if (isNaN(num)) num = "";
    if (num > 100) num = 100; // 최대 100점 제한
    if (num < 0) num = 0; // 최소 0점 제한

    const updated = subjects.map((s) =>
      s.id === id ? { ...s, score: num, grade: getGrade(num) } : s
    );
    setSubjects(updated);
  };

const handleSave = async () => {
  try {
    for (const s of subjects) {
      const letterGrade = getLetterGrade(s.score);

      const res = await fetch("/api/univer_city/update_grade_route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollment_id: s.id,  // 실제 enrollment_id와 매칭
          grade: letterGrade,   // ✅ 이제 DB에는 문자(A+, B...)가 들어감
        }),
      });

      const result = await res.json();
      console.log(result.message || result.error);
    }

    alert("성적이 DB에 반영되었습니다!");
  } catch (err) {
    console.error("저장 오류:", err);
    alert("저장 중 오류가 발생했습니다.");
  }
};


  // ✅ 초기화
  const handleReset = () => {
    setSubjects((prev) =>
      prev.map((s) => ({ ...s, score: "", grade: "" }))
    );
  };

  return (
    <>
      {/* ===== 상단 바 ===== */}
      <header className="topbar">
        <div className="crumbs">HOME / 성적 관리</div>
        <div className="todayDate">{new Date().toLocaleDateString()}</div>
      </header>

      <main className="main">
        {/* ===== 페이지 제목 ===== */}
        <div className="titleRow">
          <h1 className="title">성적 입력</h1>
          <select className="classSelect">
            <option>3학년 1반</option>
            <option>3학년 2반</option>
          </select>
        </div>

        {/* ===== 본문 그리드 ===== */}
        <div className="grid">
          {/* --- 1. 왼쪽 도구 컬럼 --- */}
          <aside className="toolCol">
            <div className="card">
              <h3>도구</h3>
              <div className="field">
                <span>날짜 선택</span>
                <input type="date" defaultValue="2025-09-29" />
              </div>
              <button className="btn">조회</button>
            </div>
          </aside>

          {/* --- 2. 중앙 성적표 영역 --- */}
          <section className="centerArea">
            <div className="tableHead">
              <h3>과목별 성적 입력</h3>
              <button className="btn primary" onClick={handleSave}>일괄 저장</button>
            </div>

            <div className="tableWrap">
              <table className="gradeTable">
                <thead>
                  <tr>
                    <th>과목</th>
                    <th>시험 구분</th>
                    <th>점수</th>
                    <th>등급</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((s) => (
                    <tr key={s.id}>
                      <td className="left">
                        {s.name}
                        <div className="sub">담당: {s.professor}</div>
                      </td>
                      <td>
                        <select
                          value={s.exam}
                          onChange={(e) =>
                            setSubjects((prev) =>
                              prev.map((x) =>
                                x.id === s.id ? { ...x, exam: e.target.value } : x
                              )
                            )
                          }
                        >
                          <option>중간고사</option>
                          <option>기말고사</option>
                        </select>
                      </td>
                      <td>
                        {/* ✅ 직접 점수 입력 가능, 0~100만 허용 */}
                        <input
                          type="number"
                          value={s.score}
                          min="0"
                          max="100"
                          onChange={(e) => handleScoreChange(s.id, e.target.value)}
                          placeholder="0~100"
                          style={{ width: "80px", textAlign: "center" }}
                        />
                      </td>
                      <td>
                        <output>{s.grade}</output>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* --- 3. 우측 학생 정보 컬럼 --- */}
          <aside className="infoCol">
            <div className="card">
              <h3>학생 정보</h3>
              <div className="profile">
                <div className="avatar">😊</div>
                <div className="who">
                  <div className="name">홍길동</div>
                  <div className="meta">3학년 1반 15번</div>
                </div>
              </div>
              <div className="desc">
  <div>
    <span className="icon">📞</span>
    <span>010-1234-5678</span>
  </div>
  <div>
    <span className="icon">✉️</span>
    <span>gildong@example.com</span>
  </div>
</div>

            </div>
          </aside>
        </div>
      </main>

      {/* ===== 하단 바 ===== */}
      <footer className="bottomBar">
        <span className="muted">입력한 점수를 저장할 수 있습니다.</span>
        <div className="rightRow">
          <button className="btn ghost" onClick={handleReset}>초기화</button>
          <button className="btn primary" onClick={handleSave}>저장하기</button>
        </div>
      </footer>
    </>
  );
}
