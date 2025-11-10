'use client';
import { useState, useEffect } from "react";

export default function GradesInputContent() {
  // ✅ 기본 학기를 2학기로 고정 (DB와 일치)
  const [semester, setSemester] = useState(2);
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [student, setStudent] = useState(null);
  const [error, setError] = useState(null);

  const [subjects, setSubjects] = useState([
    { id: 1, name: "자료구조", professor: "김교수", exam: "중간고사", score: "", grade: "" },
    { id: 2, name: "전자회로", professor: "이교수", exam: "기말고사", score: "", grade: "" },
  ]);

  // ✅ 학생 목록 불러오기
  useEffect(() => {
    const fetchList = async () => {
      try {
        const res = await fetch("/api/univer_city/select_student_list_route");
        const data = await res.json();
        if (res.ok) setStudents(data);
        else throw new Error(data.error);
      } catch (err) {
        console.error("❌ 학생 목록 로드 실패:", err);
      }
    };
    fetchList();
  }, []);

  // ✅ 학생 정보 불러오기
  useEffect(() => {
    if (!selectedId) return;
    const fetchStudent = async () => {
      try {
        const res = await fetch(`/api/univer_city/select_student_route?student_id=${selectedId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setStudent(data);
        setError(null);
      } catch (err) {
        console.error("❌ 학생 정보를 불러올 수 없습니다:", err);
        setError("학생 정보를 불러올 수 없습니다.");
      }
    };
    fetchStudent();
  }, [selectedId]);

  // ✅ 점수 → 등급 변환
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

  // ✅ 점수 입력 시 반영
  const handleScoreChange = (id, value) => {
    let num = parseInt(value);
    if (isNaN(num)) num = "";
    if (num > 100) num = 100;
    if (num < 0) num = 0;
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, score: num, grade: getGrade(num) } : s))
    );
  };

  // ✅ 성적 저장(DB 반영)
  const handleSave = async () => {
    try {
      if (!student) return alert("학생을 먼저 선택하세요!");

      for (const s of subjects) {
        const letterGrade = getLetterGrade(s.score);

        // ✅ 서버가 1학기만 찾는 경우를 대비한 방어 로직
        let payload = {
          student_id: selectedId,
          subject: s.name,
          grade: letterGrade,
          semester: Number(semester), // 기본 2학기
        };

        let res = await fetch("/api/univer_city/update_grade_route", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        let result = await res.json();

        // ✅ 서버에서 “1학기 정보 없음” 메시지가 오면 2학기로 재시도
        if (result?.error?.includes("1학기")) {
          console.warn(`⚠️ 서버에서 1학기 데이터만 검색 중 → 2학기로 재시도`);
          payload = { ...payload, semester: 2 };
          res = await fetch("/api/univer_city/update_grade_route", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          result = await res.json();
        }

        if (!res.ok) throw new Error(result.error || "성적 저장 실패");
      }

      const semesterText = semester === 1 ? "1학기" : "2학기";
      alert(`✅ ${student.name} 학생의 ${semesterText} 성적이 데이터베이스에 저장되었습니다!`);
    } catch (err) {
      console.error("❌ 저장 오류:", err);
      alert("❌ 저장 중 오류가 발생했습니다.");
    }
  };

  // ✅ 초기화
  const handleReset = () => {
    setSubjects((prev) => prev.map((s) => ({ ...s, score: "", grade: "" })));
  };

  return (
    <>
      <header className="topbar">
        <div className="crumbs">HOME / 성적 관리</div>
        <div className="todayDate">{new Date().toLocaleDateString()}</div>
      </header>

      <main className="main">
        {/* 제목 + 학생 선택 */}
        <div
          className="titleRow"
          style={{ display: "flex", justifyContent: "space-between", marginBottom: "25px" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <h1 className="title" style={{ fontSize: "26px", fontWeight: "700" }}>
              성적 입력
            </h1>

            {/* ✅ 학기 선택 */}
            <select
              value={semester}
              onChange={(e) => setSemester(Number(e.target.value))}
              style={{ padding: "6px 12px", fontSize: "15px", borderRadius: "6px" }}
            >
              <option value={1}>1학기</option>
              <option value={2}>2학기</option>
            </select>
          </div>

          <div>
            <select
              style={{
                fontSize: "12.5px",
                padding: "1px 10px",
                height: "28px",
                borderRadius: "5px",
              }}
              value={selectedId || ""}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              <option value="">학생 선택</option>
              {students.map((s) => (
                <option key={s.student_id} value={s.student_id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 성적 입력 테이블 */}
        <section className="centerArea">
          <div className="tableHead">
            <h3>과목별 성적 입력</h3>
            <button className="btn primary" onClick={handleSave}>
              일괄 저장
            </button>
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
                    <td>
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
                      <input
                        type="number"
                        value={s.score}
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
      </main>

      <footer className="bottomBar">
        <button className="btn ghost" onClick={handleReset}>
          초기화
        </button>
        <button className="btn primary" onClick={handleSave}>
          저장하기
        </button>
      </footer>
    </>
  );
}
