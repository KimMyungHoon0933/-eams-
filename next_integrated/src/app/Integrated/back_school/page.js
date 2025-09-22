// app/Integrated/back_school/page.js
"use client";

import AccordionSidebar from "../../components/AccordionSidebar";
import { BackSchoolApply } from "../../components/Integrated_content/back_school_content"; // 경로 확인
import "./backschool-standalone.css"; // ⬅️ 방금 만든 격리 CSS
import "../../../../public/assest/css/Integrated_content_css/back_school.css"
import "../UnvierFuction_menu.css"

export default function BackSchoolPage() {
  return (
    <div style={{ display: "flex", alignItems: "flex-start" }}>
      {/* 좌측: 메뉴(크기 그대로 유지) */}
      <AccordionSidebar />

      {/* 우측: input.html 그대로(크게) */}
      <div className="backschool">
        <BackSchoolApply />
      </div>
    </div>
  );
}
