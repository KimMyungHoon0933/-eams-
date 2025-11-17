// src/app/api/univer_city/insert_attendance/route.js

import { db } from "@/lib/db"; // 💡 db.js 경로를 프로젝트에 맞게 확인하세요.
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * 출석 정보를 일괄 저장/수정하는 POST API
 * Body: { lectureId, attendanceDate, professorId, records: [{ studentId, status, memo, lateReason }, ...] }
 */
export async function POST(request) {
    let connection;
    try {
        const body = await request.json();
        // AttendanceContent.js에서 보낸 데이터 구조를 반영
        const { lectureId, attendanceDate, professorId, records } = body; 
        
        if (!lectureId || !attendanceDate || !professorId || !records || records.length === 0) {
            return new NextResponse(JSON.stringify({ message: "필수 데이터(강의ID, 날짜, 교수ID, 기록)가 누락되었습니다." }), { status: 400 });
        }
        
        // FE 상태값을 DB 상태값으로 변환
        const statusToDbMap = {
            'present': '출석',
            'late': '지각',
            'absent': '결석',
            'leave': '조퇴',
            '미처리': '미처리'
        };

        connection = await db.getConnection();
        await connection.beginTransaction(); // 트랜잭션 시작 (원자성 보장)

        for (const record of records) {
            const dbStatus = statusToDbMap[record.status] || '미처리';
            const studentId = record.studentId;

            // 1. 해당 학생의 해당 날짜 출결 기록이 DB에 이미 있는지 확인
            const [existingRows] = await connection.execute(
                `SELECT COUNT(*) AS count FROM attendance WHERE lecture_id = ? AND attendance_date = ? AND student_id = ?`,
                [lectureId, attendanceDate, studentId]
            );

            // 2. INSERT 또는 UPDATE 결정 (수정은 하지 말라는 요청에 따라, 기존 로직에서 수정은 제거하고 INSERT만 남길 수도 있으나, 
            //    출석 입력 화면의 특성상 UPDATE가 필수적이므로 UPDATE 로직을 유지합니다.)
            if (existingRows[0].count > 0) {
                // 🚨 UPDATE: 기존 기록 수정 (status, reason, late_reason만 변경)
                await connection.execute(
                    `
                    UPDATE attendance
                    SET attendance_status = ?, reason = ?, late_reason = ?, recorded_by = ?
                    WHERE lecture_id = ? AND attendance_date = ? AND student_id = ?
                    `,
                    [dbStatus, record.memo || '', record.lateReason || '', professorId, lectureId, attendanceDate, studentId]
                );
            } else {
                // 🚨 INSERT: 새로운 기록 추가
                await connection.execute(
                    `
                    INSERT INTO attendance (lecture_id, student_id, attendance_date, attendance_status, reason, late_reason, recorded_by)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    `,
                    [lectureId, studentId, attendanceDate, dbStatus, record.memo || '', record.lateReason || '', professorId]
                );
            }
        }

        await connection.commit(); // 트랜잭션 커밋 (DB 저장 완료)
        connection.release();

        return NextResponse.json({ message: "출석 정보가 성공적으로 저장/수정되었습니다." }, { status: 200 });

    } catch (e) {
        if (connection) {
            await connection.rollback(); // 오류 발생 시 롤백
            connection.release();
        }
        console.error('출석 데이터 저장 오류:', e);
        return new NextResponse(JSON.stringify({ message: "서버 오류로 인해 저장에 실패했습니다.", error: e.message }), { status: 500 });
    }
}