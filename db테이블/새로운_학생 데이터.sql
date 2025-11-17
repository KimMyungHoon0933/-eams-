-- ===============================
--  ✚ 1) student 서브타입용 user 추가
-- ===============================
INSERT INTO `user` 
  (user_id, user_name, birth_date, gender, phone, address, account_number, department_id, user_password)
VALUES
  (7, '한학생', '2004-01-15', 'M', '010-7777-1111', '서울시 중랑구', '7777-1111-2222-3333', 101, 'studC1234'),
  (8, '조학생', '2004-05-22', 'F', '010-8888-2222', '서울시 강동구', NULL,                   101, 'studD1234'),
  (9, '윤학생', '2003-09-09', 'F', '010-9999-3333', '경기도 용인시', '9999-3333-4444-5555', 101, 'studE1234');

-- ===============================
--  ✚ 2) student 서브타입 레코드 생성
--     (PK = FK → user.user_id 와 동일하게 사용)
-- ===============================
INSERT INTO student (student_id, grade_class, professor_id, enrollment_status) VALUES
  (7, '1/A', 1, '재학'),
  (8, '1/B', 1, '재학'),
  (9, '2/A', 1, '재학');

-- ===============================
--  ✚ 3) 1번 Lecture(자료구조) 수강 enrollment 생성
--     lecture_id = 1, 새 학생 7,8,9 연결
-- ===============================
INSERT INTO enrollment
  (lecture_id, student_id, lecture_year, lecture_semester, lecture_hours)
VALUES
  ( 1, 7, '2025', 2, 3),
  ( 1, 8, '2025', 2, 3),
  ( 1, 9, '2025', 2, 3);
