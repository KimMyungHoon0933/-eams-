// src/app/api/attendance/monthly_data/route.js

// 💡 db.js가 프로젝트 루트의 lib 폴더에 있다고 가정합니다. 경로를 맞게 수정하세요.
import { db } from "@/lib/db"; 
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * 출석 데이터를 조회하는 GET API
 * 쿼리 파라미터: ?year=Y&month=M&class=C&role=R&userId=U
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const year = searchParams.get("year");
        const month = searchParams.get("month");
        const classTitle = searchParams.get("class"); // 강의명
        const role = searchParams.get("role");       // 교수 또는 학생
        const userId = searchParams.get("userId");   // 로그인한 사용자 ID

        if (!year || !month || !classTitle || !role || !userId) {
            return new NextResponse(JSON.stringify({ message: "필수 쿼리 파라미터가 누락되었습니다." }), { status: 400 });
        }

        // 1. 강의명(classTitle)으로 lecture_id를 조회합니다.
        const [lectureRows] = await db.execute(
            `SELECT lecture_id FROM Lecture WHERE lecture_name = ?`,
            [classTitle]
        );

        if (lectureRows.length === 0) {
            // 강의명이 없을 경우의 처리
            return new NextResponse(JSON.stringify({ message: "존재하지 않는 강의명입니다." }), { status: 404 });
        }
        const lectureId = lectureRows[0].lecture_id;

        // 2. 권한에 따른 SQL 쿼리 및 파라미터 설정
        let sql = '';
        let params = [];
        const targetMonth = `${year}-${month.padStart(2, '0')}-01`; // 월별 조회를 위한 기준 날짜

        if (role === 'professor') {
            // 교수 권한: 해당 강의의 모든 학생 출결 내역 조회
            sql = `
                SELECT
                    A.attendance_date,
                    A.attendance_status,
                    A.reason,
                    S.student_id,
                    U.user_name AS student_name
                FROM attendance A
                JOIN student S ON A.student_id = S.student_id
                JOIN user U ON S.user_id = U.user_id
                WHERE A.lecture_id = ?
                AND YEAR(A.attendance_date) = ?
                AND MONTH(A.attendance_date) = ?
                ORDER BY A.attendance_date, U.user_name;
            `;
            params = [lectureId, year, month];
        } else if (role === 'student') {
            // 학생 권한: 본인 출결 내역만 조회 (userId가 student_id임을 가정)
            const studentId = userId; 
            sql = `
                SELECT
                    A.attendance_date,
                    A.attendance_status,
                    A.reason
                FROM attendance A
                WHERE A.lecture_id = ?
                AND A.student_id = ?
                AND YEAR(A.attendance_date) = ?
                AND MONTH(A.attendance_date) = ?
                ORDER BY A.attendance_date;
            `;
            params = [lectureId, studentId, year, month];
        } else {
            return new NextResponse(JSON.stringify({ message: "유효하지 않은 역할(role)입니다." }), { status: 403 });
        }
        
        // 3. 쿼리 실행 및 결과 가공
        const [attendanceRows] = await db.execute(sql, params);
        
        const processedData = processDBRowsToFrontendFormat(attendanceRows, role); 

        return NextResponse.json(processedData);

    } catch (e) {
        console.error("DB 조회 오류:", e);
        return new NextResponse(JSON.stringify({ message: "서버에서 출석 데이터를 로드하는 데 실패했습니다.", error: e.message }), { status: 500 });
    }
}

// DB 행(Row) 데이터를 프론트엔드 AttendanceCheck 컴포넌트 형식으로 변환하는 함수
function processDBRowsToFrontendFormat(rows, role) {
    const data = {};

    rows.forEach(row => {
        // DB의 Date 객체를 'YYYY-MM-DD' 문자열로 변환 (getTimezoneOffset 보정 필요 시 추가)
        const date = new Date(row.attendance_date);
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        if (!data[dateKey]) {
            data[dateKey] = {
                role: role, 
                summary: '', 
                status: 'present', // 기본값
                students: []
            };
        }
        
        if (role === 'professor') {
            data[dateKey].students.push({
                id: row.student_id,
                name: row.student_name,
                status: row.attendance_status,
                reason: row.reason || ''
            });
        } else if (role === 'student') {
            // 학생 권한일 경우, 해당 날짜의 상태만 저장
            data[dateKey].status = row.attendance_status;
            data[dateKey].reason = row.reason || '';
        }
    });

    // 교수의 경우, summary 및 날짜별 전체 상태 계산
    if (role === 'professor') {
        for (const dateKey in data) {
            const total = data[dateKey].students.length;
            const absentCount = data[dateKey].students.filter(s => s.status === '결석').length;
            const lateCount = data[dateKey].students.filter(s => s.status === '지각').length;
            
            data[dateKey].summary = `총 ${total}명 (결석: ${absentCount}, 지각: ${lateCount})`;
            
            // 전체 날짜 상태 결정 로직
            if (absentCount > 0) {
                 data[dateKey].status = 'absent';
            } else if (lateCount > 0) {
                 data[dateKey].status = 'late';
            } else {
                 data[dateKey].status = 'present';
            }
        }
    }

    return data;
}