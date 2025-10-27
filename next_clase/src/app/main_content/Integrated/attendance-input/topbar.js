// Topbar.js
'use client'; // 상태 관리를 위해 클라이언트 컴포넌트로 지정

import { useState, useEffect } from 'react';

export default function Topbar() {
  const [todayDate, setTodayDate] = useState('');
  const [selectedClass, setSelectedClass] = useState('컴소과 2-1 자료구조');

  useEffect(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    setTodayDate(`오늘 ${y}-${m}-${d}`);
  }, []);

  const handleClassChange = (event) => {
    setSelectedClass(event.target.value);
  };

  return (
    <header className="topbar">
      <div className="left">
        <div className="crumbs">출석관리 &gt; <strong>출석 입력</strong></div>
        <div className="titleRow">
          <h1 className="title">출석 입력</h1>
          <select className="classSelect" onChange={handleClassChange} value={selectedClass}>
            <option>컴소과 2-1 자료구조</option>
            <option>컴소과 1-2 웹프로그래밍</option>
            <option>컴소과 3-1 운영체제</option>
          </select>
        </div>
      </div>
      <div className="right">
        <div className="todayDate">{todayDate}</div>
      </div>
    </header>
  );
}