// app/components/MainComponent/QuickMenu.js
"use client";

export default function QuickMenu({ title = "Quick menu", items }) {
  // 기본 항목(미지정 시)
  const defaultItems = [
    "강의 시간표",
    "학점취득현황",
    "나의 E-class",
    "학사일정",
    "장학정보조회",
    "상담내역조회",
    "학적변동정보",
    "채용정보",
  ];

  const list = Array.isArray(items) && items.length ? items : defaultItems;

  return (
    <div className="card">
      <div className="Quickmenu">
        <h3>{title}</h3>
        <div className="quick-links">
          <ul className="left-column">
            {list.map((label, i) => (
              <li key={i}>{label}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
