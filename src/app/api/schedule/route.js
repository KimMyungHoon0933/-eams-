// src/app/api/schedule/route.js
export const runtime = "nodejs";

// 💡 DB 연결 임포트 (db.js 파일 사용)
import { db } from "@/lib/db"; 
import { NextResponse } from "next/server";

/**
 * 특정 강의의 수업 요일 목록을 조회하는 GET API
 * @param {Request} request 
 * @returns {NextResponse} 수업 요일 배열 (예: ["월", "수"])
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const lectureId = searchParams.get("classId"); 

        if (!lectureId) {
            return new NextResponse(JSON.stringify({ message: "classId가 필요합니다." }), { status: 400 });
        }

        // 🚨 DB 스키마 가정: Lecture_Schedule 테이블이 존재하며, 강의 요일을 저장함.
        // 요일은 '월', '화', '수', '목', '금' 중 하나로 저장된다고 가정합니다.
        const query = `
            SELECT 
                day_of_week 
            FROM 
                Lecture_Schedule 
            WHERE 
                lecture_id = ?
        `;
        
        const [scheduleRows] = await db.execute(query, [lectureId]);
        
        // 결과에서 요일만 추출하여 배열로 반환
        const scheduleDays = scheduleRows.map(row => row.day_of_week);

        return NextResponse.json(scheduleDays);

    } catch (e) {
        console.error("수업 일정 로드 오류:", e);
        return new NextResponse(JSON.stringify({ message: "수업 일정을 로드하는 데 실패했습니다.", error: e.message }), { status: 500 });
    }
}