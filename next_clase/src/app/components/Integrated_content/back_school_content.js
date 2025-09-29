// app/components/integrated_content/back_school_content.js
"use client";

import { useState, useRef } from "react";

/* ===================== 복학 신청 (input.html) ===================== */
export function BackSchoolApply() {
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

  const submit = (e) => {
    e.preventDefault();
    setStatus("제출됨");
    alert("제출되었습니다. 진행상태 페이지로 이동합니다. (데모)");
  };

  return (
    <main className="main">
      <header>
        <div className="crumbs">학사관리 &gt; 휴·복학 &gt; <strong>복학 신청</strong></div>
        <div className="titleRow">
          <h1 className="title">복학 신청</h1>
          <span className="statusBadge" id="statusBadge">{status}</span>
        </div>
      </header>

      <form className="card" id="returnForm" onSubmit={submit}>
        {/* STEP 1 */}
        <section className="section" data-pane="1" hidden={step !== 1}>
          <h2>학생 기본정보</h2>
          <div className="grid2">
            <label className="field"><span>학번</span><input type="text" name="studentId" required /></label>
            <label className="field"><span>이름</span><input type="text" name="name" required /></label>
            <label className="field"><span>학과</span><input type="text" name="dept" required /></label>
            <label className="field"><span>연락처</span><input type="tel" name="phone" /></label>
            <label className="field"><span>이메일</span><input type="email" name="email" /></label>
            <label className="field"><span>주소</span><input type="text" name="addr" /></label>
          </div>
          <div className="sectionActions">
            <button type="button" className="btn secondary" id="save1" onClick={save}>임시저장</button>
            <button type="button" className="btn primary" data-next="2" onClick={nextStep}>다음</button>
          </div>
        </section>

        {/* STEP 2 */}
        <section className="section" data-pane="2" hidden={step !== 2}>
          <h2>학적/복학 정보</h2>
          <div className="grid2">
            <label className="field"><span>휴학 구분</span>
              <select name="leaveType" required defaultValue="">
                <option value="" disabled>선택</option>
                <option>일반휴학</option>
                <option>군휴학</option>
                <option>질병휴학</option>
                <option>기타</option>
              </select>
            </label>
            <label className="field"><span>복학 희망 학기</span>
              <select name="returnTerm" required defaultValue="">
                <option value="" disabled>선택</option>
                <option>2025-1</option>
                <option>2025-2</option>
                <option>2026-1</option>
                <option>2026-2</option>
              </select>
            </label>
            <label className="field"><span>복학 사유</span><input type="text" name="reason" /></label>
            <label className="field"><span>희망 수강학점</span><input type="number" name="credits" min="0" max="24" /></label>
            <label className="field field-full"><span>비고</span><textarea name="memo" rows="4"></textarea></label>
          </div>

          <div className="divider"></div>

          <div className="grid2">
            <div className="field">
              <span>증빙 첨부 (선택)</span>
              <input type="file" id="fileInput" multiple ref={fileRef} onChange={(e)=>setFiles([...e.target.files])}/>
              <ul className="fileList" id="fileList">
                {files.map((f, i)=><li key={i}>{f.name}</li>)}
              </ul>
              <p className="hint">군/질병 휴학 등 해당 시 증빙파일(PDF, JPG 등)을 첨부하세요.</p>
            </div>
            <div className="notice">
              <h3>유의사항</h3>
              <ul>
                <li>제출 후에는 담당자 검토까지 수정이 제한됩니다.</li>
                <li>복학 학기 변경은 마감일 이전에만 가능합니다.</li>
                <li>승인 완료 후 자동으로 학적 상태가 “재학”으로 전환됩니다.</li>
              </ul>
            </div>
          </div>

          <div className="sectionActions">
            <button type="button" className="btn ghost" data-prev="1" onClick={prevStep}>이전</button>
            <button type="button" className="btn secondary" id="save2" onClick={save}>임시저장</button>
            <button type="submit" className="btn primary">제출하고 진행상태 보기</button>
          </div>
        </section>
      </form>

      <section className="bottomInfo">
        <strong>기타 안내</strong>
        <span>복학 신청 마감: 학기 개강 2주 전 / 문의: 학사지원팀 02-000-0000</span>
      </section>
    </main>
  );
}

/* ===================== 진행상태 (output.html) ===================== */
export function BackSchoolStatus() {
  const [status, setStatus] = useState("제출됨");
  const [steps, setSteps] = useState([
    { text:"작성완료", state:"done" },
    { text:"제출(학생)", state:"done" },
    { text:"지도교수 승인 대기", state:"current" },
    { text:"학과조교 확인", state:"" },
    { text:"학사지원팀 최종승인", state:"" },
  ]);

  const refresh = () => {
    const idx = steps.findIndex(s=>s.state==="current");
    if(idx >=0){
      const newSteps = steps.map((s,i)=>{
        if(i<idx) return {...s,state:"done"};
        if(i===idx) return {...s,state:"done"};
        if(i===idx+1) return {...s,state:"current"};
        return s;
      });
      setSteps(newSteps);
      if(idx+1>=steps.length){
        setStatus("승인 완료");
        alert("최종 승인이 완료되었습니다.");
      }
    }
  };

  const cancel = () => {
    if(confirm("신청을 취소하시겠습니까?")){
      setStatus("취소됨");
      alert("신청이 취소되었습니다.");
    }
  };

  return (
    <main className="main">
      <header>
        <div className="crumbs">학사관리 &gt; 휴·복학 &gt; <strong>진행상태</strong></div>
        <div className="titleRow">
          <h1 className="title">제출 / 승인 진행상태</h1>
          <span className="statusBadge">{status}</span>
        </div>
      </header>

      <section className="card section">
        <h2>승인 단계</h2>
        <ol className="timeline">
          {steps.map((s,i)=>(
            <li key={i} className={s.state}><span className="dot"></span> {s.text}</li>
          ))}
        </ol>

        <div className="divider"></div>

        <div className="sectionActions">
          <a href="#" className="btn ghost" onClick={(e)=>{e.preventDefault();alert("신청서로 돌아가기 (데모)");}}>신청서로 돌아가기</a>
          <button type="button" className="btn secondary" onClick={refresh}>새로고침</button>
          <button type="button" className="btn danger" onClick={cancel}>신청 취소</button>
        </div>
      </section>

      <section className="bottomInfo">
        <strong>문의</strong>
        <span>학사지원팀 02-000-0000 / 담당자: registrar@dsc.ac.kr</span>
      </section>
    </main>
  );
}
