// /src/app/api/univer_city/attendance_check/route.js
import { db } from "@/lib/db"; // 💡 DB 연결 경로 확인
import { NextResponse } from 'next/server';

/**
 * 💡 attendance 테이블의 absent_hours 값을 기반으로 상태를 변환합니다.
 * - 0: 출석 (absent_hours = 0)
 * - 1: 지각/조퇴 (absent_hours = 1) -> 
 * - 2 이상: 결석 (absent_hours >= 2)
 * * **주의:** 지각/조퇴를 구분하려면 attendance 테이블에 별도 컬럼이 필요합니다.
 * 현재 DB 스키마는 없는 것 같으므로, 모든 absent_hours=1을 '지각'으로 통일하고 
 * late_minutes를 10분으로 Mocking하여 클라이언트가 툴팁을 표시하게 합니다.
 */
function mapAttendanceStatus(hours) {
    if (hours === 0) return { status: '출석', minutes: 0 };
    if (hours === 1) return { status: '지각', minutes: 10 }; // 임의의 지각 시간
    if (hours >= 2) return { status: '결석', minutes: 0 };
    return { status: '미처리', minutes: 0 };
}


export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const month = searchParams.get('month'); // YYYY-MM 형식

    if (!courseId || !month) {
        return NextResponse.json({ message: '강의 ID와 월 정보가 필요합니다.' }, { status: 400 });
    }
    
    // 날짜 범위 계산
    const [year, monthNum] = month.split('-');
    const startDate = `${month}-01`;
    // 다음 달 1일 (JS Date 객체를 이용하여 안전하게 계산)
    const nextMonthDate = new Date(year, parseInt(monthNum), 1);
    const nextMonth = nextMonthDate.toISOString().split('T')[0]; // YYYY-MM-DD


    const query = `
        SELECT
            T1.attendance_date,
            T3.user_id AS studentId,
            T3.user_name AS studentName,
            T1.absent_hours,
            T1.note AS memo
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
    `;

    try {
        const [results] = await db.execute(query, [courseId, startDate, nextMonth]);
        
        // 클라이언트가 기대하는 형식으로 데이터 변환
        const attendanceData = results.map(row => {
            const { status, minutes } = mapAttendanceStatus(row.absent_hours);
            return {
                date: row.attendance_date ? row.attendance_date.toString().substring(0, 10) : null,
                studentId: row.studentId,
                studentName: row.studentName,
                attendance_status: status, // '출석', '지각', '결석', '조퇴'
                late_minutes: minutes,
                memo: row.memo || '', // 💡 [수정] 쿼리에서 AS memo로 가져옴
            };
        });

        return NextResponse.json(attendanceData, { status: 200 });

    } catch (error) {
        console.error('월별 출결 데이터 조회 중 서버 오류 발생:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}