"use client";
import { useState, useRef } from "react";

export function LeaveSchoolApply() {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState("임시저장");
  const [files, setFiles] = useState([]);
  const fileRef = useRef();

  const nextStep = () => setStep(2);
  const prevStep = () => setStep(1);

  const save = () => {
    setStatus("임시저장");
    alert("임시저장 되었습니다.");
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const form = e.currentTarget;
      const fd = new FormData(form);

      const data = {
        studentId: fd.get("studentId")?.trim() || null,
        name: fd.get("name")?.trim() || null,
        dept: fd.get("dept")?.trim() || null,
        phone: fd.get("phone")?.trim() || null,
        email: fd.get("email")?.trim() || null,
        leaveType: fd.get("leaveType")?.trim() || null,
        startTerm: fd.get("startTerm")?.trim() || null,
        duration: fd.get("duration")?.trim() || null,
        reason: fd.get("reason")?.trim() || null,
        memo: fd.get("memo")?.trim() || null,
      };

      const TABLE_NAME = "leave_apply";
      const cols = [
        "student_id","name","dept","phone","email",
        "leave_type","start_term","duration","reason","memo"
      ];
      const values = [
        data.studentId, data.name, data.dept, data.phone, data.email,
        data.leaveType, data.startTerm, data.duration, data.reason, data.memo
      ];

      const qs = new URLSearchParams({
        table: TABLE_NAME,
        cols: JSON.stringify(cols),
        values: JSON.stringify(values)
      });

      const res = await fetch(`/api/insert?${qs.toString()}`, { method: "GET" });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Unknown error");

      setStatus("제출됨");
      alert("휴학 신청이 정상적으로 제출되었습니다!");
    } catch (err) {
      console.error(err);
      alert("오류 발생: 콘솔을 확인하세요.");
    }
  };

  return (
    <main className="main">
      <header>
        <div className="crumbs">학사관리 &gt; 휴·복학 &gt; <strong>휴학 신청</strong></div>
        <div className="titleRow">
          <h1 className="title">휴학 신청</h1>
          <span className="statusBadge">{status}</span>
        </div>
      </header>

      <form className="card" onSubmit={submit}>
        {/* STEP 1 */}
        <section hidden={step !== 1}>
          <h2>학생 기본정보</h2>
          <div className="grid2">
            <label className="field"><span>학번</span><input type="text" name="studentId" required /></label>
            <label className="field"><span>이름</span><input type="text" name="name" required /></label>
            <label className="field"><span>학과</span><input type="text" name="dept" required /></label>
            <label className="field"><span>연락처</span><input type="tel" name="phone" /></label>
            <label className="field"><span>이메일</span><input type="email" name="email" /></label>
          </div>

          <div className="sectionActions">
            <button type="button" className="btn secondary" onClick={save}>임시저장</button>
            <button type="button" className="btn primary" onClick={nextStep}>다음</button>
          </div>
        </section>

        {/* STEP 2 */}
        <section hidden={step !== 2}>
          <h2>휴학 정보</h2>
          <div className="grid2">
            <label className="field"><span>휴학 구분</span>
              <select name="leaveType" required>
                <option value="">선택</option>
                <option>일반휴학</option>
                <option>군휴학</option>
                <option>질병휴학</option>
                <option>기타</option>
              </select>
            </label>
            <label className="field"><span>휴학 시작 학기</span>
              <select name="startTerm" required>
                <option value="">선택</option>
                <option>2025-1</option>
                <option>2025-2</option>
                <option>2026-1</option>
              </select>
            </label>
            <label className="field"><span>휴학 기간</span>
              <select name="duration" required>
                <option value="">선택</option>
                <option>한 학기</option>
                <option>1년 (2학기)</option>
              </select>
            </label>
            <label className="field field-full"><span>휴학 사유</span><input type="text" name="reason" /></label>
            <label className="field field-full"><span>비고</span><textarea name="memo" rows="4"></textarea></label>
          </div>

          <div className="divider"></div>

          <div className="grid2">
            <div className="field">
              <span>증빙 첨부 (선택)</span>
              <input type="file" multiple ref={fileRef} onChange={(e)=>setFiles([...e.target.files])}/>
              <ul className="fileList">
                {files.map((f, i)=><li key={i}>{f.name}</li>)}
              </ul>
            </div>
            <div className="notice">
              <h3>유의사항</h3>
              <ul>
                <li>군/질병휴학 시 증빙자료 첨부 필수</li>
                <li>학기 시작 후 휴학은 승인되지 않습니다.</li>
                <li>승인 후 학적 상태가 ‘휴학’으로 전환됩니다.</li>
              </ul>
            </div>
          </div>

          <div className="sectionActions">
            <button type="button" className="btn ghost" onClick={prevStep}>이전</button>
            <button type="button" className="btn secondary" onClick={save}>임시저장</button>
            <button type="submit" className="btn primary">제출하기</button>
          </div>
        </section>
      </form>

      <section className="bottomInfo">
        <strong>안내</strong>
        <span>휴학 신청 마감: 개강 2주 전 / 문의: 학사지원팀 02-000-0000</span>
      </section>
    </main>
  );
}
