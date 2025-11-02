// src/components/attendance/ToolCol.js (수정된 파일)
'use client';

// 분리된 컴포넌트 임포트
import FilterSection from './FilterSection';
import MemoSection from './MemoSection';
import ClassInfoSection from './ClassInfoSection';
import WeekSelectSection from './WeekSelectSection';
// ClassInfoSection과 WeekSelectSection도 추가로 분리 시 여기에 임포트

const toast = (msg) => alert(msg);

// AttendanceContent에서 onShowAbsentList를 props로 받도록 수정
export default function ToolCol({ onShowAbsentList }) {

  // 기존 '오늘 수업정보'와 '주차 선택' 영역은 ClassInfoSection과 WeekSelectSection으로 분리해야 하지만,
  // 여기서는 일단 기존 내용을 주석 처리하고 Filter와 Memo만 조합합니다.

  return (
    <aside className="toolCol">
      
      {/* 1. 필터 섹션 (분리됨) */}
      <FilterSection onShowAbsentList={onShowAbsentList} />

      {/* 2. 메모 섹션 (분리됨) */}
      <MemoSection />

      {/* 3. 오늘 수업정보 카드 (분리 예정 - 현재는 임시로 주석 처리) */}
      { <ClassInfoSection /> }

      {/* 4. 주차 선택 카드 (분리 예정 - 현재는 임시로 주석 처리) */}
      { <WeekSelectSection /> }
      
    </aside>
  );
}