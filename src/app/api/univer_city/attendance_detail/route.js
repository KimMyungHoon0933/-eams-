// src/app/api/univer_city/attendance_detail/route.js

export const runtime = "nodejs";
import { db } from "../../../../lib/db"; // 💡 DB 연결 경로 확인
import { NextResponse } from 'next/server';

/**
 * GET 요청 처리: 특정 날짜, 특정 강의의 전체 학생 출결 상세 조회
 * URL: /api/univer_city/attendance_detail?lectureId={id}&date={YYYY-MM-DD}
 */
export async function GET(request) {
    let connection;
    try {
        const { searchParams } = new URL(request.url);
        const lectureId = searchParams.get('lectureId');
        const attendanceDate = searchParams.get('date');

        if (!lectureId || !attendanceDate) {
            return NextResponse.json({ success: false, message: '강의 ID와 날짜가 필요합니다.' }, { status: 400 });
        }

        connection = await db.getConnection(); 

        // 1. 해당 강의 수강생 목록과 해당 날짜의 출석 기록을 JOIN하여 조회
        const query = `
            SELECT
                u.user_id AS studentId,
                s.student_id AS student_number, -- 학번
                u.user_name AS name,
                COALESCE(a.absent_hours, 0) AS absent_hours, -- 결석 시간 (출석 기록 없으면 0)
                a.status_code,                               -- 출결 상태 코드 (예: P, L, A, E)
                a.memo,
                a.late_reason
            FROM
                user u
            JOIN
                student s ON u.user_id = s.student_id
            JOIN
                enrollment e ON s.student_id = e.student_id
            LEFT JOIN
                attendance a ON e.enrollment_id = a.enrollment_id AND a.attendance_date = ?
            WHERE
                e.lecture_id = ?;
        `;
        
        const [results] = await connection.query(query, [attendanceDate, lectureId]);
        
        // 2. 클라이언트가 기대하는 형식으로 데이터 변환 (status_code 또는 absent_hours -> status 문자열)
        const studentsWithStatus = results.map(student => {
            let status = 'present'; // 기본값: 출석
            let hours = student.absent_hours;
            
            // 💡 DB에 status_code 필드가 있다면 그걸 사용 (예: P-출석, L-지각, A-결석, E-조퇴)
            if (student.status_code === 'L' || student.absent_hours === 1) {
                status = 'late';
            } else if (student.status_code === 'A' || student.absent_hours >= 2) {
                status = 'absent';
            } else if (student.status_code === 'E') {
                status = 'leave';
            } else if (student.status_code === 'P' || student.absent_hours === 0) {
                 status = 'present';
            } else if (student.status_code === null) {
                // 출석 기록이 아예 없는 경우 (LEFT JOIN)
                // 수업 요일인데 기록이 없으면 'unknown' 또는 '미처리'로 간주해야 함
                status = 'unknown'; 
                hours = 0;
            }
            
            return {
                studentId: student.studentId,
                name: student.name,
                student_number: student.student_number,
                status: status,
                hours: hours || 0,
                memo: student.memo || '',
                late_reason: student.late_reason || ''
            };
        });

        return NextResponse.json(studentsWithStatus, { status: 200 });

    } catch (error) {
        console.error('날짜별 출석 상세 조회 중 서버 오류 발생:', error);
        return NextResponse.json({ success: false, message: '서버 오류 발생' }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}