// AttendanceCard.js (신규 파일)
'use client'; 
import './AttendanceCard.css'; // 일반 CSS 파일을 사용한다고 가정

// 학생 정보를 props로 받도록 구조화
export default function AttendanceCard({ student }) {
  const studentInfo = student || {
    name: '홍길동',
    id: '20241234',
  };

  return (
    // attendance window.html의 <div class="cards"> 내용을 복사
    <div className="cards">
      <article className="card">
        <div className="left-col">
          <div className="photo" aria-label="학생 사진">
           <div className="placeholder">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 3a1 1 0 0 0-.894.553L7.382 5H5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3h-2.382l-.724-1.447A1 1 0 0 0 14 3H9zm3 5a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>
              </svg>
              <strong>사진 없음</strong>
              </div>
            </div>
          

          <section className="panel info">
            <h2>학생 정보</h2>
            <div className="info-grid">
              <div className="label">이름</div><div className="value">{studentInfo.name}</div>
              <div className="label">학번</div><div className="value">{studentInfo.id}</div>
            </div>
          </section>
        </div>
        <div className="right-col">
          <section className="panel attendance">
            <h2>출석 처리</h2>
            <div className="chips">
              {/* React 환경에서는 onClick 이벤트 처리 로직이 필요합니다. */}
              <button className="chip" type="button">출석</button>
              <button className="chip" type="button">지각</button>
              <button className="chip" type="button">결석</button>
            </div>
            <div className="notes">
              <label htmlFor={`memo-${studentInfo.id}`}>메모(선택)</label>
              {/* htmlFor와 id를 studentInfo.id로 연결하여 고유성을 확보합니다. */}
              <textarea id={`memo-${studentInfo.id}`} placeholder="특이사항을 기록하세요."></textarea>
            </div>
            <div className="footer">
              <span className="stamp">처리 전</span>
              <button className="btn" type="button" onClick={() => toast(`${studentInfo.name} 저장`)}>저장</button>
            </div>
          </section>
        </div>
      </article>
    </div>
  );
}