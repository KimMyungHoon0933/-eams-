"use client";
import IntegratedMenu from "../components/IntegratedMenu";

export default function Page() {
  // 예: 특정 메뉴를 기본으로 열고 싶으면 initialKey 전달
  // const initial = "휴학 > 복학 신청";
  return <IntegratedMenu /* initialKey={initial} */ />;
}
