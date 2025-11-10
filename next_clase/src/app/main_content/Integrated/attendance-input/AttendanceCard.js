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

  // 7. ✅ handleSave 함수 정의: DB INSERT API 호출
  const handleSave = async () => {
    if (!studentInfo.id || studentInfo.id === 'N/A') {
        return toast("학생 정보가 유효하지 않아 저장할 수 없습니다.");
    }
    
    // ⭐️ [필수 변경] 실제 DB 테이블과 컬럼명으로 변경해야 합니다.
    const TABLE_NAME = 'student';
    const COLS = ['student_id', 'status', 'memo'];
    const VALUES = [[studentInfo.id, attendanceStatus, memo]];
    
    // API 호출을 위한 쿼리 파라미터 구성 (JSON.stringify로 배열을 문자열로 변환)
    const params = new URLSearchParams({
        table: TABLE_NAME,
        cols: JSON.stringify(COLS),
        values: JSON.stringify(VALUES),
    });
    
    try {
        const response = await fetch(`/api/insert?${params.toString()}`);
        const data = await response.json();
        
        if (response.ok && data.affectedRows > 0) {
            toast(`[저장 성공] ${studentInfo.name} (${attendanceStatus}) 상태가 DB에 저장되었습니다.`);
            // 저장이 성공하면 '수정' 버튼이 '저장' 버튼으로 바뀌는 등의 추가 상태 관리가 필요할 수 있습니다.
        } else {
            // data.error는 route.js에서 에러 발생 시 반환됨
            toast(`[저장 실패] 오류: ${data.error || '알 수 없는 서버 오류'}`);
        }
    } catch (error) {
        console.error('API 호출 중 오류 발생:', error);
        toast('네트워크 오류 또는 서버 접속 실패.');
    }
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
          maxWidth: '300px' // 카드의 최대 너비를 지정
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

                        {status === '지각' && (
                            <input
                                type="text"
                                placeholder=" "
                                // 💡 이 입력 필드를 위한 별도의 상태 변수 (예: lateReason)를 정의하고 연결해야 합니다.
                                // 현재는 간단히 인라인 스타일만 적용합니다.
                                style={{ 
                                    marginLeft: '10px', 
                                    padding: '4px 6px', 
                                    width: '10px', 
                                    border: '1px solid #ccc', 
                                    borderRadius: '4px',
                                    // 지각 상태가 선택되지 않으면 비활성화/숨김 처리 로직 추가 가능
                                    opacity: attendanceStatus === '지각' ? 1 : 0.6,
                                    pointerEvents: attendanceStatus === '지각' ? 'auto' : 'none',
                                }}
                            />
                        )}
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