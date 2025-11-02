// src/components/attendance/MemoSection.js
'use client';

import { useState } from 'react';

export default function MemoSection() {
  const [memo, setMemo] = useState('');
  const toast = (msg) => alert(msg); // 임시 toast 함수

  const handleSaveMemo = () => {
    // 실제 저장 로직 (API 호출 등)
    toast('메모가 임시저장되었습니다.');
  };

  return (
    <>
      <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
      
      <h3>메모</h3>
      <textarea 
        id="memo" 
        rows="6" 
        placeholder="수업 특이사항, 과제 공지 등"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
      ></textarea>
      <div className="rightRow" style={{ marginTop: '10px' }}>
        <button 
          className="btn ghost" 
          type="button" 
          onClick={handleSaveMemo}
        >
          임시저장
        </button>
      </div>
    </>
  );
}