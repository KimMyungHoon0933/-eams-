// StudentInfo.js

export async function getStudentInfo() {
  try {
    const res = await fetch("/api/univer_city/student_info");
    if (!res.ok) throw new Error("API 오류");
    return await res.json();
  } catch (err) {
    console.error("❌ 학생 정보 불러오기 실패:", err);

    // 🔥 임시 더미 데이터 (UI 테스트용)
    return {
      name: "김수혁",
      student_id: "2306007",
      department: "컴퓨터소프트웨어학과",
      major: "전공심화",
      grade: 2,
      status: "재학",
      admission_year: 2023,
      history: "일반휴학(2024-03-05 ~ 2024-09-01)",
      phone: "010-1234-5678",
      email: "su@dsc.ac.kr",
      address: "경기도 용인시 수지구",
      guardian: "010-9876-5432",
      gpa: 3.89,
      major_gpa: 4.01,
      credits: 67,
      registered: true,
      scholarship: "DSU 성적 우수 장학금(₩500,000)",
      courses: [
        { name: "운영체제", professor: "김OO 교수", credit: 3 },
        { name: "자료구조", professor: "박OO 교수", credit: 3 },
        { name: "웹프로그래밍", professor: "최OO 교수", credit: 3 },
      ],
    };
  }
}
