// ToolCol.js
'use client';

const toast = (msg) => alert(msg);

export default function ToolCol() {
  return (
    <div className="card" style={{ padding: '20px' }}>
      
      {/* 1. 필터 섹션 */}
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
      
      {/* ⭐️ 결석자 목록 보기 버튼 추가 ⭐️ */}
      <button
        className="btn primary"
        type="button"
        onClick={onShowAbsentList} // AttendanceContent에서 전달받은 함수 연결
        style={{ marginTop: '15px' }}
      >
        결석자 목록 보기
      </button>

      <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
      
      {/* 2. 메모 섹션 */}
      <h3>메모</h3>
      <textarea id="memo" rows="6" placeholder="수업 특이사항, 과제 공지 등"></textarea>
      <div className="rightRow" style={{ marginTop: '10px' }}>
        <button className="btn ghost" type="button" onClick={() => toast('메모가 임시저장되었습니다.')}>임시저장</button>
      </div>
      {/* 3. 오늘 수업정보 카드 (새로운 위치 - 메모 밑) */}
      <div className="card" style={{ padding: '14px' }}>
        <h3>오늘 수업정보</h3>
        <dl className="desc">
            {/* JSX 변환 시 class 대신 className 사용 및 닫는 태그 / 필수 */}
            <div><dt>강의명</dt><dd id="className">컴소과 2-1 자료구조</dd></div> 
            <div><dt>담당</dt><dd>김교수</dd></div>
            <div><dt>정원/수강</dt><dd> 36 / 40 </dd></div>
            <div><dt>평균 출석률</dt><dd>92%</dd></div>
        </dl>
        <div className="legend">
            <span className="pill ok">출석</span>
            <span className="pill late">지각</span>
            <span className="pill leave">조퇴</span>
            <span className="pill absent">결석</span>
        </div>
      </div>
      
      {/* 4. 주차 선택 카드 (새로운 위치 - 수업정보 밑) */}
      <div className="card" style={{ padding: '14px' }}>
        <h3>주차 선택</h3>
        <div className="weeks" id="weeks"></div>
      </div>
      
      {/* 5. 최근 공지 카드 */}
      <div className="card" style={{ padding: '14px' }}>
        <h3>최근 공지</h3>
        <ul className="list">
          <li>9/10: 팀프로젝트 조 편성 완료</li>
          <li>9/12: 실습실 변경 B-205</li>
          <li>9/15: 퀴즈 #2 공지</li>
        </ul>
      </div>
    </div>
  );
}