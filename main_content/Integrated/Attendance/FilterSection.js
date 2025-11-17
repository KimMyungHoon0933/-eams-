// src/components/attendance/FilterSection.js
'use client';

// onShowAbsentList 함수는 부모(ToolCol 또는 AttendanceContent)로부터 받도록 수정합니다.
export default function FilterSection({ onShowAbsentList }) {
  const toast = (msg) => alert(msg); // 임시 toast 함수

  return (
    <div className="card" style={{ padding: '20px' }}>
      <h3>필터</h3>
      <label className="field">
        <span>상태</span>
        <select>
          <option>전체</option>
          <option>출석</option>
          <option>지각</option>
          <option>조퇴</option>
          <option>결석</option>
        </select>
      </label>
      <label className="field">
        <span>이름/학번 검색</span>
        <input type="text" placeholder="예: 20231234 / 홍길동" />
      </label>
      
      {/* ⭐️ 결석자 목록 보기 버튼 ⭐️ */}
      <button
        className="btn primary"
        type="button"
        onClick={onShowAbsentList} 
        style={{ marginTop: '15px' }}
      >
        결석자 목록 보기
      </button>
    </div>
  );
}