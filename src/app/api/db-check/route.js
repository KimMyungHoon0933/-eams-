// /app/api/db-check/route.js

import { db } from "@/lib/db"; 
import { NextResponse } from 'next/server'; // Response 대신 NextResponse 사용

export async function GET() {
    let connection;
    try {
        connection = await db.getConnection(); 
        const [rows] = await connection.query('SELECT 1 as result');
        
        // 💡 올바른 Next.js API 응답 형식 (NextResponse 사용)
        return NextResponse.json(
            { success: true, message: 'DB 연결 및 기본 쿼리 테스트 성공' }, 
            { status: 200 }
        );
    } catch (error) {
        // ... 오류 처리
        return NextResponse.json(
            { success: false, message: 'DB 연결 실패', error: error.message }, 
            { status: 500 }
        );
    } finally {
        if (connection) {
            connection.release(); 
        }
    }
}