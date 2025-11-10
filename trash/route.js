// /api/univer_city/insert_attendance/route.js (백엔드 파일)
export const runtime = "nodejs";
import { db } from "@/lib/db";
import { NextResponse } from 'next/server';
// ✅ POST /api/attendance/save (출석 데이터 저장/수정 엔드포인트)
export async function POST(request) { // req 대신 request 사용 (Next.js 표준)
    
    // 💡 3. 요청 본문(Body)을 JSON으로 파싱
    const { lectureId, attendanceDate, attendanceData } = await request.json(); 

    if (!lectureId || !attendanceDate || !attendanceData || attendanceData.length === 0) {
        // 💡 NextResponse를 사용하여 응답
        return NextResponse.json({ success: false, message: '필수 데이터가 누락되었습니다.' }, { status: 400 });
    }

    const LECTURE_ID_NUM = parseInt(lectureId, 10); 
    if (isNaN(LECTURE_ID_NUM)) {
         return NextResponse.json({ success: false, message: '유효하지 않은 강의 ID입니다.' }, { status: 400 });
    }

    let connection;
    try {
        connection = await db.getConnection(); // DB 커넥션을 얻습니다.
        await connection.beginTransaction(); // 트랜잭션 시작 (전체 성공/실패 보장)

        // 1. 전송된 각 학생의 출석 데이터를 순회하며 처리
        for (const record of attendanceData) {
            const { studentId, status } = record;

            // attendance_status 값 매핑 (DB 스키마에 따라 숫자로 저장할 수 있음)
            // '출석' -> 'P', '지각' -> 'L', '결석' -> 'A', '미처리' -> 'N' 등으로 가정
            // 💡 1. lectureId와 studentId를 이용해 enrollment_id 조회
            const studentIdNumber = parseInt(studentId, 10);

            if (isNaN(studentIdNumber)) {
                throw new Error(`유효하지 않은 학생 ID입니다. student ID: ${studentId}`);
    }
            
            const [enrollmentResult] = await connection.query(
                `SELECT enrollment_id   
                 FROM enrollment    
                 WHERE lecture_id = ? AND student_id = ?`,
                [LECTURE_ID_NUM, studentIdNumber]
            );

            if (enrollmentResult.length === 0) {
                // 해당 강의를 수강하는 학생이 아님
                throw new Error(`수강 정보(enrollment_id)를 찾을 수 없습니다. StudentID: ${studentId}`);
            }
            const enrollmentId = enrollmentResult[0].enrollment_id;
            
            // 💡 2. 클라이언트의 status에 따라 DB의 absent_hours 값 결정 (예시)
            let absentHours = 0;
            if (status === '지각') {
                // 지각: 1시간 결석으로 처리한다고 가정
                absentHours = 1; 
            } else if (status === '결석') {
                // 결석: 해당 강의의 시수(lecture_hours)만큼 결석 시간으로 처리해야 함.
                // 현재는 강의 시수를 알 수 없으므로 임시로 3시간이라고 가정.
                // 실제 구현 시 enrollment 또는 Lecture 테이블에서 lecture_hours를 조회해야 합니다.
                absentHours = 3; 
            }
            // '출석'은 absentHours = 0 입니다.

            // 2. 해당 학생의 출석 레코드가 이미 존재하는지 확인
            const [existingRecord] = await connection.query(
                `SELECT enrollment_id 
                 FROM attendance 
                 WHERE enrollment_id = ? AND attendance_date = ?`,
                [enrollmentId, attendanceDate]
            );

            if (existingRecord.length > 0) {
                // 3. 레코드가 존재하면 UPDATE (수정)
                const updateQuery = `
                    UPDATE attendance 
                    SET absent_hours = ?
                    WHERE enrollment_id = ? AND attendance_date = ?
                `;
                await connection.query(updateQuery, [
                    absentHours, 
                    enrollmentId,
                    attendanceDate
                ]);
            } else {
                // 4. 레코드가 존재하지 않으면 INSERT (새로 생성)
                const insertQuery = `
                    INSERT INTO attendance 
                        (attendance_date, enrollment_id, absent_hours) 
                    VALUES (?, ?, ?)
                `;
                await connection.query(insertQuery, [
                    attendanceDate, 
                    enrollmentId,
                    absentHours
                ]);
            }
        }

        await connection.commit(); // 모든 작업 성공 시 커밋
        return NextResponse.json({ success: true, message: '출석 데이터가 성공적으로 저장되었습니다.' }, { status: 200 });

    } catch (error) {
        if (connection) {
            await connection.rollback(); // 오류 발생 시 롤백
        }
        console.error('출석 데이터 저장 중 오류 발생:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'DB 처리 중 서버 오류가 발생했습니다.', 
            detail: error.message,
        }, { status: 500 });
    } finally {
        if (connection) {
            connection.release(); // DB 커넥션 반환
        }
    }
};
