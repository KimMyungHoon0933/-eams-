'use client';

import { useState, useEffect } from 'react';
import styles from '../css/page.module.css';   // 교수용과 같은 CSS

export default function StudentGradesExport() {
  const [students, setStudents] = useState([]);
  const [today, setToday] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState(null);   // 현재 사용자 정보
  const [userType, setUserType] = useState(null);         // user_type (student / professor ...)

  useEffect(() => {
    setToday(new Date().toLocaleDateString('ko-KR'));
  }, []);

  useEffect(() => {
    const fetchUserAndGrades = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1) 현재 사용자 정보 가져오기 (user_route)
        const userRes = await fetch('/api/univer_city/user_route', {
          cache: 'no-store',
        });
        const userData = await userRes.json();

        if (!userRes.ok) {
          throw new Error(
            userData?.error || '현재 사용자 정보를 불러오지 못했습니다.'
          );
        }

        // user_route 응답에서 user_id 추출
        const sessionUserId =
          userData?.session?.user_id ??
          userData?.user_id ??
          userData?.result?.user_id;

        const typeFromRoot = userData?.user_type;
        const typeFromResult =
          userData?.result?.user_type ||
          userData?.result?.rows?.[0]?.user_type ||
          null;

        const finalUserType = typeFromRoot || typeFromResult || null;

        if (!sessionUserId) {
          throw new Error('세션에서 user_id를 찾을 수 없습니다.');
        }

        setCurrentUser({
          user_id: sessionUserId,
        });
        setUserType(finalUserType);

        // 2) 학생이 아니면 막기
        if (finalUserType !== 'student') {
          setStudents([]);
          setError('학생만 성적 조회 페이지에 접근할 수 있습니다.');
          return;
        }

        // 3) 학생이면 student_grades_route를 user_id 기준으로 호출
        const gradeUrl = `/api/univer_city/student_grades_route?user_id=${sessionUserId}`;
        const gradeRes = await fetch(gradeUrl, { cache: 'no-store' });
        const gradeJson = await gradeRes.json();

        if (!gradeRes.ok || gradeJson.ok === false) {
          throw new Error(
            gradeJson?.error ||
              gradeJson?.message ||
              '성적 정보를 불러오는 데 실패했습니다.'
          );
        }

        const rows = gradeJson.data || [];

        // 4) 결과 형식에 맞춰 포맷팅
        const formatted = rows.map((row, idx) => ({
          id: idx + 1,
          studentId: row.student_id,
          studentName: row.student_name,
          department: row.department_name,
          lectureName: row.lecture_name,
          professorName: row.professor_name,
          grade: row.grade,
        }));

        setStudents(formatted);
      } catch (err) {
        console.error('❌ 학생 성적 조회 오류:', err);
        setError(err.message || '학생 성적 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndGrades();
  }, []);

  return (
    // 🔻 교수용이랑 동일하게 gradeContainer 사용
    <div className={styles.gradeContainer}>
      <div className={styles.header}>
        <h2>학생 성적 조회</h2>
        <div className={styles.date}>
          조회일: {today}
          {currentUser && <> | 학번: {currentUser.user_id}</>}
        </div>
      </div>

      {loading && (
        <p style={{ textAlign: 'center' }}>📦 데이터를 불러오는 중...</p>
      )}

      {!loading && error && (
        <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
      )}

      {!loading && !error && students.length === 0 && (
        <p style={{ textAlign: 'center', padding: '20px' }}>
          성적 정보가 없습니다.
        </p>
      )}

      {!loading && !error && students.length > 0 && (
        <>
          {/* 🔻 여기서도 gradeTable 클래스를 사용해서 초록 헤더 스타일 적용 */}
          <table className={styles.gradeTable}>
            <thead>
              <tr>
                <th>No</th>
                <th>학번</th>
                <th>이름</th>
                <th>학과</th>
                <th>과목명</th>
                <th>교수</th>
                <th>성적</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td>{student.studentId}</td>
                  <td>{student.studentName}</td>
                  <td>{student.department}</td>
                  <td>{student.lectureName}</td>
                  <td>{student.professorName}</td>
                  <td>{student.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.toolbar}>
            <button onClick={() => window.location.reload()}>새로고침</button>
            <button onClick={() => window.print()}>인쇄</button>
          </div>
        </>
      )}
    </div>
  );
}
