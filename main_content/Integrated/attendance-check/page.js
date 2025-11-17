'use client'; // AttendanceCheck.js가 'use client' 이므로 페이지 파일에도 추가합니다.

import IntegratedMenu from '../../../../app/main_content/components/IntegratedMenu';
import AttendanceCheck from '../attendance-check/AttendanceCheck';

export default function AttendanceCheckPage() {
   return (
      <div style={{ display: "flex", alignItems: "flex-start" }}>
      <IntegratedMenu/>
        <div style={{ flex: 1 }}>
      <AttendanceCheck initialUserRole="professor" />
    </div>
  </div>
    
  );
}
// 이 페이지는 /attendance-check 경로로 접속할 때 렌더링됩니다.