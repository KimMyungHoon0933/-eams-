// Topbar.js
'use client'; // 상태 관리를 위해 클라이언트 컴포넌트로 지정

import { useState, useEffect } from 'react';

export default function Topbar({ selectedCourse }) {
  const [todayDate, setTodayDate] = useState('');
  const courseName =  selectedCourse ? selectedCourse.lecture_name : '강의를 선택해주세요';

  useEffect(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    setTodayDate(`오늘 ${y}-${m}-${d}`);
  }, []);

  return (
    <header className="topbar">
      <div className="left">
        <div className="crumbs">출석관리 &gt; <strong>출석 입력</strong></div>
        <div className="titleRow">
          <h1 className="title">출석 입력</h1>
          <span className="classDisplay" style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              // 강의가 선택되었는지 여부에 따라 색상/스타일 지정 가능
              color: selectedCourse ? 'var(--ink)' : 'var(--sub)', 
              paddingLeft: '10px'
          }}>
            {courseName}
          </span>
        </div>
      </div>
      <div className="right">
        <div className="todayDate">{todayDate}</div>
      </div>
    </header>
  );
}