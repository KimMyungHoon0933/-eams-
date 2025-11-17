// /src/app/api/univer_city/lecture_dates/route.js
import { db } from "@/lib/db"; // 💡 DB 연결 경로 확인
import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
        return NextResponse.json({ success: false, message: '강의 ID가 필요합니다.' }, { status: 400 });
    }

    // 💡 Lecture 테이블에 강의 요일 정보가 저장되어 있다고 가정
    // 예를 들어, 월요일/수요일 강의라면 월, 수 강의 날짜를 반환해야 합니다.
    // 여기서는 간단하게 해당 강의의 모든 출결 기록 날짜를 반환하도록 가정합니다.
    const query = `
        SELECT DISTINCT DATE_FORMAT(attendance_date, '%Y-%m-%d') AS lectureDate
        FROM attendance
        JOIN enrollment ON attendance.enrollment_id = enrollment.enrollment_id
        WHERE enrollment.lecture_id = ?
        ORDER BY lectureDate;
    `;
    
    try {
        const [results] = await db.execute(query, [courseId]);
        
        // 날짜 문자열 배열로 변환: ["YYYY-MM-DD", ...]
        const lectureDates = results.map(row => row.lectureDate); 

        return NextResponse.json(lectureDates, { status: 200 });

    } catch (error) {
        console.error('강의 날짜 조회 중 서버 오류 발생:', error);
        return NextResponse.json({ success: false, message: 'DB 오류' }, { status: 500 });
    }
}