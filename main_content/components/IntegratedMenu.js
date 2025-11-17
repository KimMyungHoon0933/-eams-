"use client";

import { useRouter } from "next/navigation";
import AccordionSidebar from "./AccordionSidebar";
import "./css/UnvierFuction_menu.css"; // 경로는 프로젝트에 맞게 유지하세요

/**
 * 통합 메뉴 컨테이너
 * - 모든 메뉴 클릭 시 라우팅만 수행
 * - 우측 콘텐츠 패널 제거 (흰색바 방지)
 * - 개별 화면은 각 라우트 페이지에서 구현
 */
export default function IntegratedMenu({
  sections,       // (선택) 사이드바 섹션 구조
  onSelect,       // (선택) 외부 선택 콜백
}) {
  const router = useRouter();

  // ✅ 메뉴 키 → 라우트 경로 매핑
  //  필요에 따라 freely 수정하세요.
  const routeMap = {
    // 휴·복학
    "휴학 > 휴학 신청": "/main_content/Integrated/leave_school",
    "휴학 > 복학 신청": "/main_content//Integrated/back_school",
    "휴학 > 복학 신청": "/main_content//Integrated/back_school",

    "출석 > 출석조회":"/main_content//Integrated/attendance-check",
    "출석 > 출석입력": "/main_content//Integrated/attendance-input",

    // 성적처리 (조회)
    "성 적 > 성적처리 > 금학기 성적 조회(미관점)": "/main_content//Integrated/grades/current",
    "성 적 > 성적처리 > 기이수성적조회": "/main_content//Integrated/grades/history",

    // 성적입력
    "성 적 > 성적입력 > 성적입력": "/main_content//Integrated/grades-input",
    "성 적 > 성적입력 > 성적출력": "/main_content//Integrated/grade_export",

    // 필요 시 계속 추가…
    // "카테고리 > 메뉴명": "/원하는/경로",
  };

  const handleSelect = (key) => {
    onSelect?.(key); // 외부 필요 시 알림

    const path = routeMap[key];
    if (path) {
      router.push(path);           // ✅ 즉시 라우팅
    } else {
      // 매핑이 없으면 안전하게 홈 혹은 기본 경로로 이동하도록 선택
      // router.push("/Integrated"); // 필요 시 주석 해제
      console.warn(`[IntegratedMenu] routeMap에 매핑이 없습니다: ${key}`);
    }
  };

  return (
    <div className="route-integrated">
      <div className="integrated-container">
        <div className="integrated-body">
          {/* 좌측 메뉴만 렌더링 (우측 패널 없음) */}
          <AccordionSidebar
            sections={sections}
            onSelect={handleSelect}
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
 이곳은 혹시 몰라 따로 배치 해둔 뼈대로 현재 이곳 아래의 함수들은 사용 하지 않습니다.
 * ------------------------------------------------------------------ */

// 휴학 신청 폼 뼈대
export function LeaveRequestPageSkeleton() {
  // TODO: 휴학 신청 화면을 이 라우트의 page.js에서 구현
  return null;
}

// 복학 신청 폼 뼈대
export function BackToSchoolPageSkeleton() {
  // TODO: 복학 신청 화면을 이 라우트의 page.js에서 구현
  return null;
}

// 성적 조회(금학기) 뼈대
export function CurrentGradesPageSkeleton() {
  // TODO: 금학기 성적 조회 화면을 이 라우트의 page.js에서 구현
  return null;
}

// 성적 조회(기이수) 뼈대
export function HistoryGradesPageSkeleton() {
  // TODO: 기이수 성적 조회 화면을 이 라우트의 page.js에서 구현
  return null;
}

// 성적 입력 뼈대
export function GradeInputPageSkeleton() {
  // TODO: 성적 입력 화면을 이 라우트의 page.js에서 구현
  return null;
}

// 성적 출력(내보내기) 뼈대
export function GradeExportPageSkeleton() {
  // TODO: 성적 출력(내보내기) 화면을 이 라우트의 page.js에서 구현
  return null;
}

