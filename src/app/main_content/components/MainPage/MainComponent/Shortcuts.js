// app/components/MainComponent/Shortcuts.js
"use client";

export default function Shortcuts() {
  return (
    <div className="card">
      <div className="card5">
        <span className="session">
          <img src="/assest/img/휴학신청.png" alt="휴학 및 복학 신청" />
          <img src="/assest/img/계절학기 등록납부.png" alt="수강신청" />
          <img src="/assest/img/성적조회.png" alt="성적조회" />
          <p>휴학 및 복학 신청</p>
          <p>수강신청</p>
          <p>성적조회</p>
        </span>

        <span className="session">
          <img src="/assest/img/강의평가.png" alt="강의평가" />
          <img src="/assest/img/강의평가.png" alt="출석조회" />
          <img src="/assest/img/강의평가.png" alt="시간표 조회" />
          <p>강의평가</p>
          <p>출석조회</p>
          <p>시간표 조회</p>
        </span>
      </div>
    </div>
  );
}
