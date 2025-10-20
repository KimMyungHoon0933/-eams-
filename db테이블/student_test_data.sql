-- 1) 학과 1개
INSERT INTO department (department_id, department_name, established_date, capacity)
VALUES (10, '컴퓨터소프트웨어학과', '1990-03-01', 200);

-- 2) 교수 1명 (AUTO_INCREMENT지만 재현성 위해 ID 고정)
INSERT INTO Professor
  (professor_id, professor_name, department_id, birth_date, phone, address, gender, lab, account_number)
VALUES
  (5001, '김교수', 10, '1975-05-20', '010-1234-5678', '서울 강남구', 'M', '1호관 301호', NULL);

-- 3) 학생 1명 (로그인 테스트 대상; 학번 고정)
INSERT INTO student
  (student_id, student_name, grade_class, birth_date, gender, phone, address, account_number,
   professor_id, department_id, enrollment_status)
VALUES
  (20240001, '홍길동', '1/A', '2004-01-15', 'M', '010-1111-2222', '서울 송파구', NULL,
   5001, 10, '재학');
