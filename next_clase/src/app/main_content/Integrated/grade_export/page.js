'use client';

import { useState, useEffect } from 'react';
import IntegratedMenu from "../../components/IntegratedMenu";
import styles from './page.module.css';

export default function GradesExportPage() {
  const [grades, setGrades] = useState([]);         // 전체 성적 데이터
  const [loading, setLoading] = useState(true);     // 로딩 상태
  const [today, setToday] = useState('');           // 날짜
  const [selectedSemester, setSelectedSemester] = useState(''); // ✅ 학기 선택 상태

  useEffect(() => {
    setToday(new Date().toLocaleDateString('ko-KR'));
  }, []);

  // ✅ DB 데이터 불러오기
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const res = await fetch('/api/univer_city/select_grade_route');
        if (!res.ok) throw new Error('데이터를 불러오는 데 실패했습니다.');
        const data = await res.json();
        setGrades(data);
      } catch (err) {
        console.error('❌ 성적 데이터 불러오기 실패:', err);
        alert('DB 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchGrades();
  }, []);

  // ✅ 학기별 필터링 로직
  const filteredGrades = grades.filter((g) => {
    if (!selectedSemester) return true; // 전체 보기
    const sem = selectedSemester.includes("2학기") ? 2 : 1;
    return g.lecture_semester === sem;
  });

  return (
    <div className={styles.pageContainer}>
      <IntegratedMenu />
      <div className={styles.contentWrapper}>
        <div className={styles.gradeContainer}>
          {/* ===== 헤더 ===== */}
          <div className={styles.header}>
            <h2>성적 출력</h2>
            <div className={styles.date}>{today}</div>
          </div>

          {/* ===== 학기 선택 드롭다운 ===== */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: '#333' }}>학기 선택:</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              style={{
                border: '1px solid #ccc',
                borderRadius: '6px',
                padding: '2px 6px',
                fontSize: '13px',
                height: '26px',
                width: '120px',
                cursor: 'pointer',
                backgroundColor: '#fff',
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                backgroundImage:
                  "url(\"data:image/svg+xml;charset=UTF-8,%3Csvg width='10' height='6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23666' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E\")",
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 6px center',
                backgroundSize: '10px 6px',
              }}
            >
              <option value="">전체 학기</option>
              <option value="2025-1학기">2025-1학기</option>
              <option value="2025-2학기">2025-2학기</option>
            </select>
          </div>

          {/* ===== 결과 테이블 ===== */}
          <table className={styles.gradeTable}>
            <thead>
              <tr>
                <th>강의</th>
                <th>학과</th>
                <th>교수이름</th>
                <th>학번</th>
                <th>이름</th>
                <th>학점</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6">불러오는 중...</td></tr>
              ) : filteredGrades.length === 0 ? (
                <tr><td colSpan="6">조회된 데이터가 없습니다.</td></tr>
              ) : (
                filteredGrades.map((row, i) => (
                  <tr key={i}>
                    <td>{row.lecture_name || '-'}</td>
                    <td>{row.department_name || '-'}</td>
                    <td>{row.professor_name || '-'}</td>
                    <td>{row.student_id || '-'}</td>
                    <td>{row.student_name || '-'}</td>
                    <td>{row.grade || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* ===== 인쇄 버튼 ===== */}
          <div className={styles.toolbar}>
            <button onClick={() => window.print()}>인쇄</button>
          </div>
        </div>
      </div>
    </div>
  );
}
