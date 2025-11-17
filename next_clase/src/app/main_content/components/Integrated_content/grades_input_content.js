'use client';
import { useState, useEffect } from "react";

export default function GradesInputContent() {
  /* -----------------------------
      🔵 상태 변수
  ----------------------------- */
  const [semester, setSemester] = useState(2);
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [student, setStudent] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loginUser, setLoginUser] = useState(null); // 🔥 로그인 사용자 정보
  const [error, setError] = useState(null);

  /* -----------------------------
      🔵 1. 로그인한 사용자 정보 로드
  ----------------------------- */
  useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await fetch("/api/univer_city/user_route", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) return;

      const user = data?.result?.rows?.[0] ?? null;

      if (user) {
        setLoginUser({
          user_id: user.user_id,
          user_name: user.user_name,
          user_type: data.user_type
        });
      }
    } catch (err) {
      console.error("유저 로드 실패:", err);
    }
  };

  fetchUser();
}, []);


useEffect(() => {
  if (!loginUser) return;

  // 🔥 대소문자 구분 없이 교수 타입 체크
  if (!loginUser.user_type || loginUser.user_type.toLowerCase() !== "professor") return;

  const fetchSubjects = async () => {
    try {
      const res = await fetch(
        `/api/univer_city/select_where_route?table=Lecture&column=professor_id&value=${loginUser.user_id}`,
        { cache: "no-store" }
      );

      const data = await res.json();
      const rows = data.rows ?? [];

      const mapped = rows.map((row) => ({
        id: row.lecture_id,
        name: row.lecture_name,
        professor: loginUser.user_name,
        exam: "중간고사",
        score: "",
        grade: "",
      }));

      setSubjects(mapped);
    } catch (err) {
      console.error("과목 로드 오류:", err);
      setSubjects([]);
    }
  };

  fetchSubjects();
}, [loginUser]);



  /* -----------------------------
      🔵 3. 학생 목록 불러오기
  ----------------------------- */
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch("/api/univer_city/select_student_list_route");
        const data = await res.json();
        if (res.ok) setStudents(data);
        else throw new Error(data.error);
      } catch (err) {
        console.error("학생 목록 로드 실패:", err);
      }
    };
    fetchStudents();
  }, []);

  /* -----------------------------
      🔵 4. 학생 선택 시 학생 정보 불러오기
  ----------------------------- */
  useEffect(() => {
    if (!selectedId) return;

    const fetchStudent = async () => {
      try {
        const res = await fetch(`/api/univer_city/select_student_route?student_id=${selectedId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setStudent(data);
      } catch (err) {
        console.error("학생 정보 불러오기 실패:", err);
        setError("학생 정보를 불러올 수 없습니다.");
      }
    };

    fetchStudent();
  }, [selectedId]);

  /* -----------------------------
      🔵 5. 점수 → 등급 변환
  ----------------------------- */
  const getGrade = (score) => {
    if (score >= 90) return "1등급";
    if (score >= 80) return "2등급";
    if (score >= 70) return "3등급";
    if (score >= 60) return "4등급";
    if (score >= 50) return "5등급";
    if (score >= 40) return "6등급";
    return "7등급";
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

  const handleScoreChange = (id, value) => {
    let num = parseInt(value);
    if (isNaN(num)) num = "";
    if (num > 100) num = 100;
    if (num < 0) num = 0;

    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, score: num, grade: getGrade(num) } : s))
    );
  };

  /* -----------------------------
      🔵 6. 성적 저장
  ----------------------------- */
  const handleSave = async () => {
    try {
      if (!student) return alert("학생을 먼저 선택하세요!");

      for (const s of subjects) {
        const letterGrade = getLetterGrade(s.score);

        const payload = {
          student_id: selectedId,
          subject: s.name,
          grade: letterGrade,
          semester: Number(semester),
        };

        const res = await fetch("/api/univer_city/update_grade_route", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await res.json();

        if (!res.ok) throw new Error(result.error || "성적 저장 실패");
      }

      alert(`성적이 성공적으로 저장되었습니다!`);
    } catch (err) {
      console.error("저장 오류:", err);
      alert("저장 중 오류 발생");
    }
  };

  /* -----------------------------
      🔵 7. 초기화
  ----------------------------- */
  const handleReset = () => {
    setSubjects((prev) => prev.map((s) => ({ ...s, score: "", grade: "" })));
  };

  /* -----------------------------
      🔵 화면 렌더링
  ----------------------------- */
  return (
    <>
      <header className="topbar">
        <div className="crumbs">HOME / 성적 관리</div>
        <div className="todayDate">{new Date().toLocaleDateString()}</div>
      </header>

      <main className="main">
        {/* 제목 / 학기 / 학생 선택 */}
        <div className="titleRow" style={{ display: "flex", justifyContent: "space-between", marginBottom: "25px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <h1 className="title" style={{ fontSize: "26px", fontWeight: "700" }}>성적 입력</h1>
            <select value={semester} onChange={(e) => setSemester(Number(e.target.value))}>
              <option value={1}>1학기</option>
              <option value={2}>2학기</option>
            </select>
          </div>

          <div>
            <select
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

        {/* 과목별 성적 입력 */}
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
                    <td>{s.name}<div className="sub">담당: {s.professor}</div></td>
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
                    <td>{s.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer className="bottomBar">
        <button className="btn ghost" onClick={handleReset}>초기화</button>
        <button className="btn primary" onClick={handleSave}>저장하기</button>
      </footer>
    </>
  );
}
