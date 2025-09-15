"use client";
import { useState } from "react";


const sections = [
{ title: "학 적", items: ["학적 관리"] },
{ title: "수 업", items: ["수업 시간표 출력"] },
{ title: "수 강", items: ["수강관리", "수강출력"] },
{
  title: "성 적",
  items: [
    { title: "성적처리", items: ["금학기 성적 조회(미관점)", "기이수성적조회"] },
    { title: "성적입력", items: ["성적입력", "성적출력"] }
  ],
},
{ title: "출석", items: ["출석입력", "출석조회"] },
{ title: "상담", items: ["상담 내역"] },
{ title: "휴학", items: ["휴학 신청","복학 신청"] },
{ title: "재학", items: ["상담 내역"] },
{ title: "졸 업", items: ["졸업 신청"] },
{ title: "문서조회", items: ["포트폴리오 관리"] },
];


export default function AccordionSidebar() {
const [openIndex, setOpenIndex] = useState(null);


return (

<aside className="sidebar">
<div className="sidebar-header">
<button className="tab active">기본메뉴 ▼</button>
<button className="tab">즐겨찾기 <span className="star">★</span></button>
</div>


<ul className="menu-list">
{sections.map((sec, idx) => {
const isOpen = openIndex === idx;
return (
<li key={sec.title} className="menu-item">
<button
className="menu-title"
onClick={() => setOpenIndex(isOpen ? null : idx)}
>
<span>{sec.title}</span>
<span className="arrow" style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
</button>


<ul className={`submenu ${isOpen ? "open" : ""}`}>
{sec.items.map((it, i) => {
if (typeof it === "string") {
return <li key={i}>{it}</li>;
}
return (
<li key={i}>
{it.title}
<ul className="submenu2">
{it.items.map((s, j) => (
<li key={j}>{s}</li>
))}
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