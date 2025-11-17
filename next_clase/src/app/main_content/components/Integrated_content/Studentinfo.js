"use client";

import { useEffect, useState } from "react";
import styles from "../css/student_info.module.css";

export default function StudentInfoContainer() {
  const [student, setStudent] = useState(null);
  const [error, setError] = useState(null);

  // 📌 개인정보 편집 모드 & 폼 상태 (전화번호 + 주소만)
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [personalForm, setPersonalForm] = useState({
    phone: "",
    address: "",
  });
  const [updateError, setUpdateError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // 📌 비밀번호 수정 모드 & 폼 상태 (회원 비밀번호만)
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    password: "",
  });
  const [passwordError, setPasswordError] = useState(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // 📌 비밀번호 보기/숨기기
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    async function fetchStudentInfo() {
      try {
        const res = await fetch("/api/univer_city/user_route", {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`API 오류: ${res.status}`);
        }

        const data = await res.json();
        console.log("현재 사용자 라우터 응답:", data);

        const result = data.result;
        const row =
          result?.rows?.[0] ??
          result?.row?.[0] ??
          result?.rows ??
          result?.row ??
          result;

        if (!row || !row.user_id) {
          throw new Error("사용자 정보를 찾을 수 없습니다.");
        }

        const mappedStudent = {
          // 기본 신상
          name: row.user_name || "이름 없음",
          student_id: String(row.user_id),
          department:
            row.department_name || row.department_id || "학과 정보 없음",
          major: row.major || "전공 정보 없음",
          grade: row.grade ?? 1,
          status: row.status || "재학",

          // 학적/입학 정보
          admission_year: row.admission_year || "",
          history: row.history || "휴·복학 이력 없음",

          // 연락처 (이메일/보호자 연락처 제거)
          phone: row.phone || "-",
          address: row.address || "-",

          // 성적/학점 (초기값)
          gpa: "-", // 나중에 grades + Lecture로 계산해서 덮어씀
          major_gpa: "-", // UI에서는 사용 안 함
          credits: 0, // 나중에 Lecture.credit 합계로 덮어씀

          // (등록/장학 정보는 이제 화면에서 사용하지 않음)
          registered: row.registered ?? true,
          scholarship: row.scholarship || "장학 정보 없음",

          // 🔐 비밀번호 (보기 기능용)
          password: row.user_password || "",

          // 수강 과목
          courses: [],
        };

        setStudent(mappedStudent);
        setError(null);
      } catch (err) {
        console.error("❌ 학생 정보 불러오기 실패:", err);
        setError(err.message || "정보를 불러오는 중 오류가 발생했습니다.");
      }
    }

    fetchStudentInfo();
  }, []);

  // 학생 정보가 로드되면 개인정보 폼 초기화 (전화번호 + 주소만)
  useEffect(() => {
    if (!student) return;
    setPersonalForm({
      phone: student.phone === "-" ? "" : student.phone,
      address: student.address === "-" ? "" : student.address,
    });
  }, [student]);

  // ✅ 성적 요약(평균 평점 + 취득학점) 조회
  useEffect(() => {
    if (!student?.student_id) return;

    async function fetchGradeSummary() {
      try {
        const params = new URLSearchParams();

        // enrollment + grades + Lecture JOIN
        params.set(
          "table",
          "enrollment e JOIN grades g ON e.enrollment_id = g.enrollment_id JOIN Lecture l ON e.lecture_id = l.lecture_id"
        );

        // grade/credit만 조회, alias로 컬럼명 단순화
        params.set(
          "select",
          JSON.stringify(["g.grade AS grade", "l.credit AS credit"])
        );

        // 현재 로그인 학생 기준
        params.set("where", `e.student_id = ${student.student_id}`);

        const res = await fetch(
          `/api/univer_city/select_where_route?${params.toString()}`,
          { cache: "no-store" }
        );

        if (!res.ok) {
          throw new Error(`성적 조회 실패: ${res.status}`);
        }

        const data = await res.json();
        console.log("성적 요약 라우터 응답:", data);

        const result = data.result ?? data;
        let rows =
          result?.rows ??
          result?.row ??
          (Array.isArray(result) ? result : result ? [result] : []);

        if (!Array.isArray(rows)) rows = [];

        // 성적이 하나도 없으면 기본값 유지
        if (rows.length === 0) {
          setStudent((prev) => ({
            ...prev,
            gpa: "-",
            credits: 0,
          }));
          return;
        }

        // 등급 → 점수 매핑
        const gradeToPoint = {
          "A+": 4.5,
          A: 4.0,
          "A-": 3.7,
          "B+": 3.5,
          B: 3.0,
          "B-": 2.7,
          "C+": 2.5,
          C: 2.0,
          "C-": 1.7,
          "D+": 1.5,
          D: 1.0,
          "D-": 0.7,
          F: 0.0,
        };

        let totalPoint = 0; // 등급 점수 합
        let count = 0; // 유효한 등급 개수
        let totalCredits = 0; // 취득학점 합

        for (const row of rows) {
          const gradeStr =
            row.grade ?? row.GRADE ?? row["g.grade"] ?? row["G.GRADE"];

          const creditVal =
            row.credit ?? row.CREDIT ?? row["l.credit"] ?? row["L.CREDIT"];

          // GPA 계산: 과목별 단순 평균(등급이 있는 과목만)
          if (gradeStr && gradeToPoint[gradeStr] != null) {
            totalPoint += gradeToPoint[gradeStr];
            count += 1;
          }

          // 취득학점: Lecture.credit 전부 더하기
          const creditNum = Number(creditVal);
          if (!Number.isNaN(creditNum)) {
            totalCredits += creditNum;
          }
        }

        const avgGpa = count > 0 ? (totalPoint / count).toFixed(2) : "-";

        setStudent((prev) => ({
          ...prev,
          gpa: avgGpa,
          credits: totalCredits,
        }));
      } catch (err) {
        console.error("❌ 성적 요약 조회 실패:", err);
        // 에러 나도 페이지 전체가 죽지는 않게, 성적 요약만 기본값 유지
      }
    }

    fetchGradeSummary();
  }, [student?.student_id]);

  // ✅ 현재 학기 수강 과목 조회 (1~8월 = 1학기, 9~12월 = 2학기)
  // ✅ 현재 학기 수강 과목 조회 (1~8월 = 1학기, 9~12월 = 2학기)
  useEffect(() => {
    if (!student?.student_id) return;

    async function fetchCurrentSemesterCourses() {
      try {
        const now = new Date();
        const year = now.getFullYear();         // 예: 2025
        const month = now.getMonth() + 1;       // 1~12
        const currentSemester = month >= 1 && month <= 8 ? 1 : 2;

        const params = new URLSearchParams();

        // enrollment + Lecture + Professor + user JOIN
        //  - enrollment e : 수강 정보 (학생, 연도, 학기)
        //  - Lecture l    : 강의명, 학점, 담당 교수 ID
        //  - Professor p  : 교수 서브타입 (professor_id = user_id)
        //  - user u       : 교수 이름(user_name)
        params.set(
          "table",
          `
          enrollment e
          JOIN Lecture l ON e.lecture_id = l.lecture_id
          LEFT JOIN Professor p ON l.professor_id = p.professor_id
          LEFT JOIN user u ON p.professor_id = u.user_id
        `.trim()
        );

        // 필요한 컬럼만 조회 (별칭까지 명시)
        params.set(
          "select",
          JSON.stringify([
            "l.lecture_name AS lecture_name",          // 과목명
            "u.user_name AS professor_name",           // 교수 이름 (없으면 NULL)
            "l.credit AS credit",                      // 학점
            "e.lecture_year AS lecture_year",          // 수강 연도
            "e.lecture_semester AS lecture_semester",  // 수강 학기
          ])
        );

        // 해당 학생의 수강 정보만
        params.set("where", `e.student_id = ${student.student_id}`);

        const res = await fetch(
          `/api/univer_city/select_where_route?${params.toString()}`,
          { cache: "no-store" }
        );

        if (!res.ok) {
          throw new Error(`수강 과목 조회 실패: ${res.status}`);
        }

        const data = await res.json();
        console.log("현재 학기 수강 과목 라우터 응답:", data);

        const result = data.result ?? data;
        let rows =
          result?.rows ??
          result?.row ??
          (Array.isArray(result) ? result : result ? [result] : []);

        if (!Array.isArray(rows)) rows = [];

        // 현재 연도 + 현재 학기만 필터링
        const filtered = rows.filter((row) => {
          const y =
            row.lecture_year ??
            row.LECTURE_YEAR ??
            row["e.lecture_year"] ??
            row["E.LECTURE_YEAR"];

          const s =
            row.lecture_semester ??
            row.LECTURE_SEMESTER ??
            row["e.lecture_semester"] ??
            row["E.LECTURE_SEMESTER"];

          // lecture_year는 CHECK(REGEXP '^[0-9]{4}$') 이라 숫자 4자리 :contentReference[oaicite:3]{index=3}
          return String(y) === String(year) && Number(s) === currentSemester;
        });

        const courses = filtered.map((row) => {
          const name =
            row.lecture_name ??
            row.LECTURE_NAME ??
            row["l.lecture_name"] ??
            row["L.LECTURE_NAME"] ??
            "-";

          const professor =
            row.professor_name ??
            row.PROFESSOR_NAME ??
            row["u.user_name"] ??
            row["U.USER_NAME"] ??
            "-";

          const creditVal =
            row.credit ??
            row.CREDIT ??
            row["l.credit"] ??
            row["L.CREDIT"];

          const credit = Number.isNaN(Number(creditVal))
            ? "-"
            : Number(creditVal);

          return {
            name,
            professor,
            credit,
          };
        });

        setStudent((prev) => ({
          ...prev,
          courses,
        }));
      } catch (err) {
        console.error("❌ 현재 학기 수강 과목 조회 실패:", err);
        // 에러 나도 전체 화면이 죽지 않도록, courses는 빈 배열 유지
        setStudent((prev) => ({
          ...prev,
          courses: [],
        }));
      }
    }

    fetchCurrentSemesterCourses();
  }, [student?.student_id]);

  // 개인정보 입력 변경 핸들러
  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonalForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ 개인정보 저장 (전화번호 + 주소만 UPDATE)
  const handlePersonalSave = async () => {
    if (!student) return;

    setIsSaving(true);
    setUpdateError(null);

    try {
      const cols = ["phone", "address"];
      const values = [personalForm.phone || "", personalForm.address || ""];

      const params = new URLSearchParams();
      params.set("table", "user");
      params.set("cols", JSON.stringify(cols));
      params.set("values", JSON.stringify(values));
      params.set("where", `user_id = ${student.student_id}`);

      const res = await fetch(
        `/api/univer_city/update_route?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const body = await res.json();

      if (!res.ok || body.error) {
        console.error("에러:", body.error ?? body);
        throw new Error(body.error ?? "알 수 없는 에러가 발생했습니다.");
      }

      console.log("정상 출력되었습니다. (전화번호/주소 수정)", body);

      setStudent((prev) => ({
        ...prev,
        phone: personalForm.phone || "-",
        address: personalForm.address || "-",
      }));

      setIsEditingPersonal(false);
    } catch (err) {
      console.error("❌ 개인정보 수정 실패:", err);
      setUpdateError(err.message || "개인정보 수정 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 개인정보 취소
  const handlePersonalCancel = () => {
    if (student) {
      setPersonalForm({
        phone: student.phone === "-" ? "" : student.phone,
        address: student.address === "-" ? "" : student.address,
      });
    }
    setUpdateError(null);
    setIsEditingPersonal(false);
  };

  // 🔐 비밀번호 입력 변경 핸들러
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ 비밀번호 저장 (회원 비밀번호만 UPDATE)
  const handlePasswordSave = async () => {
    if (!student) return;

    if (!passwordForm.password) {
      setPasswordError("비밀번호를 입력해 주세요.");
      return;
    }

    setIsSavingPassword(true);
    setPasswordError(null);

    try {
      const cols = ["user_password"]; // 실제 컬럼명에 맞게
      const values = [passwordForm.password];

      const params = new URLSearchParams();
      params.set("table", "user");
      params.set("cols", JSON.stringify(cols));
      params.set("values", JSON.stringify(values));
      params.set("where", `user_id = ${student.student_id}`);

      const res = await fetch(
        `/api/univer_city/update_route?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const body = await res.json();

      if (!res.ok || body.error) {
        console.error("비밀번호 수정 에러:", body.error ?? body);
        throw new Error(body.error ?? "알 수 없는 에러가 발생했습니다.");
      }

      console.log("정상 출력되었습니다. (비밀번호 수정)", body);

      // 화면용 비밀번호 값도 업데이트 (보기 기능용)
      setStudent((prev) => ({
        ...prev,
        password: passwordForm.password,
      }));

      setPasswordForm({ password: "" });
      setIsEditingPassword(false);
    } catch (err) {
      console.error("❌ 비밀번호 수정 실패:", err);
      setPasswordError(err.message || "비밀번호 수정 중 오류가 발생했습니다.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  // 비밀번호 수정 취소
  const handlePasswordCancel = () => {
    setPasswordForm({ password: "" });
    setPasswordError(null);
    setIsEditingPassword(false);
  };

  if (error) {
    return (
      <div className={styles.loading}>
        학생 정보를 불러오는 중 오류가 발생했습니다. ({error})
      </div>
    );
  }

  if (!student) {
    return <div className={styles.loading}>학생 정보를 불러오는 중...</div>;
  }

  return (
    <div className={styles.container}>
      {/* 상단 기본 정보 */}
      <section className={styles.profileCard}>
        <img
          src="../components/css/defalt_profile.jpg"
          alt={student.name}
          className={styles.profileImg}
        />
        <div className={styles.profileText}>
          <h2>
            {student.name} ({student.student_id})
          </h2>
          <p>
            {student.department} / {student.major}
          </p>
          <p>
            학년: {student.grade}학년 | 학적상태: {student.status}
          </p>
        </div>
      </section>

      {/* 2열 Grid */}
      <div className={styles.gridBox}>
        {/* 학적 정보 */}
        <section className={styles.box}>
          <h3>📘 학적 정보</h3>
          <p>입학년도: {student.admission_year || "-"}</p>
          <p>학적 상태: {student.status}</p>
          <p>휴·복학 이력: {student.history}</p>
        </section>

        {/* 개인정보 (전화번호/주소) */}
        <section className={styles.box}>
          <div className={styles.boxHeaderRow}>
            <h3>📞 개인정보</h3>
            <button
              type="button"
              className={styles.editButton}
              onClick={() => {
                if (!isEditingPersonal) {
                  setPersonalForm({
                    phone: student.phone === "-" ? "" : student.phone,
                    address: student.address === "-" ? "" : student.address,
                  });
                }
                setIsEditingPersonal((prev) => !prev);
                setUpdateError(null);
              }}
            >
              {isEditingPersonal ? "취소" : "수정"}
            </button>
          </div>

          {!isEditingPersonal ? (
            <>
              <p>전화번호: {student.phone}</p>
              <p>주소: {student.address}</p>
            </>
          ) : (
            <div className={styles.formGroup}>
              <label className={styles.formRow}>
                <span>전화번호</span>
                <input
                  type="text"
                  name="phone"
                  value={personalForm.phone || ""}
                  onChange={handlePersonalChange}
                  className={styles.input}
                />
              </label>
              <label className={styles.formRow}>
                <span>주소</span>
                <input
                  type="text"
                  name="address"
                  value={personalForm.address || ""}
                  onChange={handlePersonalChange}
                  className={styles.input}
                />
              </label>

              {updateError && (
                <p className={styles.errorText}>{updateError}</p>
              )}

              <div className={styles.buttonRow}>
                <button
                  type="button"
                  className={styles.saveButton}
                  onClick={handlePersonalSave}
                  disabled={isSaving}
                >
                  {isSaving ? "저장 중..." : "저장"}
                </button>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handlePersonalCancel}
                  disabled={isSaving}
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </section>

        {/* 성적 요약 */}
        <section className={styles.box}>
          <h3>📊 성적 요약</h3>
          <p>평균 평점(GPA): {student.gpa}</p>
          <p>취득학점: {student.credits}</p>
        </section>

        {/* 🔐 회원 비밀번호 수정 */}
        <section className={styles.box}>
          <div className={styles.boxHeaderRow}>
            <h3>🔐 회원 비밀번호 수정</h3>
            <button
              type="button"
              className={styles.editButton}
              onClick={() => {
                if (!isEditingPassword) {
                  setPasswordForm({ password: "" });
                }
                setIsEditingPassword((prev) => !prev);
                setPasswordError(null);
              }}
            >
              {isEditingPassword ? "취소" : "수정"}
            </button>
          </div>

          <p>회원 ID(학번): {student.student_id}</p>

          {!isEditingPassword ? (
            <>
              <div className={styles.formRow}>
                <span>
                  회원 비밀번호:{" "}
                  {showPassword
                    ? student.password || "(비밀번호 정보 없음)"
                    : "******"}
                </span>
                <button
                  type="button"
                  className={styles.viewButton}
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{ marginLeft: "8px" }}
                >
                  {showPassword ? "숨기기" : "보기"}
                </button>
              </div>
            </>
          ) : (
            <div className={styles.formGroup}>
              <label className={styles.formRow}>
                <span>새 비밀번호</span>
                <input
                  type="password"
                  name="password"
                  value={passwordForm.password || ""}
                  onChange={handlePasswordChange}
                  className={styles.input}
                />
              </label>

              {passwordError && (
                <p className={styles.errorText}>{passwordError}</p>
              )}

              <div className={styles.buttonRow}>
                <button
                  type="button"
                  className={styles.saveButton}
                  onClick={handlePasswordSave}
                  disabled={isSavingPassword}
                >
                  {isSavingPassword ? "저장 중..." : "저장"}
                </button>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handlePasswordCancel}
                  disabled={isSavingPassword}
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* 현재 수강 과목 */}
      <section className={styles.courseBox}>
        <h3>📖 현재 수강 중인 과목</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>과목명</th>
              <th>교수</th>
              <th>학점</th>
            </tr>
          </thead>
          <tbody>
            {student.courses?.length > 0 ? (
              student.courses.map((course, index) => (
                <tr key={index}>
                  <td>{course.name}</td>
                  <td>{course.professor}</td>
                  <td>{course.credit}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3}>수강 중인 과목 정보가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
