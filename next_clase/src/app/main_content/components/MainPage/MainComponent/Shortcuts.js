// app/components/MainComponent/Shortcuts.js
"use client";
import "./MainComponent_css/shortcut.css"

export default function Shortcuts() {
  return (
    <div className="card">
      <div className="card5 shortcut-container">
        <div className="shortcut-item">
          <img src="/assest/img/휴학신청.png" alt="휴학 및 복학 신청" />
          <p>휴학 및 복학 신청</p>
        </div>

        <div className="shortcut-item">
          <img src="/assest/img/계절학기 등록납부.png" alt="수강신청" />
          <p>학점조회</p>
        </div>

        <div className="shortcut-item">
          <img src="/assest/img/성적조회.png" alt="성적조회" />
          <p>성적조회</p>
        </div>

        <div className="shortcut-item">
          <img src="/assest/img/강의평가.png" alt="강의평가" />
          <p>강의평가</p>
        </div>

        <div className="shortcut-item">
          <img src="/assest/img/강의평가.png" alt="출석조회" />
          <p>출석조회</p>
        </div>

        <div className="shortcut-item">
          <img src="/assest/img/강의평가.png" alt="시간표 조회" />
          <p>시간표 조회</p>
        </div>
      </div>
    </div>
  );
}
