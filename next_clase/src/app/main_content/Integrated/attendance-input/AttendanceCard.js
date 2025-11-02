// AttendanceCard.js
'use client'; 

// 1. ✅ 필수: React의 useState 훅을 임포트합니다.
import { useState } from 'react';   
import './AttendanceCard.css'; 

// 2. 임시 toast 함수 (외부에서 import하지 않는 경우를 대비)
const toast = (msg) => alert(msg);


// 3. onStatusChange prop을 받도록 수정
export default function AttendanceCard({ student, onStatusChange }) { 
  const studentInfo = student || {
    name: '데이터 로드 오류',
    id: 'N/A',
  };

  // 4. ✅ setMemo, attendanceStatus 상태 정의
  const [attendanceStatus, setAttendanceStatus] = useState('미처리');
  const [memo, setMemo] = useState(''); 

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

  return (
    <div className="cards"> 
      {/* ⭐️ 단일 열, 중앙 정렬 레이아웃 적용 ⭐️ */}
      <article className="card" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '15px', 
          padding: '20px',
          maxWidth: '400px' // 카드의 최대 너비를 지정
      }}>
        
        {/* 1. 사진 없음 칸 (중앙 상단) */}
        <div className="photo" aria-label="학생 사진" style={{ 
            width: '120px', 
            aspectRatio: '1/1', 
            borderRadius: '0%', // 원형 placeholder
            margin: '0 0 10px 0' 
        }}>
            <div className="placeholder" style={{ borderRadius: '0%', width: '100%', height: '20%' }}>
              <strong>사진 없음</strong>
            </div>
        </div>

        {/* 2. 학생 정보 (중앙 정렬) */}
        <section className="panel attendance" style={{ textAlign: 'center', width: '100%', padding: '0 10px' }}>
            <div className="info-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                textAlign: 'center',
                // info-grid를 중앙에 배치
                width: 'fit-content',
                margin: '0 auto'
            }}>
              <div className="label" style={{ fontWeight: 'bold' }}>이름</div><div className="value">{studentInfo.name}</div>
              <div className="label" style={{ fontWeight: 'bold' }}>학번</div><div className="value">{studentInfo.id}</div>
            </div>
        </section>

        <hr style={{ width: '90%', border: 'none', borderTop: '1px solid var(--line, #e5e7eb)' }} />

        {/* 3. 출석 처리 (라디오 버튼 형식) */}
        <section className="panel attendance" style={{ width: '100%', textAlign: 'center', padding: '0 10px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
                {['출석', '지각', '결석'].map(status => (
                    <label key={status} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input 
                            type="radio" // ⭐️ 라디오 버튼 사용 ⭐️
                            name={`attendance-${studentInfo.id}`} 
                            value={status} 
                            checked={attendanceStatus === status}
                            onChange={() => handleStatusChange(status)}
                            style={{ marginRight: '5px' }}
                        />
                        {status}
                    </label>
                ))}
            </div>
        </section>
        
        <hr style={{ width: '90%', border: 'none', borderTop: '1px solid var(--line, #e5e7eb)' }} />

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
            <button className="btn primary" type="button" onClick={handleSave}>
                저장
            </button>
        </div>
      </article>
    </div>
  );
}