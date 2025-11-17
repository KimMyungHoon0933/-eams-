// /src/app/api/univer_city/attendance_check/route.js

import { db } from "@/lib/db"; 
import { NextResponse } from 'next/server';

/**
 * absent_hours 값을 기반으로 상태를 변환합니다. (AttendanceCheck.js와 통일)
 */
function mapAttendanceStatus(hours) {
    if (hours === 0) return { status: '출석', minutes: 0 };
    if (hours === 1) return { status: '지각', minutes: 10 }; // 임의의 지각 시간 (조퇴/지각 구분 필드 없을 시)
    if (hours >= 2) return { status: '결석', minutes: 0 };
    return { status: '미처리', minutes: 0 };
}


export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const month = searchParams.get('month'); // YYYY-MM

    if (!courseId || !month) {
        return NextResponse.json({ message: '강의 ID와 월 정보가 필요합니다.' }, { status: 400 });
    }

    const startDate = `${month}-01`;
    // 다음 달의 첫 날을 계산하여 WHERE T1.attendance_date < nextMonth 에 사용합니다.
    const [year, monthNum] = month.split('-').map(Number);
    const nextMonthDate = new Date(year, monthNum, 1);
    const nextMonth = nextMonthDate.toISOString().split('T')[0];
    
    // T1: attendance, T2: enrollment, T3: user, T4: student
    const query = `
        SELECT
            T1.attendance_date, 
            T3.user_id AS studentId,
            T3.user_name AS studentName,
            T1.absent_hours,
            T1.note  -- attendance 테이블에 메모 필드가 있다고 가정
        FROM 
            attendance T1
        JOIN 
            enrollment T2 ON T1.enrollment_id = T2.enrollment_id
        JOIN 
            student T4 ON T2.student_id = T4.student_id
        JOIN
            user T3 ON T4.student_id = T3.user_id
        WHERE 
            T2.lecture_id = ? AND T1.attendance_date >= ? AND T1.attendance_date < ?
        ORDER BY 
            T1.attendance_date, T3.user_id;
    `; //

    try {
        const [results] = await db.execute(query, [courseId, startDate, nextMonth]);
        
        // 클라이언트가 기대하는 형식으로 데이터 변환
        const attendanceData = results.map(row => {
            const { status, minutes } = mapAttendanceStatus(row.absent_hours);
            return {
                // DB Date 객체를 'YYYY-MM-DD' 문자열로 변환하여 'date' 필드에 담습니다.
                date: row.attendance_date ? row.attendance_date.toString().substring(0, 10) : null,
                studentId: row.studentId,
                studentName: row.studentName,
                attendance_status: status, 
                late_minutes: minutes,
                memo: row.note || '', // note는 T1.note를 의미
            };
        });
        
        return NextResponse.json(attendanceData, { status: 200 });

    } catch (error) {
        console.error('월별 출결 데이터 조회 중 서버 오류 발생:', error); 
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}