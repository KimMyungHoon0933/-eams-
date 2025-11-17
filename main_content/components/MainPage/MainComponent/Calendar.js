// app/components/MainComponent/Calendar.js
"use client";

export default function Calendar({
  onPrev,
  onNext,
  title,              // 월/연도 텍스트를 외부에서 제어하고 싶을 때 사용 (옵션)
  renderGrid,         // 캘린더 셀 그리드(React 노드) 주입용 (옵션)
}) {
  return (
    <div className="card">
      <div className="calendar-container">
        <div className="calendar-header">
          <button id="prevMonth" onClick={onPrev} aria-label="이전 달">◀</button>
          {/* 외부 제어용 title 우선, 없으면 기존 id 유지 */}
          {title ? (
            <h1 id="monthYear">{title}</h1>
          ) : (
            <h1 id="monthYear"></h1>
          )}
          <button id="nextMonth" onClick={onNext} aria-label="다음 달">▶</button>
        </div>

        <div className="calendar-grid" id="calendarGrid">
          {/* 외부에서 캘린더 셀을 그려 넣고 싶으면 renderGrid 사용 */}
          {renderGrid}
        </div>
      </div>
    </div>
  );
}
