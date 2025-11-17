// src/app/api/univer_city/calendar_detail/route.js
export const runtime = "nodejs";

// 💡 DB 연결 임포트 (db.js 파일 사용)
import { db } from "@/lib/db"; 
import { NextResponse } from "next/server";

/**
 * 특정 강의/날짜의 학생별 출석 상세 정보를 포스트 형태로 조회하는 GET API
 * (지각 시간, 복합 상태 로직 포함)
 * @param {Request} request 
 * @returns {NextResponse} 학생별 출결 기록 배열
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const lectureId = searchParams.get('classId');
        const attendanceDate = searchParams.get('date');

        if (!lectureId || !attendanceDate) {
            return NextResponse.json({ success: false, message: '강의 ID와 날짜가 필요합니다.' }, { status: 400 });
        }

        // 1. 해당 강의의 수강생 목록과 해당 날짜의 출석 기록을 조인하여 조회
        const query = `
            SELECT
                u.user_id AS studentId,
                u.user_name AS studentName,
                -- 🚨 attendance 테이블에 late_minutes가 있다고 가정
                COALESCE(a.attendance_status, '미처리') AS dbStatus, 
                COALESCE(a.late_minutes, 0) AS lateMinutes
            FROM
                user u
            JOIN
                student s ON u.user_id = s.student_id
            JOIN
                enrollment e ON s.student_id = e.student_id
            LEFT JOIN
                attendance a ON e.lecture_id = a.lecture_id 
                            AND e.student_id = a.student_id
                            AND a.attendance_date = ?
            WHERE
                e.lecture_id = ?;
        `;
        
        const [results] = await db.execute(query, [attendanceDate, lectureId]);
        
        // 2. 클라이언트가 요구하는 복합 상태(status: ['출석', '지각'])로 데이터 변환
        const formattedResults = results.map(record => {
            const status = [];
            const { dbStatus, lateMinutes } = record;

            if (dbStatus === '결석' || dbStatus === '조퇴') {
                // 🚨 결석은 단독으로 표시
                status.push(dbStatus === '결석' ? '결석' : '조퇴'); 
            } else if (dbStatus === '지각' || lateMinutes > 0) {
                // 🚨 지각이 기록되거나 lateMinutes가 있으면 '출석'과 '지각'을 동시에 표시
                status.push('출석');
                status.push('지각');
            } else if (dbStatus === '출석') {
                // 정상 출석 (lateMinutes=0)
                status.push('출석');
            } else {
                // 미처리 또는 데이터 없음
                status.push('미처리');
            }
            
            return {
                studentId: record.studentId,
                studentName: record.studentName,
                status: status, // 배열 형태 ['출석'], ['출석', '지각'], ['결석']
                lateMinutes: lateMinutes, // 지각 시간
            };
        });

        return NextResponse.json(formattedResults, { status: 200 });

    } catch (error) {
        console.error('출석 상세 포스트 조회 중 서버 오류 발생:', error);
        return new NextResponse(JSON.stringify({ message: '출석 상세 정보를 로드하는 데 실패했습니다.', error: error.message }), { status: 500 });
    }
}