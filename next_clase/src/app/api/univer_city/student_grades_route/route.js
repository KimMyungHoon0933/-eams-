// app/api/univer_city/student_grades_route/route.js
import { NextResponse } from "next/server";

/**
 * 공통: select_where_route 호출 헬퍼
 *  - table:   조회할 테이블명 (string)
 *  - select:  선택할 컬럼 배열 (옵션)
 *  - where:   WHERE 절 문자열 (옵션)
 */
async function callSelectWhere(baseUrl, { table, select, where }) {
  const url = new URL(`${baseUrl}/api/univer_city/select_where_route`);
  url.searchParams.set("table", table);

  if (select && Array.isArray(select) && select.length > 0) {
    url.searchParams.set("select", JSON.stringify(select));
  }
  if (where) {
    url.searchParams.set("where", where);
  }

  const res = await fetch(url.toString(), { cache: "no-store" });
  const data = await res.json();

  if (!res.ok || data.ok === false) {
    const msg =
      data?.error ||
      data?.message ||
      `select_where_route failed for table=${table}`;
    throw new Error(msg);
  }

  // 프로젝트마다 결과 구조가 조금 다를 수 있어 방어적으로 처리
  const rows = data.rows || data.result?.rows || [];
  return rows;
}

/**
 * GET /api/univer_city/student_grades_route?user_id=2
 *
 * 1) user_id 로 현재 사용자가 student 인지 확인 (student 테이블)
 * 2) student 이면 enrollment 에서 수강 목록 조회
 * 3) Lecture, grades, user(교수), department 를 select_where_route 로 각각 조회
 * 4) 강의 / 학과 / 교수이름 / 학번 / 이름 / 학점 리스트 반환
 *    - 단, grade가 null 인 레코드는 제외
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userIdStr = searchParams.get("user_id");

    if (!userIdStr) {
      return NextResponse.json(
        { ok: false, error: "MISSING_USER_ID", message: "user_id가 필요합니다." },
        { status: 400 }
      );
    }

    const userId = Number(userIdStr);
    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "INVALID_USER_ID",
          message: "user_id 형식이 잘못되었습니다.",
        },
        { status: 400 }
      );
    }

    const host = req.headers.get("host");
    const protocol =
      process.env.NODE_ENV === "development" ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    // 1) 현재 사용자가 student 인지 확인
    const studentRows = await callSelectWhere(baseUrl, {
      table: "student",
      where: `student_id = ${userId}`,
    });

    if (studentRows.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "NOT_STUDENT",
          message: "학생이 아닌 사용자입니다.",
        },
        { status: 403 }
      );
    }

    // 2) 사용자 기본 정보 (이름, 학과 등)
    const userRows = await callSelectWhere(baseUrl, {
      table: "user",
      where: `user_id = ${userId}`,
    });

    if (userRows.length === 0) {
      throw new Error("USER_NOT_FOUND");
    }

    const studentUser = userRows[0]; // { user_id, user_name, department_id, ... }

    // 학과명 조회
    let departmentName = null;
    if (studentUser.department_id != null) {
      const deptRows = await callSelectWhere(baseUrl, {
        table: "department",
        where: `department_id = ${studentUser.department_id}`,
      });
      if (deptRows.length > 0) {
        departmentName = deptRows[0].department_name;
      }
    }

    // 3) 수강(enrollment) 정보 조회
    const enrollmentRows = await callSelectWhere(baseUrl, {
      table: "enrollment",
      where: `student_id = ${userId}`,
    });

    // 수강 내역이 없으면 빈 배열 반환
    if (enrollmentRows.length === 0) {
      return NextResponse.json({
        ok: true,
        from: "/api/univer_city/student_grades_route",
        user_id: userId,
        count: 0,
        data: [],
      });
    }

    const lectureIds = [
      ...new Set(enrollmentRows.map((e) => e.lecture_id)),
    ];
    const enrollmentIds = enrollmentRows.map((e) => e.enrollment_id);

    // 4) Lecture 정보 한번에 조회
    let lectureById = {};
    if (lectureIds.length > 0) {
      const lectureRows = await callSelectWhere(baseUrl, {
        table: "Lecture",
        where: `lecture_id IN (${lectureIds.join(",")})`,
      });

      lectureRows.forEach((lec) => {
        lectureById[lec.lecture_id] = lec;
      });
    }

    // 5) grades 정보 한번에 조회
    //    (여기서는 그대로 가져오되, 아래 매핑 단계에서 grade가 null인 경우는 걸러냄)
    let gradeByEnrollmentId = {};
    if (enrollmentIds.length > 0) {
      const gradeRows = await callSelectWhere(baseUrl, {
        table: "grades",
        where: `enrollment_id IN (${enrollmentIds.join(",")})`,
      });

      gradeRows.forEach((g) => {
        gradeByEnrollmentId[g.enrollment_id] = g;
      });
    }

    // 6) 교수 user_name 조회
    const professorIds = [
      ...new Set(
        Object.values(lectureById)
          .map((lec) => lec.professor_id)
          .filter((id) => id != null)
      ),
    ];

    let professorNameById = {};
    if (professorIds.length > 0) {
      const profUserRows = await callSelectWhere(baseUrl, {
        table: "user",
        select: ["user_id", "user_name"],
        where: `user_id IN (${professorIds.join(",")})`,
      });

      profUserRows.forEach((u) => {
        professorNameById[u.user_id] = u.user_name;
      });
    }

    // 7) 최종 결과 매핑
    //    -> grade가 없거나 null인 레코드는 아예 결과에서 제외
    const result = enrollmentRows.reduce((acc, enroll) => {
      const lecture = lectureById[enroll.lecture_id] || {};
      const gradeRow = gradeByEnrollmentId[enroll.enrollment_id];

      // grade 정보가 없거나 null이면 스킵
      if (!gradeRow || gradeRow.grade == null) {
        return acc;
      }

      const professorName = lecture.professor_id
        ? professorNameById[lecture.professor_id] || null
        : null;

      acc.push({
        // 강의
        lecture_name: lecture.lecture_name || null,
        // 학과 (학생 소속 학과 기준)
        department_name: departmentName,
        // 교수이름
        professor_name: professorName,
        // 학번
        student_id: studentUser.user_id,
        // 이름
        student_name: studentUser.user_name,
        // 학점
        grade: gradeRow.grade,
      });

      return acc;
    }, []);

    return NextResponse.json({
      ok: true,
      from: "/api/univer_city/student_grades_route",
      user_id: userId,
      count: result.length,
      data: result,
    });
  } catch (err) {
    console.error("student_grades_route error:", err);
    return NextResponse.json(
      {
        ok: false,
        error: "INTERNAL_ERROR",
        message: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
