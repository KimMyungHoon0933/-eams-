import IntegratedMenu from "../../components/IntegratedMenu";
import { LeaveSchoolApply } from "../../components/Integrated_content/leave_school_content";

export default function LeaveSchoolPage() {
  return (
    <div style={{ display: "flex", alignItems: "flex-start" }}>
      {/* 좌측: 통합 메뉴 (그대로) */}
      <IntegratedMenu />

      {/* 우측: 휴학 신청 컴포넌트 영역을 가로 중앙 정렬 */}
      <div
        style={{
          flex: 1,                    // 남은 영역을 전부 차지
          display: "flex",
          justifyContent: "center",   // 가로 중앙
          padding: "24px 16px",       // 양옆 여백
        }}
      >
        {/* 최대 폭을 제한해서 너무 넓지 않게 */}
        <div style={{ width: "100%", maxWidth: 760 }}>
          <LeaveSchoolApply />
        </div>
      </div>
    </div>
  );
}