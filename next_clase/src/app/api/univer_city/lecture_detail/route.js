// src/app/api/univer_city/lecture_detail/route.js

import { db } from "@/lib/db"; // 💡 DB 연결 경로
import { NextResponse } from 'next/server';

/**
 * GET 요청 처리: 특정 강의 ID의 요일 정보 조회
 * URL: /api/univer_city/lecture_detail?lectureId={id}
 */
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    // 클라이언트에서 'currentCourseId'를 'lectureId' 파라미터로 전달한다고 가정합니다.
    const lectureId = searchParams.get('lectureId'); 

    if (!lectureId) {
        return NextResponse.json({ message: '강의 ID가 필요합니다.' }, { status: 400 });
    }

    // Lecture 테이블에서 해당 강의 ID의 'day_of_week'를 조회하는 쿼리입니다.
    // '월,수,금' 또는 '월' 형태로 저장되어 있다고 가정합니다.
    const query = `
        SELECT 
            lecture_name, 
            day_of_week
        FROM 
            Lecture
        WHERE 
            lecture_id = ?;
    `;

    try {
        // [results]는 쿼리 결과 배열을 의미합니다.
        const [results] = await db.execute(query, [lectureId]); 
        
        if (results.length === 0) {
             // 404: 해당 강의를 찾을 수 없음
             return NextResponse.json({ message: '해당 강의를 찾을 수 없습니다.' }, { status: 404 });
        }
        
        // 찾은 강의 정보를 반환합니다.
        return NextResponse.json(results[0], { status: 200 });

    } catch (error) {
        console.error('강의 상세 정보 조회 중 서버 오류 발생:', error); 
        // 500: 서버 내부 오류
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}