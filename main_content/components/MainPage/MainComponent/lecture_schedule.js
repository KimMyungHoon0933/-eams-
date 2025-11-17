// app/components/MainComponent/lecture_schedule.js
"use client";

export default function LectureSchedule({
  currentDate = "2025.05.04(일)",
  onPrev,
  onNext,
  onRefresh,
  children,
  emptyText = "데이터가 없습니다.",
}) {
  return (
    <div className="card">
      <div className="schedule-header">
        <span className="title">강의시간표</span>
        <button className="refresh-btn" onClick={onRefresh}>🔄</button>
      </div>

      <div className="schedule-date-nav">
        <button id="prev-day" onClick={onPrev}>◀</button>
        <span id="current-date">{currentDate}</span>
        <button id="next-day" onClick={onNext}>▶</button>
      </div>

      <div className="schedule-container">
        <div className="schedule-slide-track" id="slide-track">
          <div className="schedule-content" id="schedule-content">
            {children ?? emptyText}
          </div>
        </div>
      </div>
    </div>
  );
}
