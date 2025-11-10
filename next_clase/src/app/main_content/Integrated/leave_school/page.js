// app/main_content/Integrated/leave_school/page.js
"use client";

import IntegratedMenu from "../../components/IntegratedMenu";
import { LeaveSchoolApply } from "../../components/Integrated_content/leave_school_content";
import "../back_school/backschool-standalone.css"; // ✅ 복학신청 CSS 그대로 사용

export default function LeaveSchoolPage() {
  return (
    <div style={{ display: "flex", alignItems: "flex-start" }}>
      {/* 왼쪽: 메뉴 */}
      <IntegratedMenu />

      {/* 오른쪽: 휴학신청 콘텐츠 */}
      <div className="backschool">
        <LeaveSchoolApply />
      </div>
    </div>
  );
}
