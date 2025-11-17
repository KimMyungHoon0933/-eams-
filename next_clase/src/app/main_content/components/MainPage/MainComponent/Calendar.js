// app/components/MainComponent/Calendar.js
"use client";

import { useState } from "react";
import "./MainComponent_css/calendar.css"

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function Calendar({
  onPrev,
  onNext,
  title,
  renderGrid,
}) {
  const [viewDate, setViewDate] = useState(() => new Date());

  const year = viewDate.getFullYear();
  const monthIndex = viewDate.getMonth();
  const monthTitle = title ?? `${year}년 ${monthIndex + 1}월`;

  const buildDefaultGrid = () => {
    const cells = [];

    WEEKDAYS.forEach((label, idx) => {
      cells.push(
        <div
          key={`weekday-${idx}`}
          className="calendar-cell calendar-weekday"
        >
          {label}
        </div>
      );
    });

    const firstDayOfMonth = new Date(year, monthIndex, 1).getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    for (let i = 0; i < firstDayOfMonth; i += 1) {
      cells.push(
        <div
          key={`empty-${i}`}
          className="calendar-cell calendar-empty"
        />
      );
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(
        <div
          key={`day-${day}`}
          className="calendar-cell calendar-day"
        >
          {day}
        </div>
      );
    }

    return cells;
  };

  const handlePrev = () => {
    if (onPrev) return onPrev();
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNext = () => {
    if (onNext) return onNext();
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const gridContent = renderGrid ?? buildDefaultGrid();

  return (
    // card에 따로 클래스 하나 더 줘서 스타일 조절
    <div className="card calendar-card">
      <div className="calendar-container">
        <div className="calendar-header">
          <button id="prevMonth" onClick={handlePrev} aria-label="이전 달">
            ◀
          </button>
          <h1 id="monthYear">{monthTitle}</h1>
          <button id="nextMonth" onClick={handleNext} aria-label="다음 달">
            ▶
          </button>
        </div>

        <div className="calendar-grid" id="calendarGrid">
          {gridContent}
        </div>
      </div>
    </div>
  );
}
