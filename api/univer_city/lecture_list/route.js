import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const query = `
            SELECT 
                lecture_id,
                lecture_name,
                lecture_year,
                lecture_semester,
                day_of_week,
                start_hours,
                end_hours
            FROM Lecture
            ORDER BY lecture_id;
        `;

        const [rows] = await db.execute(query);

        return NextResponse.json(rows, { status: 200 });

    } catch (error) {
        console.error("강의 목록 조회 오류:", error);
        return NextResponse.json(
            { message: "강의 목록 조회 실패", error: error.message },
            { status: 500 }
        );
    }
}
