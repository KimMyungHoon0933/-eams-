-- EAMS Test Data Inserts (UPDATED for plain VARCHAR passwords)
-- Updated: 2025-10-27 (Asia/Seoul)
-- Change: user_password now stores plain text (for testing) instead of SHA2 hash.
-- Order: department -> user -> Professor/student/employee/teaching_assistant -> Lecture -> enrollment -> attendance/grade -> assignment -> assignment_submit -> board/post/comments -> Chatroom/Chatroom_List/chatting -> Leave_of_Absence

START TRANSACTION;

-- 1) department
INSERT INTO department (department_id, department_name, established_date, capacity) VALUES
  (101, '컴퓨터공학과', '1990-03-01', 200),
  (102, '전자공학과',   '1992-03-01', 180),
  (103, '행정학과',     '1995-03-01', 150);

-- 2) user (AUTO_INCREMENT allowed to accept explicit values)
-- UPDATED: user_password 컬럼을 평문 VARCHAR로 입력
INSERT INTO `user` (user_id, user_name, birth_date, gender, phone, address, account_number, department_id, user_password) VALUES
  (1, '김교수', '1975-05-12', 'M', '010-1234-5678', '서울시 강남구', '1234-5678-9012-3456', 101, 'prof1234'),
  (2, '이학생', '2003-03-21', 'F', '010-2345-6789', '서울시 광진구', '2345-6789-0123-4567', 101, 'studA1234'),
  (3, '박학생', '2002-11-02', 'M', '010-3456-7890', '서울시 송파구', NULL,                   102, 'studB1234'),
  (4, '최직원', '1988-08-08', 'F', '010-4567-8901', '서울시 동대문구', '3456-7890-1234-5678', 103, 'emp1234'),
  (5, '정조교', '1997-09-17', 'F', '010-5678-9012', '서울시 성동구',  '4567-8901-2345-6789', 101, 'ta1234'),
  (6, '오사용자', '1990-01-10', 'M', '010-6789-0123', '경기도 성남시', NULL,               103, 'user1234');

-- 3) role subtypes (PK = FK to user.user_id)
INSERT INTO Professor (professor_id, lab) VALUES
  (1, 'A-501');

INSERT INTO student (student_id, grade_class, professor_id, enrollment_status) VALUES
  (2, '3/A', 1, '재학'),
  (3, '2/B', 1, '휴학');

INSERT INTO employee (employee_id) VALUES
  (4);

INSERT INTO teaching_assistant (assistant_id, office) VALUES
  (5, 'T-201');

-- 4) Lectures
INSERT INTO Lecture
  (lecture_id, lecture_name, enrollment_count, credit, classroom, professor_id,
   lecture_year, lecture_semester, lecture_hours, day_of_week)
VALUES
  (1, '자료구조',  2, 3, 'D201', 1, '2025', 2, 3, '월'),
  (2, '전자회로',  1, 3, 'E103', 1, '2025', 2, 3, '수');

-- 5) enrollment
INSERT INTO enrollment
  (enrollment_id, lecture_id, student_id, lecture_year, lecture_semester, lecture_hours)
VALUES
  (1, 1, 2, '2025', 2, 3),
  (2, 2, 3, '2025', 2, 3);

-- 6) attendance
INSERT INTO attendance (attendance_date, enrollment_id, absent_hours) VALUES
  ('2025-10-01', 1, 0),
  ('2025-10-08', 1, 2),
  ('2025-10-01', 2, 0);

-- 7) grade
INSERT INTO grade (enrollment_id, grade) VALUES
  (1, 'A'),
  (2, 'B+');

-- 8) assignment
INSERT INTO assignment (assignment_id, assignment_name, assignment_description, lecture_id, registered_date, file_path) VALUES
  (1, '과제#1 - 연결 리스트', '연결 리스트 구현 및 시간복잡도 분석', 1, '2025-10-05', '/files/assignments/1.pdf'),
  (2, '과제#1 - 다이오드 회로', '다이오드 특성 곡선 측정 보고서',     2, '2025-10-06', NULL);

-- 9) assignment_submit
INSERT INTO assignment_submit (assignment_id, enrollment_id, submission_name, file_path, submission_description) VALUES
  (1, 1, '이학생_연결리스트', '/files/submits/lee_list.zip', 'C++로 구현 및 보고서 포함');

-- 10) board
INSERT INTO board (board_id, board_name, post_count) VALUES
  (1, '공지사항', 2),
  (2, '자유게시판', 1);

-- 11) post
INSERT INTO post (post_id, author_id, created_date, board_id, title, content, file_path, allow_comment) VALUES
  (1, 1, '2025-10-07', 1, '중간고사 안내', '중간고사는 10/20(월) 입니다.', NULL, 't'),
  (2, 4, '2025-10-09', 1, '휴무 공지', '10/10(금) 행정실 휴무입니다.', NULL, 'f'),
  (3, 2, '2025-10-10', 2, '스터디 구함', '자료구조 스터디 하실 분?', NULL, 't');

-- 12) Comments (self-referencing, no post_id in schema)
INSERT INTO Comments (comment_id, author_id, file_path, comment_content, parent_comment_id) VALUES
  (1, 2, NULL, '공지 확인했습니다!', NULL),
  (2, 1, NULL, '스터디 관심있습니다.', 1);

-- 13) Chatroom & members & messages
INSERT INTO Chatroom (chatroom_id, chatroom_name, is_group, last_message_time) VALUES
  (1, '자료구조 스터디', 't', '2025-10-10');

INSERT INTO Chatroom_List (chatroom_id, member_id) VALUES
  (1, 1),
  (1, 2),
  (1, 5);

-- ✅ create_hours 컬럼 포함 버전
INSERT INTO chatting (message_id, chatroom_id, created_date, create_hours, content, file_path, author_id) VALUES
  (1, 1, '2025-10-10', '18:50:12', '오늘 7시에 만나요', NULL, 2),
  (2, 1, '2025-10-10', '18:52:03', '네, 연구실 앞에서 봅시다.', NULL, 1),
  (3, 1, '2025-10-10', '19:00:45', '제가 과제 설명도 도와드릴게요.', NULL, 5);

-- 14) Leave_of_Absence
INSERT INTO Leave_of_Absence (leave_id, employee_id, student_id, reason, leave_date) VALUES
  (1, 4, 3, '개인 사유로 1학기 휴학 신청', '2025-09-15');

COMMIT;
