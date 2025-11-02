'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from './grades_export_content.module.css';

const initialStudents = [
  { id: 1, studentId: '2306007', name: '김수혁', scores: { mid: 85, final: 90, assign: 95, attend: 100 } },
];

export function GradesExportContent() {
  const [students, setStudents] = useState(initialStudents);
  const [today, setToday] = useState('');

  useEffect(() => {
    setToday(new Date().toLocaleDateString('ko-KR'));
  }, []);

  const processedStudents = useMemo(() => {
    return students.map(student => {
      const values = Object.values(student.scores).filter(v => typeof v === 'number');
      const total = values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
      const grade = total >= 90 ? 'A' : total >= 80 ? 'B' : total >= 70 ? 'C' : total >= 60 ? 'D' : 'F';
      return { ...student, total, grade };
    });
  }, [students]);

  const stats = useMemo(() => {
    const totals = processedStudents.map(s => s.total);
    if (totals.length === 0) return { avg: '-', max: '-', min: '-' };
    const avg = (totals.reduce((a, b) => a + b, 0) / totals.length).toFixed(1);
    const max = Math.max(...totals);
    const min = Math.min(...totals);
    return { avg, max, min };
  }, [processedStudents]);

  const handleScoreChange = (id, scoreType, value) => {
    setStudents(currentStudents =>
      currentStudents.map(student =>
        student.id === id ? { ...student, scores: { ...student.scores, [scoreType]: Number(value) } } : student
      )
    );
  };

  const handleAddRow = () => {
    const newId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
    setStudents([...students, {
      id: newId, studentId: '----', name: '이름', scores: { mid: 0, final: 0, assign: 0, attend: 0 }
    }]);
  };
  
  return (
    <div className={styles.gradeContainer}>
      <div className={styles.header}>
        <h2>성적 출력</h2>
        <div className={styles.date}>{today}</div>
      </div>

      <div className={styles.filters}>
        <label>학기 선택: <select><option>2025-1학기</option></select></label>
        <label>과목 선택: <select><option>자료구조</option></select></label>
        <input type="text" placeholder="학번 또는 이름 검색" />
      </div>

      <table>
        <thead>
          <tr>
            <th>학번</th><th>이름</th><th>중간</th><th>기말</th><th>과제</th><th>출석</th><th>총점</th><th>학점</th>
          </tr>
        </thead>
        <tbody>
          {processedStudents.map(student => (
            <tr key={student.id}>
              <td>{student.studentId}</td>
              <td>{student.name}</td>
              <td><input type="number" value={student.scores.mid} onChange={e => handleScoreChange(student.id, 'mid', e.target.value)} /></td>
              <td><input type="number" value={student.scores.final} onChange={e => handleScoreChange(student.id, 'final', e.target.value)} /></td>
              <td><input type="number" value={student.scores.assign} onChange={e => handleScoreChange(student.id, 'assign', e.target.value)} /></td>
              <td><input type="number" value={student.scores.attend} onChange={e => handleScoreChange(student.id, 'attend', e.target.value)} /></td>
              <td><output>{student.total}</output></td>
              <td><output>{student.grade}</output></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.toolbar}>
        <button onClick={handleAddRow}>행 추가</button>
        <button onClick={() => alert('서버 연동 필요')}>저장</button>
        <button onClick={() => window.print()}>인쇄</button>
      </div>

      <div className={styles.stats}>
        <div>평균: <span>{stats.avg}</span></div>
        <div>최고: <span>{stats.max}</span></div>
        <div>최저: <span>{stats.min}</span></div>
      </div>
    </div>
  );
}