import IntegratedMenu from "../../components/IntegratedMenu";
import StudentInfoContainer from "../../components/Integrated_content/Studentinfo";

export default function StudentInfoPage() {
  return (
    <div style={{ display: "flex", alignItems: "flex-start" }}>
      {/* 좌측: 통합 메뉴 */}
      <IntegratedMenu />

      {/* 우측: 학생정보 영역을 가로 중앙 정렬 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          padding: "24px 16px",
        }}
      >

          <StudentInfoContainer />

      </div>
    </div>
  );
}
