// app/attendance-input/page.js
'use client';

import { useState, useEffect } from 'react';
import IntegratedMenu from '../../components/IntegratedMenu'; // ✅ 꼭 임포트
import AttendanceContent from '../../components/Integrated_content/attendance_input';
import styles from './style.module.css';



export default function AttendanceInputPage() {
  return (
    <div style={{display :"flex" ,alignItems:"flex-start"}}>
<IntegratedMenu/>
    <AttendanceContent />
</div>
  );
}
