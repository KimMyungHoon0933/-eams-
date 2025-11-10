// /api/univer_city/insert_attendance/route.js (백엔드 파일)
export const runtime = "nodejs";
import { db } from "../../../../lib/db";
import { NextResponse } from 'next/server';
// ✅ POST /api/attendance/save (출석 데이터 저장/수정 엔드포인트)
export async function POST(request) { // req 대신 request 사용 (Next.js 표준)
    
    // 💡 3. 요청 본문(Body)을 JSON으로 파싱
    const { lectureId, attendanceDate, attendanceData } = await request.json(); 

    if (!lectureId || !attendanceDate || !attendanceData || attendanceData.length === 0) {
        // 💡 NextResponse를 사용하여 응답
        return NextResponse.json({ success: false, message: '필수 데이터가 누락되었습니다.' }, { status: 400 });
    }

    let connection;
    try {
        connection = await db.getConnection(); // DB 커넥션을 얻습니다.
        await connection.beginTransaction(); // 트랜잭션 시작 (전체 성공/실패 보장)

        // 1. 전송된 각 학생의 출석 데이터를 순회하며 처리
        for (const record of attendanceData) {
            const { studentId, status, memo, lateReason } = record;

            // attendance_status 값 매핑 (DB 스키마에 따라 숫자로 저장할 수 있음)
            // '출석' -> 'P', '지각' -> 'L', '결석' -> 'A', '미처리' -> 'N' 등으로 가정
            const attendanceStatusChar = status[0]; // 간단하게 첫 글자만 사용

            // 2. 해당 학생의 출석 레코드가 이미 존재하는지 확인
            const [existingRecord] = await connection.query(
                `SELECT attendance_id 
                 FROM attendance 
                 WHERE lecture_id = ? AND student_id = ? AND attendance_date = ?`,
                [lectureId, studentId, attendanceDate]
            );

            if (existingRecord.length > 0) {
                // 3. 레코드가 존재하면 UPDATE (수정)
                const updateQuery = `
                    UPDATE attendance 
                    SET attendance_status = ?, memo = ?, late_reason = ?
                    WHERE attendance_id = ?
                `;
                await connection.query(updateQuery, [
                    attendanceStatusChar, 
                    memo || null, // 메모가 없으면 NULL 저장
                    lateReason || null, // 지각 사유가 없으면 NULL 저장
                    existingRecord[0].attendance_id
                ]);
            } else {
                // 4. 레코드가 존재하지 않으면 INSERT (새로 생성)
                const insertQuery = `
                    INSERT INTO attendance 
                        (lecture_id, student_id, attendance_date, attendance_status, memo, late_reason) 
                    VALUES (?, ?, ?, ?, ?, ?)
                `;
                await connection.query(insertQuery, [
                    lectureId, 
                    studentId, 
                    attendanceDate, 
                    attendanceStatusChar, 
                    memo || null, 
                    lateReason || null
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
        return NextResponse.json({ success: false, message: '서버 오류로 인해 저장이 실패했습니다.' }, { status: 500 });
    } finally {
        if (connection) {
            connection.release(); // DB 커넥션 반환
        }
    }
};
