// ToolCol.js
'use client';

import FilterSection from './FilterSection';
import MemoSection from './MemoSection';
import ClassInfoSection from './ClassInfoSection';
import WeekSelectSection from './WeekSelectSection';

const toast = (msg) => alert(msg);  

export default function ToolCol({ onShowAbsentList }) {

  return (
    <aside className={styles.toolCol}>

      {/* 1. 주차 선택 카드 */}
      <WeekSelectSection 
      />
      <div className="divider"></div>

      {/* 2. 오늘 수업정보 카드 */}
      <ClassInfoSection />
      
      <div className="divider"></div>
      
      {/* 3. 필터 섹션 */}
      <FilterSection onShowAbsentList={onShowAbsentList} />

      <div className="divider"></div>

      {/* 4. 메모 섹션 */}
      <MemoSection />
      
    </aside>
  );
}