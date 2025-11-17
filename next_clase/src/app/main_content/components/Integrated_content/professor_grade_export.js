'use client';
import { useState, useEffect, useMemo } from 'react';
import styles from '../css/page.module.css';   // ✅ 같은 폴더에 있는 CSS 모듈

// 🔻 default export 로 변경
export default function GradesExportContent() {
  const [students, setStudents] = useState([]);
  const [today, setToday] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  useEffect(() => {
    setToday(new Date().toLocaleDateString('ko-KR'));
  }, []);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        setLoading(true);

        const query = selectedSemester
          ? `/api/univer_city/select_grade_route?semester=${
              selectedSemester.includes('2학기') ? 2 : 1
            }`
          : `/api/univer_city/select_grade_route`;

        const res = await fetch(query);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'DB 불러오기 실패');

        const formatted = data.map((row, idx) => ({
          id: idx + 1,
          studentId: row.student_id,
          name: row.student_name,
          department: row.department_name,
          subject: row.lecture_name,
          professor: row.professor_name,
          grade: row.grade || '-',
          year: row.lecture_year || '2025',
          semester: row.lecture_semester === 1 ? '1학기' : '2학기',
        }));

        setStudents(formatted);
      } catch (err) {
        console.error('❌ 성적 데이터 불러오기 오류:', err);
        setError('DB에서 데이터를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [selectedSemester]);

  const semesterOptions = useMemo(() => {
    const years = new Set(students.map((s) => s.year || '2025'));
    const options = []; 

    years.forEach((year) => {
      options.push(`${year}-1학기`);
      options.push(`${year}-2학기`);
    });

    if (options.length === 0) {
      options.push('2025-1학기');
      options.push('2025-2학기');
    }

    return Array.from(new Set(options)).sort();
  }, [students]);

  const filteredBySemester = useMemo(() => {
    if (!selectedSemester) return students;
    const [year, semText] = selectedSemester.split('-');
    const sem = semText.includes('2') ? '2학기' : '1학기';
    return students.filter(
      (s) => s.year.toString() === year && s.semester === sem
    );
  }, [selectedSemester, students]);

  const filteredStudents = useMemo(() => {
    if (!selectedSubject) return filteredBySemester;
    return filteredBySemester.filter((s) => s.subject === selectedSubject);
  }, [filteredBySemester, selectedSubject]);

  const subjects = useMemo(() => {
    const unique = [...new Set(filteredBySemester.map((s) => s.subject))];
    return unique;
  }, [filteredBySemester]);

  if (loading)
    return <p style={{ textAlign: 'center' }}>📦 데이터를 불러오는 중...</p>;
  if (error)
    return <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>;

  return (
    <div className={styles.gradeContainer}>
      <div className={styles.header}>
        <h2>성적 출력</h2>
        <div className={styles.date}>{today}</div>
      </div>

      <div className={styles.filters}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          학기 선택:
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
          >
            <option value="">전체 학기</option>
            {semesterOptions.map((sem, i) => (
              <option key={i} value={sem}>
                {sem}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          과목 선택:
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">전체 과목</option>
            {subjects.map((subject, i) => (
              <option key={i} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </label>

        <input
          type="text"
          placeholder="학번 또는 이름 검색"
          className={styles.searchInput}
        />
      </div>

      <table className={styles.gradeTable}>
        <thead>
          <tr>
            <th>학번</th>
            <th>이름</th>
            <th>학과</th>
            <th>과목명</th>
            <th>교수</th>
            <th>등급</th>
            <th>학기</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                선택된 학기 또는 과목에 해당하는 성적이 없습니다.
              </td>
            </tr>
          ) : (
            filteredStudents.map((student) => (
              <tr key={student.id}>
                <td>{student.studentId}</td>
                <td>{student.name}</td>
                <td>{student.department}</td>
                <td>{student.subject}</td>
                <td>{student.professor}</td>
                <td>{student.grade}</td>
                <td>{`${student.year} ${student.semester}`}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className={styles.toolbar}>
        <button onClick={() => window.location.reload()}>새로고침</button>
        <button onClick={() => window.print()}>인쇄</button>
      </div>
    </div>
  );
}
