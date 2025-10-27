// ToolCol.js
'use client';

const toast = (msg) => alert(msg);

export default function ToolCol() {
  return (
    <aside className="toolCol">
      <div className="card">
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
      </div>

      <div className="card">
        <h3>메모</h3>
        <textarea id="memo" rows="6" placeholder="수업 특이사항, 과제 공지 등"></textarea>
        <div className="rightRow">
          <button className="btn ghost" type="button" onClick={() => toast('메모가 임시저장되었습니다.')}>임시저장</button>
        </div>
      </div>
    </aside>
  );
}