// src/components/attendance/WeekSelectSection.js
'use client';

// 임시 데이터 및 로직을 포함합니다.
const WEEK_START = '2025-03-01';
const WEEK_COUNT = 16;
const TODAY_WEEK = 14; // 예시로 14주차를 현재 주차로 설정

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
};

export default function WeekSelectSection({ onWeekSelect, selectedWeek }) {
  const styles = { weekItem: 'weekItem', active: 'active', weeks: 'weeks', date: 'date' };

  const weeks = Array.from({ length: WEEK_COUNT }, (_, i) => {
    const weekNumber = i + 1;
    const dateStr = addDays(WEEK_START, i * 7); 
    const isActive = weekNumber === selectedWeek; // 현재 선택된 주차

    return (
      <div 
        key={i} 
        className={`${styles.weekItem} ${isActive ? styles.active : ''}`}
        onClick={() => onWeekSelect(weekNumber)}
      >
        <span>{weekNumber}주차</span>
        <span className={styles.date}>{dateStr}</span>
      </div>
    );
  });

  return (
    <div className="card" style={{ padding: '14px' }}>
      <h3>주차 선택</h3>
      <label className="field" style={{ marginBottom: '12px' }}>
        <span>수업 주차</span>
        <select value={selectedWeek} onChange={(e) => onWeekSelect(Number(e.target.value))}>
            {Array.from({ length: WEEK_COUNT }, (_, i) => (
                <option key={i} value={i + 1}>
                    {i + 1}주차 ({addDays(WEEK_START, i * 7)})
                </option>
            ))}
        </select>
      </label>
      
      <div className={styles.weeks}>
          {weeks}
      </div>
    </div>
  );
}