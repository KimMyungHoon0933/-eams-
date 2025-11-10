// src/app/Integrated/grade_input/page.js
'use client';

import IntegratedMenu from "../../components/IntegratedMenu";
import GradesInputContent from "../../components/Integrated_content/grades_input_content"; // ✅ default import로 수정
import "./grades-input.css";

export default function GradesInputPage() {
  return (
    <div style={{ display: "flex", alignItems: "flex-start" }}>
      <IntegratedMenu />
      <div className="grades-input-page">
        <GradesInputContent />  {/* ✅ undefined 아님 - 정상 렌더링 */}
      </div>
    </div>
  );
}
