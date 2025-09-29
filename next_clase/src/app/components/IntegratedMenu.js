"use client";

import { useState } from "react";
import AccordionSidebar from "./AccordionSidebar";
import "./css/UnvierFuction_menu.css"; // 기존 스타일 재사용(경로는 프로젝트에 맞게)


export default function IntegratedMenu({
  sections,
  initialKey = null,
  onSelect,
  renderOverride,
}) {
  const [selectedKey, setSelectedKey] = useState(initialKey);
  const [toast, setToast] = useState("");

  const handleSelect = (key) => {
    setSelectedKey(key);
    onSelect?.(key);
  };

  const handleToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  return (
    <div className="route-integrated">
      <div className="integrated-container">
        <div className="integrated-body">
          <AccordionSidebar
            sections={sections}
            selectedKey={selectedKey}
            onSelect={handleSelect}
          />

          {/* ✅ 선택된 메뉴가 있을 때만 우측 패널을 렌더링 */}
          {selectedKey && (
            <div className="content-pane">
              {/* 선택됐을 때만 헤더 표시 */}
              <div className="content-header">
                <h2>{selectedKey}</h2>
              </div>

              {renderOverride
                ? renderOverride(selectedKey, handleToast)
                : renderContent(selectedKey, handleToast)}

              {toast && <div className="toast">{toast}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ====== 화면 컴포넌트들 ====== */
function renderContent(key, onToast) {
  switch (key) {
    case "휴학 > 휴학 신청":
      return <LeaveForm onSubmitted={(p)=>onToast(`휴학 신청 완료: ${p.studentId} / ${p.term}`)} />;
    case "휴학 > 복학 신청":
      return <ReturnForm onSubmitted={(p)=>onToast(`복학 신청 완료: ${p.studentId} / ${p.returnTerm}`)} />;

    case "성 적 > 성적처리 > 금학기 성적 조회(미관점)":
      return <GradeView title="금학기 성적 조회(미관점)" />;
    case "성 적 > 성적처리 > 기이수성적조회":
      return <GradeView title="기이수성적조회" />;

    case "성 적 > 성적입력 > 성적입력":
      return <GradeInput onSubmitted={()=>onToast("성적 1건이 임시 저장되었습니다.")} />;
    case "성 적 > 성적입력 > 성적출력":
      return <GradeExport />;

    default:
      return null; // ✅ 기본은 아무것도 안 띄움
  }
}

function LeaveForm({ onSubmitted }) {
  const [form, setForm] = useState({
    studentId: "", name: "", term: "2025-1", startDate: "", reason: "",
  });

  return (
    <form
      className="form-card"
      onSubmit={(e) => { e.preventDefault(); onSubmitted(form); }}
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
    studentId: "", name: "", returnTerm: "2025-2", returnDate: "", note: "",
  });

  return (
    <form
      className="form-card"
      onSubmit={(e) => { e.preventDefault(); onSubmitted(form); }}
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
    <div className="empty-state" style={{ opacity: 1 }}>
      성적출력은 PDF/엑셀 내보내기 연동 시 구현 예정입니다. (데모 자리)
    </div>
  );
}