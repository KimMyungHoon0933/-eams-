// AttendanceCard.js
'use client'; 

// 1. ✅ 필수: React의 useState 훅을 임포트합니다.
import { useState } from 'react';   
import './AttendanceCard.css'; 

// 2. ✅ [수정] 유틸리티 파일에서 toast 함수를 가져옵니다.
// 현재 경로 구조를 가정하여 '../utils/toast'로 임포트합니다.
import { toast } from '../utils/toast';


// 3. onStatusChange prop을 받도록 수정
export default function AttendanceCard({ student, onStatusChange }) { 
  const studentInfo = student || {
    name: '데이터 로드 오류',
    id: 'N/A',
  };

  // 4. ✅ setMemo, attendanceStatus 상태 정의 (초기값은 student prop에서 가져오는 것이 좋습니다)
  // 현재는 임시로 미처리/빈 문자열로 설정합니다.
  const [attendanceStatus, setAttendanceStatus] = useState(studentInfo.initialStatus || '미처리');
  const [memo, setMemo] = useState(studentInfo.initialMemo || ''); 

  // 6. ✅ handleStatusChange 함수 정의
  const handleStatusChange = (status) => {
    setAttendanceStatus(status);
    // 부모 컴포넌트에 변경된 상태 전달
    if (onStatusChange) {
      onStatusChange(studentInfo.id, status, memo);
    }
  };

  // 7. ✅ handleSave 함수 정의
  const handleSave = () => {
    toast(`[저장] ${studentInfo.name} (${attendanceStatus}) 상태 저장 요청`);
  };
  
  const handleEdit = () => {
    toast(`[수정] ${studentInfo.name} 정보 수정 모드 활성화`);
  };

  // 8. 상태 버튼 목록 정의
  const statusButtons = [
    { label: '출석', status: '출석', className: 'ok' },
    { label: '지각', status: '지각', className: 'late' },
    { label: '조퇴', status: '조퇴', className: 'leave' },
    { label: '결석', status: '결석', className: 'absent' },
  ];

  return (
    <article className="card">
        {/* 학생 사진 영역 */}
        <div className="photo" aria-label="학생 사진">
            <div className="placeholder">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 3a1 1 0 0 0-.894.553L7.382 5H5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3h-2.382l-.724-1.447A1 1 0 0 0 14 3H9zm3 5a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>
                </svg>
                <strong>사진 없음</strong>
            </div>
        </div>

        {/* 학생 정보 및 출석 상태 영역 (right 대신 flex 컬럼 배치) */}
        <section className="panel info" style={{ padding: '10px' }}>
            <h2>학생 정보</h2>
            <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '5px 10px', fontSize: '13px' }}>
                <div className="label">이름</div><div className="value">{studentInfo.name}</div>
                <div className="label">학번</div><div className="value">{studentInfo.studentId || 'N/A'}</div>
                <div className="label">학과</div><div className="value">{studentInfo.major || '컴퓨터소프트웨어'}</div>
            </div>
        </section>

        {/* 출석 상태 선택 버튼 */}
        <div className="chips" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', padding: '0 10px', width: '100%' }}>
            {statusButtons.map(button => (
                <button
                    key={button.status}
                    className={`chip ${button.className} ${attendanceStatus === button.status ? 'active' : ''}`}
                    onClick={() => handleStatusChange(button.status)}
                    style={{ 
                        flexGrow: 1, 
                        flexBasis: '45%', // 한 줄에 두 개씩 배치
                        padding: '8px 10px', 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        borderRadius: '6px', 
                        border: '1px solid',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                    }}
                >
                    {button.label}
                </button>
            ))}
        </div>

        {/* 메모 영역 */}
        <div className="notes" style={{ width: '100%', padding: '0 10px' }}>
            <label htmlFor={`memo-${studentInfo.id}`} style={{ display: 'block', marginBottom: '5px', textAlign: 'center' }}>
                메모(선택)
            </label>
            <textarea 
                id={`memo-${studentInfo.id}`} 
                placeholder="특이사항을 기록하세요."
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                rows="3" 
                style={{ 
                    width: '100%', 
                    padding: '8px', 
                    border: '1px solid var(--line, #ccc)', 
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                }}
            ></textarea>
        </div>

        {/* 5. 저장/수정 버튼 (오른쪽 아래 구석) */}
        <div className="footer" style={{ 
            width: '100%', 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '10px', 
            marginTop: '10px',
            padding: '0 10px',
            backgroundColor: 'transparent' // 또는 'white'
        }}>
            <button className="btn ghost" type="button" onClick={handleEdit}>
                수정
            </button>
            <button className="btn primary" type="button" onClick={handleSave} style={{ backgroundColor: 'var(--accent, #2563eb)', color: 'white', border: 'none' }}>
                저장
            </button>
        </div>
    </article>
  );
}