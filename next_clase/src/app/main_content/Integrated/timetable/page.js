"use client";
// app/**/timetable/page.js  (경로는 너의 프로젝트 구조에 맞춰 사용)
// 지금 올려둔 page.js 내용을 이걸로 교체


import IntegratedMenu from "../../components/IntegratedMenu";
import Timetable from "../../components/timetable/timetable_bigsize"; // timetable.js와 같은 폴더면 이렇게, 아니면 상대경로 조정

export default function TimetablePage() {
  return (
    <div>   
       <div style={{ display: "flex", alignItems: "flex-start" }}>
          <IntegratedMenu />

        <div style={{ padding: 16 }}>
                <Timetable />
       </div>
            </div>
    </div>
  );
}
