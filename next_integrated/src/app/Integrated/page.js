// app/Integrated/page.js
"use client";

import { useState } from "react";
import AccordionSidebar from "../components/AccordionSidebar";
import "./UnvierFuction_menu.css";

export default function Page() {
  const [selectedKey, setSelectedKey] = useState(null);
  const [toast, setToast] = useState("");

  const handleToast = (msg) => {
    setToast(msg);
    // 3초 뒤 사라짐
    setTimeout(() => setToast(""), 3000);
  };

  return (
    <div className="route-integrated">
      <div className="integrated-container">
        <div className="integrated-body">
          {/* 왼쪽: 아코디언 사이드바 */}
          <AccordionSidebar
            selectedKey={selectedKey}
            onSelect={setSelectedKey}
          />

          {/* 오른쪽: 컨텐츠 패널 */}
          <div className="content-pane">
            <div className="content-header">
              <h2>{selectedKey || "메뉴에서 기능을 선택하세요"}</h2>
            </div>

            {renderContent(selectedKey, handleToast)}

            {toast && <div className="toast">{toast}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== 컨텐츠 스위처 ===================== */
function renderContent(key, onToast) {
  switch (key) {
    /* 휴학/복학 */
    case "휴학 > 휴학 신청":
      return <LeaveForm onSubmitted={(p) => onToast(`휴학 신청 완료: ${p.studentId} / ${p.term}`)} />;
    case "휴학 > 복학 신청":
      return <ReturnForm onSubmitted={(p) => onToast(`복학 신청 완료: ${p.studentId} / ${p.returnTerm}`)} />;

    /* 성적 - 처리(조회) */
    case "성 적 > 성적처리 > 금학기 성적 조회(미관점)":
      return <GradeView title="금학기 성적 조회(미관점)" />;
    case "성 적 > 성적처리 > 기이수성적조회":
      return <GradeView title="기이수성적조회" />;

    /* 성적 - 입력/출력 */
    case "성 적 > 성적입력 > 성적입력":
      return <GradeInput onSubmitted={() => onToast("성적 1건이 임시 저장되었습니다.")} />;
    case "성 적 > 성적입력 > 성적출력":
      return <GradeExport />;

    default:
      return <EmptyState />;
  }
}

/* ===================== 개별 화면 컴포넌트 ===================== */
function EmptyState() {
  return (
    <div className="empty-state">
      좌측 메뉴를 클릭하면 이 영역에 해당 기능 화면이 표시됩니다.
    </div>
  );
}

function LeaveForm({ onSubmitted }) {
  const [form, setForm] = useState({
    studentId: "",
    name: "",
    term: "2025-1",
    startDate: "",
    reason: "",
  });

  return (
    <form
      className="form-card"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmitted(form);
      }}
    >
      <div className="form-grid">
        <label>학번</label>
        <input value={form.studentId} onChange={(e)=>setForm({...form, studentId:e.target.value})} required />

        <label>성명</label>
        <input value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} required />

        <label>신청 학기</label>
        <select value={form.term} onChange={(e)=>setForm({...form, term:e.target.value})}>
          <option value="2025-1">2025-1</option>
          <option value="2025-2">2025-2</option>
        </select>

        <label>시작일</label>
        <input type="date" value={form.startDate} onChange={(e)=>setForm({...form, startDate:e.target.value})} required />

        <label>사유</label>
        <textarea rows={4} value={form.reason} onChange={(e)=>setForm({...form, reason:e.target.value})} />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn primary">신청</button>
        <button type="reset" className="btn" onClick={(e)=>e.currentTarget.form.reset()}>초기화</button>
      </div>
    </form>
  );
}

function ReturnForm({ onSubmitted }) {
  const [form, setForm] = useState({
    studentId: "",
    name: "",
    returnTerm: "2025-2",
    returnDate: "",
    note: "",
  });

  return (
    <form
      className="form-card"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmitted(form);
      }}
    >
      <div className="form-grid">
        <label>학번</label>
        <input value={form.studentId} onChange={(e)=>setForm({...form, studentId:e.target.value})} required />

        <label>성명</label>
        <input value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} required />

        <label>복학 학기</label>
        <select value={form.returnTerm} onChange={(e)=>setForm({...form, returnTerm:e.target.value})}>
          <option value="2025-1">2025-1</option>
          <option value="2025-2">2025-2</option>
          <option value="2026-1">2026-1</option>
        </select>

        <label>복학 예정일</label>
        <input type="date" value={form.returnDate} onChange={(e)=>setForm({...form, returnDate:e.target.value})} required />

        <label>비고</label>
        <textarea rows={3} value={form.note} onChange={(e)=>setForm({...form, note:e.target.value})} />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn primary">신청</button>
        <button type="reset" className="btn" onClick={(e)=>e.currentTarget.form.reset()}>초기화</button>
      </div>
    </form>
  );
}

function GradeView({ title }) {
  // 데모용 더미 데이터
  const rows = [
    { course: "자료구조", studentId: "20251234", name: "홍길동", grade: "A0" },
    { course: "운영체제", studentId: "20254567", name: "김철수", grade: "B+" },
  ];
  return (
    <div className="table-card">
      <h3>{title}</h3>
      <table className="tbl">
        <thead>
          <tr><th>과목명</th><th>학번</th><th>이름</th><th>성적</th></tr>
        </thead>
        <tbody>
          {rows.map((r, i)=>(
            <tr key={i}>
              <td>{r.course}</td><td>{r.studentId}</td><td>{r.name}</td><td>{r.grade}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GradeInput({ onSubmitted }) {
  const [items, setItems] = useState([]);
  const [f, setF] = useState({ course:"", studentId:"", name:"", grade:"A0" });

  const add = (e) => {
    e.preventDefault();
    setItems([...items, f]);
    setF({ course:"", studentId:"", name:"", grade:"A0" });
    onSubmitted();
  };

  return (
    <>
      <form className="form-card" onSubmit={add}>
        <div className="form-grid">
          <label>과목명</label>
          <input value={f.course} onChange={(e)=>setF({...f, course:e.target.value})} required />

          <label>학번</label>
          <input value={f.studentId} onChange={(e)=>setF({...f, studentId:e.target.value})} required />

          <label>이름</label>
          <input value={f.name} onChange={(e)=>setF({...f, name:e.target.value})} required />

          <label>성적</label>
          <select value={f.grade} onChange={(e)=>setF({...f, grade:e.target.value})}>
            {["A+","A0","B+","B0","C+","C0","D+","D0","F"].map(g=>(
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn primary">추가</button>
        </div>
      </form>

      {items.length>0 && (
        <div className="table-card">
          <h3>임시 입력 목록</h3>
          <table className="tbl">
            <thead>
              <tr><th>과목명</th><th>학번</th><th>이름</th><th>성적</th></tr>
            </thead>
            <tbody>
              {items.map((r, i)=>(
                <tr key={i}>
                  <td>{r.course}</td><td>{r.studentId}</td><td>{r.name}</td><td>{r.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function GradeExport() {
  return (
    <div className="empty-state">
      성적출력은 PDF/엑셀 내보내기 연동 시 구현 예정입니다. (지금은 데모 자리)
    </div>
  );
}

