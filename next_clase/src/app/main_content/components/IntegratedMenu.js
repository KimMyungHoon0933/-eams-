// IntegratedMenu.js
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AccordionSidebar from "./AccordionSidebar";
import "./css/UnvierFuction_menu.css";

export default function IntegratedMenu() {
  const router = useRouter();
  const [userType, setUserType] = useState(null); // "student" | "professor" | "employee" | "teaching_assistant" | null
  const [loading, setLoading] = useState(true);

  // --- 메뉴 세트 정의: 학생/교직원 분기 ---
  // (요청하신 그대로: defaultSections 형태를 1번에서 만들어 2번에 넘겨줍니다)
  const sectionsStudent = useMemo(
    () => [
      { title: "학적", items: ["개인정보 관리"] } ,
      { title: "수 업", items: ["수업 시간표"] },
      { title: "수 강", items: ["수강관리", "수강출력"] },
      {
        title: "성 적",
        items: [
          { title: "성적처리", items: ["기이수성적조회"] },
          // 학생은 '성적입력' 권한이 없다고 가정하여 생략하거나 막습니다.
          // 필요하면 아래 주석 해제해서 보여줄 수 있습니다.
          // { title: "성적입력", items: ["성적입력", "성적출력"] },
        ],
      },
      { title: "출석", items: ["출석조회"] }, // 학생은 조회 중심
      { title: "휴학", items: ["휴학 신청", "복학 신청"] },
    ],
    []
  );

  const sectionsStaff = useMemo(
    () => [
      { title: "학적", items: ["개인정보 관리"] },
      { title: "수 업", items: ["수업 시간표"] },
      { title: "수 강", items: ["수강관리", "수강출력"] },
      {
        title: "성 적",
        items: [
          { title: "성적입력", items: ["성적입력", "성적출력"] }, // 교원/직원용
        ],
      },
      { title: "출석", items: ["출석입력", "출석조회"] },
      { title: "휴학", items: ["휴학 신청", "복학 신청"] },
    ],
    []
  );

  // --- 라우팅 맵 (학생/교직원 공통) ---
  const routeMapStudent = useMemo(
    () => ({
      "학적 > 개인정보 관리":"/main_content/Integrated/student_info",
            "수 업 > 수업 시간표" :"/main_content/Integrated/timetable",
      "휴학 > 휴학 신청": "/main_content/Integrated/leave_school",
      "휴학 > 복학 신청": "/main_content/Integrated/back_school",
      "출석 > 출석조회": "/main_content/Integrated/attendance-check",
      "성 적 > 성적처리 > 금학기 성적 조회(미관점)":
        "/main_content/Integrated/grades/current",
      "성 적 > 성적처리 > 기이수성적조회":
        "/main_content/Integrated/student_grades_export",
    }),
    []
  );

  const routeMapStaff = useMemo(
    () => ({
      "학적 > 개인정보 관리":"/main_content/Integrated/student_info",
      "수 업 > 수업 시간표" :"/main_content/Integrated/timetable",
      "휴학 > 휴학 신청": "/main_content/Integrated/leave_school",
      "휴학 > 복학 신청": "/main_content/Integrated/back_school",
      "출석 > 출석입력": "/main_content/Integrated/attendance-input",
      "출석 > 출석조회": "/main_content/Integrated/attendance-check",
      "성 적 > 성적처리 > 기이수성적조회":
        "/main_content/Integrated/grades/history",
      "성 적 > 성적입력 > 성적입력": "/main_content/Integrated/grades-input",
      "성 적 > 성적입력 > 성적출력": "/main_content/Integrated/grade_export",
    }),
    []
  );

  const normalizeUserType = (raw) => {
    if (!raw || typeof raw !== "string") return null;
    const t = raw.trim().toLowerCase();
    if (t === "employ") return "employee";
    return t; // "student" | "employee" | "professor" | "teaching_assistant"
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:3000/api/univer_city/user_route", {
          cache: "no-store",
          credentials: "same-origin",
        });
        const data = await res.json().catch(() => ({}));
        const normalized = normalizeUserType(data?.user_type);
        if (alive) setUserType(normalized);
      } catch {
        if (alive) setUserType(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // user_type에 따른 메뉴/라우팅 선택
  const selectedSections = useMemo(() => {
    if (userType === "student") return sectionsStudent;
    if (userType === "employee" || userType === "professor" || userType === "teaching_assistant")
      return sectionsStaff;
    return sectionsStudent; // 알 수 없으면 학생 기본
  }, [userType, sectionsStudent, sectionsStaff]);

  const routeMap = useMemo(() => {
    if (userType === "student") return routeMapStudent;
    if (userType === "employee" || userType === "professor" || userType === "teaching_assistant")
      return routeMapStaff;
    return routeMapStudent;
  }, [userType, routeMapStudent, routeMapStaff]);

  const handleSelect = (key) => {
    const path = routeMap[key];
    if (path) {
      router.push(path);
    } else {
      console.warn(`[IntegratedMenu] routeMap에 매핑이 없습니다: ${key}`);
    }
  };

  return (
    <div className="route-integrated">
      <div className="integrated-container">
        <div className="integrated-body">
          {loading ? (
            <div style={{ padding: 16 }}>메뉴 로딩 중…</div>
          ) : (
            // ★ 여기서 2번(AccordionSidebar)로 'sections'를 명시적으로 넘겨줍니다.
            <AccordionSidebar sections={selectedSections} onSelect={handleSelect} />
          )}
        </div>
      </div>
    </div>
  );
}

