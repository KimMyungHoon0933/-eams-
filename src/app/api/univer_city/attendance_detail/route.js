// src/app/api/univer_city/attendance_detail/route.js

import { db } from "@/lib/db"; // 💡 DB 연결 경로 확인
import { NextResponse } from 'next/server';

/**
 * GET 요청 처리: 특정 날짜, 특정 강의의 전체 학생 출결 상세 조회
 * URL: /api/univer_city/attendance_detail?lectureId={id}&date={YYYY-MM-DD}
 */
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const lectureId = searchParams.get('lectureId');

    if (!lectureId) {
        return NextResponse.json({ message: '강의 ID가 필요합니다.' }, { status: 400 });
    }

    // 🚨 Lecture 테이블에서 해당 강의 ID의 'day_of_week'를 조회
    const query = `
        SELECT 
            lecture_name, 
            day_of_week, 
            start_hours, 
            end_hours
        FROM 
            Lecture
        WHERE 
            lecture_id = ?;
    `;

    try {
        const [results] = await db.execute(query, [lectureId]);
        
        if (results.length === 0) {
             return NextResponse.json({ message: '해당 강의를 찾을 수 없습니다.' }, { status: 404 });
        }
        
        // 결과는 1개만 반환되므로 첫 번째 레코드를 반환
        return NextResponse.json(results[0], { status: 200 });

    } catch (error) {
        console.error('강의 상세 정보 조회 중 서버 오류 발생:', error); 
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}