// src/app/api/univer_city/attendance_data/route.js (최종 DB 연결 코드)

export const runtime = "nodejs";
import { db } from "../../../../lib/db"; // 💡 DB 연결 경로 확인
import { NextResponse } from 'next/server';

export async function GET(request) {
    let connection;
    try {
        // 1. URL에서 쿼리 파라미터(lectureId, date)를 추출
        const { searchParams } = new URL(request.url);
        const lectureId = searchParams.get('lectureId');
        const attendanceDate = searchParams.get('date');

        if (!lectureId || !attendanceDate) {
            return NextResponse.json({ success: false, message: '강의 ID와 날짜가 필요합니다.' }, { status: 400 });
        }

        connection = await db.getConnection(); 

        // 2. 학생 목록과 해당 날짜의 출석 상태를 조회하는 쿼리
        const query = `
            SELECT
                u.user_id AS studentId, -- 클라이언트에서 studentId로 사용
                u.user_name AS name,
                COALESCE(a.absent_hours, 0) AS absent_hours, -- 출석 기록이 없으면 0 (출석)으로 간주
                e.enrollment_id
            FROM
                user u
            JOIN
                student s ON u.user_id = s.student_id
            JOIN
                enrollment e ON s.student_id = e.student_id
            LEFT JOIN -- LEFT JOIN을 사용하여 출석 기록이 없는 학생도 포함 (미처리/출석)
                attendance a 
                ON e.enrollment_id = a.enrollment_id AND a.attendance_date = ? -- 해당 날짜만 필터링
            WHERE
                e.lecture_id = ? -- 해당 강의만 필터링
            ORDER BY
                u.user_id;
        `;
        
        const [results] = await connection.query(query, [attendanceDate, lectureId]);
        
        // 3. 클라이언트가 기대하는 형식으로 데이터 변환 (absent_hours -> status 문자열)
        const studentsWithStatus = results.map(student => {
            let status = '미처리';
            if (student.absent_hours === 0) {
                status = '출석';
            } else if (student.absent_hours === 1) {
                status = '지각'; // 1시간 결석으로 간주
            } else if (student.absent_hours >= 2) {
                status = '결석'; // 2시간 이상 결석으로 간주
            }
            
            return {
                ...student,
                // AttendanceContent.js가 기대하는 필드명으로 변환
                id: student.studentId, // AttendanceCard에서 key로 사용
                attendance_status: status, // AttendanceContent.js가 기대하는 필드명
                memo: '', // 메모는 현재 쿼리에 없으므로 빈 문자열
                late_reason: '', // 지각 사유도 현재 쿼리에 없으므로 빈 문자열
            };
        });

        return NextResponse.json(studentsWithStatus, { status: 200 });

    } catch (error) {
        console.error('출석 데이터 조회 중 서버 오류 발생:', error);
        // 클라이언트가 200이 아닐 경우 에러를 던지므로 500을 반환
        return NextResponse.json({ 
            success: false, 
            message: 'DB 조회 중 서버 오류가 발생했습니다.', 
            detail: error.message,
        }, { status: 500 });
    } finally {
        if (connection) {
            connection.release(); // DB 커넥션 반환
        }
    }
}