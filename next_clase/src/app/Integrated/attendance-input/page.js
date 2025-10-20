// app/attendance-input/page.js
'use client';

import IntegratedMenu from '../../components/IntegratedMenu'; // ✅ 꼭 임포트
import AttendanceContent from '../../../app/components/AttendanceContent';
import "./style.module.css"

export default function AttendanceInputPage() {
  return (
    <div style={{display :"flex" ,alignItems:"flex-start"}}>
<IntegratedMenu/>
    <AttendanceContent />
</div>
  );
}
