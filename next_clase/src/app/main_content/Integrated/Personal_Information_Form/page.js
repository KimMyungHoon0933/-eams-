// app/**/personal_information/page.js   (경로는 프로젝트 구조에 맞게 사용)
"use client";

import IntegratedMenu from "../../components/IntegratedMenu";
import PersonalInformationForm from "../../components/Integrated_content/Personal_Information_Form";

export default function PersonalInformationPage() {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        {/* 왼쪽 통합 메뉴 */}
        <IntegratedMenu />

        {/* 오른쪽 개인정보 수정 폼 */}
        <div style={{ padding: 16, flex: 1 }}>
          <PersonalInformationForm />
        </div>
      </div>
    </div>
  );
}
