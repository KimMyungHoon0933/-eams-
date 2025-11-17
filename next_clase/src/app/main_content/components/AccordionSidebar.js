"use client";

import { useState } from "react";

/** (추가) 기본 메뉴 정의: 외부에서 넘기지 않으면 이 값 사용 */
const defaultSections = [
  { title: "학적", items: [{ title: "학적 관리", items: ["개인정보 관리"] }] },
  { title: "수 업", items: ["수업 시간표"] },
  { title: "수 강", items: ["수강관리", "수강출력"] },
  {
    title: "성 적",
    items: [
      { title: "성적처리", items: ["금학기 성적 조회(미관점)", "기이수성적조회"] },
      { title: "성적입력", items: ["성적입력", "성적출력"] },
    ],
  },
  { title: "출석", items: ["출석입력", "출석조회"] },
  { title: "휴학", items: ["휴학 신청", "복학 신청"] },
];

export default function AccordionSidebar({
  sections = defaultSections,     // ← (추가) 외부 주입 가능
  onSelect,
  selectedKey,
}) {
  const [openIndex, setOpenIndex] = useState(null);

  const makeKey = (secTitle, midTitle, leafTitle) =>
    [secTitle, midTitle, leafTitle].filter(Boolean).join(" > ");

  const isActive = (key) => selectedKey === key;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <button className="tab active">기본메뉴 ▼</button>
        <button className="tab">
          즐겨찾기 <span className="star">★</span>
        </button>
      </div>

      <ul className="menu-list">
        {sections.map((sec, idx) => {
          const isOpen = openIndex === idx;
          return (
            <li key={sec.title} className="menu-item">
              <button
                className={`menu-title ${isOpen ? "open" : ""}`}
                onClick={() => setOpenIndex(isOpen ? null : idx)}
              >
                <span>{sec.title}</span>
                <span
                  className="arrow"
                  style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
                >
                  ▶
                </span>
              </button>

              <ul className={`submenu ${isOpen ? "open" : ""}`}>
                {sec.items.map((it, i) => {
                  if (typeof it === "string") {
                    const key = makeKey(sec.title, null, it);
                    return (
                      <li
                        key={i}
                        role="button"
                        tabIndex={0}
                        className={`clickable ${isActive(key) ? "active" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect?.(key);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onSelect?.(key);
                          }
                        }}
                      >
                        {it}
                      </li>
                    );
                  }

                  return (
                    <li key={i}>
                      {it.title}
                      <ul className="submenu2">
                        {it.items.map((leaf, j) => {
                          const key = makeKey(sec.title, it.title, leaf);
                          return (
                            <li
                              key={j}
                              role="button"
                              tabIndex={0}
                              className={`clickable ${isActive(key) ? "active" : ""}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelect?.(key);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  onSelect?.(key);
                                }
                              }}
                            >
                              {leaf}
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
