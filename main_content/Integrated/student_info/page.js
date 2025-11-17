"use client";

import { useEffect, useState } from "react";
import styles from "./student_info.module.css";
import { getStudentInfo } from "../../components/Integrated_content/Studentinfo";

export default function StudentInfoPage() {
  const [student, setStudent] = useState(null);

  useEffect(() => {
    getStudentInfo().then((data) => {
      setStudent(data);
    });
  }, []);

  if (!student) {
    return <div className={styles.loading}>학생 정보를 불러오는 중...</div>;
  }

  return (
    <div className={styles.container}>
      {/* 상단 기본 정보 */}
      <section className={styles.profileCard}>
        <img
          src="/default_profile.png"
          alt="student profile"
          className={styles.profileImg}
        />
        <div className={styles.profileText}>
          <h2>{student.name} ({student.student_id})</h2>
          <p>{student.department} / {student.major}</p>
          <p>학년: {student.grade}학년 | 학적상태: {student.status}</p>
        </div>
      </section>

      {/* 2열 Grid */}
      <div className={styles.gridBox}>
        {/* 학적 정보 */}
        <section className={styles.box}>
          <h3>📘 학적 정보</h3>
          <p>입학년도: {student.admission_year}</p>
          <p>학적 상태: {student.status}</p>
          <p>휴·복학 이력: {student.history}</p>
        </section>

        {/* 개인정보 */}
        <section className={styles.box}>
          <h3>📞 개인정보</h3>
          <p>전화번호: {student.phone}</p>
          <p>이메일: {student.email}</p>
          <p>주소: {student.address}</p>
          <p>보호자 연락처: {student.guardian}</p>
        </section>

        {/* 성적 요약 */}
        <section className={styles.box}>
          <h3>📊 성적 요약</h3>
          <p>전체 평점(GPA): {student.gpa}</p>
          <p>전공 평점: {student.major_gpa}</p>
          <p>취득학점: {student.credits} / 140</p>
        </section>

        {/* 등록/장학 정보 */}
        <section className={styles.box}>
          <h3>💰 등록·장학 정보</h3>
          <p>등록 여부: {student.registered ? "등록 완료" : "미등록"}</p>
          <p>최근 장학금: {student.scholarship}</p>
        </section>
      </div>

      {/* 현재 수강 과목 */}
      <section className={styles.courseBox}>
        <h3>📖 현재 수강 중인 과목</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>과목명</th>
              <th>교수</th>
              <th>학점</th>
            </tr>
          </thead>
          <tbody>
            {student.courses.map((course, index) => (
              <tr key={index}>
                <td>{course.name}</td>
                <td>{course.professor}</td>
                <td>{course.credit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
