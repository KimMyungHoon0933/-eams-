    // app/main_content/Integrated/student_grades_export/page.js

import IntegratedMenu from "../../components/IntegratedMenu";
import StudentGradesExport from "../../components/Integrated_content/student_grades_export";


export default function StudentGradesExportPage() {
  return (
    <div style={{ display: "flex", alignItems: "flex-start" }}>
      {/* 좌측: 통합 메뉴 */}
      <IntegratedMenu />

      {/* 우측: 성적 출력 컴포넌트 영역을 가로 중앙 정렬 */}

        {/* 너무 넓지 않게 최대 폭 제한 */}

          <StudentGradesExport />


    </div>
  );
}