// app/components/AccordionSidebar.js
"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

/** 메뉴 정의 (기존과 동일) */
const sections = [
  { title: "학 적", items: ["학적 관리"] },
  { title: "수 업", items: ["수업 시간표 출력"] },
  { title: "수 강", items: ["수강관리", "수강출력"] },
  {
    title: "성 적",
    items: [
      { title: "성적처리", items: ["금학기 성적 조회(미관점)", "기이수성적조회"] },
      { title: "성적입력", items: ["성적입력", "성적출력"] },
    ],
  },
  { title: "출석", items: ["출석입력", "출석조회"] },
  { title: "상담", items: ["상담 내역"] },
  { title: "휴학", items: ["휴학 신청", "복학 신청"] },
  { title: "재학", items: ["상담 내역"] },
  { title: "졸 업", items: ["졸업 신청"] },
  { title: "문서조회", items: ["포트폴리오 관리"] },
];

export default function AccordionSidebar({ onSelect, selectedKey }) {
  const [openIndex, setOpenIndex] = useState(null);

  const router = useRouter();
  /** ✅ 휴학/복학 처리 전용 상태 변수: back_school */
  const [back_school, setBack_school] = useState("");

  const makeKey = (secTitle, midTitle, leafTitle) =>
    [secTitle, midTitle, leafTitle].filter(Boolean).join(" > ");

  const isActive = (key) => selectedKey === key;

  /** 공통 클릭 핸들러 */
  const handleItem = (key) => {
    // "휴학 > 복학 신청"만 back_school 상태에 경로 저장
    if (key === "휴학 > 복학 신청") {
     // setBack_school("/Integrated/back_school");
     // console.log("back_school =", "/Integrated/back_school"); // 확인용 로그;
     // window.location.assign("/Integrated/back_school");
      router.push("/Integrated/back_school");
      return;
    }

    // 나머지는 우측 패널에 그대로 렌더
    onSelect?.(key);
  };

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
                  // 1단계: 단순 문자열 항목
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
                          handleItem(key);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleItem(key);
                          }
                        }}
                      >
                        {it}
                      </li>
                    );
                  }

                  // 2단계: 하위 메뉴(제목 + items[])
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
                                handleItem(key);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  handleItem(key);
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

      {/* (선택) 디버그용 뱃지 — 현재 back_school 상태 확인 */}
      {/* <div style={{marginTop:8, fontSize:12, color:'#666'}}>back_school: {back_school}</div> */}
    </aside>
  );
}
