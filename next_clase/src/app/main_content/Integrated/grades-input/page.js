// src/app/Integrated/grade_input/page.js
'use client';

import { useEffect, useState } from "react";
import IntegratedMenu from "../../components/IntegratedMenu";
import GradesInputContent from "../../components/Integrated_content/grades_input_content";
import "./grades-input.css";

export default function GradesInputPage() {
  const [isReady, setIsReady] = useState(false);

  // ✅ hydration 이후 렌더링 보장
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) return null;

  return (
    <div className="pageContainer">
      <IntegratedMenu />
      <div className="grades-input-page">
        <GradesInputContent />
      </div>
    </div>
  );
}
