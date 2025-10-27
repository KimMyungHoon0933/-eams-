/* ========= CLEAN REBUILD (optional) =========
DROP TABLE IF EXISTS Leave_of_Absence, chatting, Chatroom_List, Chatroom, Comments,
  post, board, assignment_submit, assignment, grade, attendance, enrollment,
  Lecture, teaching_assistant, employee, Professor, student, `user`, department;
================================================ */

/* =============== 1) 기준 마스터 =============== */
CREATE TABLE `department` (
  `department_id`    INT          NOT NULL,                       -- PK, 정수, NULL 금지
  `department_name`  VARCHAR(100) NOT NULL,                       -- 부서명, NULL 금지, UNIQUE
  `established_date` DATE         NOT NULL,                       -- 설립일, NULL 금지 (유효성은 애플리케이션/트리거에서)
  `capacity`         INT          NOT NULL,                       -- 정원, NULL 금지, CHECK >= 0

  CONSTRAINT `PK_DEPARTMENT` PRIMARY KEY (`department_id`),
  CONSTRAINT `UQ_DEPARTMENT_NAME` UNIQUE (`department_name`),
  CONSTRAINT `CK_DEPARTMENT_CAPACITY` CHECK (`capacity` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* =============== 2) USER 슈퍼타입 =============== */

CREATE TABLE `user` (
  `user_id`        INT UNSIGNED  NOT NULL AUTO_INCREMENT,         -- PK, UNSIGNED, AUTO_INCREMENT, NULL 금지
  `user_name`      VARCHAR(50)   NOT NULL,                        -- 이름
  `birth_date`     DATE          NOT NULL,                        -- 생년월일
  `gender`         VARCHAR(1)    NOT NULL,                        -- 성별(1글자)
  `phone`          VARCHAR(13)   NOT NULL,                        -- 000-0000-0000
  `user_password`  VARCHAR(255) NOT NULL,                         -- 비밀번호 해시
  `address`        VARCHAR(100)  NULL,                            -- 주소
  `account_number` CHAR(43)      NULL,                            -- 계좌
  `department_id`  INT           NOT NULL,                        -- 소속 학과 FK


  CONSTRAINT `PK_USER` PRIMARY KEY (`user_id`),
  CONSTRAINT `CK_USER_GENDER_LEN`
    CHECK (CHAR_LENGTH(`gender`) = 1),
  CONSTRAINT `CK_USER_PHONE`
    CHECK (`phone` REGEXP '^[0-9]{3}-[0-9]{4}-[0-9]{4}$'),
  CONSTRAINT `CK_USER_ACCOUNT`
    CHECK (`account_number` IS NULL OR
           `account_number` REGEXP '^[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}$'),
  CONSTRAINT `FK_USER_DEPARTMENT`
    FOREIGN KEY (`department_id`) REFERENCES `department`(`department_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/* ===== 3) 역할 서브타입: PK=FK(user.user_id) ===== */

/* 교수 */
CREATE TABLE `Professor` (
  `professor_id` INT UNSIGNED NOT NULL,                           -- PK=FK, user.user_id 참조, NULL 금지
  `lab`          VARCHAR(50)  NOT NULL,                           -- 연구실/사무실, NULL 금지

  CONSTRAINT `PK_PROFESSOR` PRIMARY KEY (`professor_id`),
  CONSTRAINT `FK_PROFESSOR_USER`
    FOREIGN KEY (`professor_id`) REFERENCES `user`(`user_id`) ON DELETE CASCADE  -- 부모 user 삭제 시 교수 행도 삭제
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* 학생 */
CREATE TABLE `student` (
  `student_id`        INT UNSIGNED NOT NULL,                       -- PK=FK, user.user_id, NULL 금지
  `grade_class`       CHAR(3)      NOT NULL,                       -- 학년/반, NULL 금지, 예: 3/A (CHECK REGEXP)
  `professor_id`      INT UNSIGNED NOT NULL,                       -- 지도교수, NULL 금지, FK → Professor
  `enrollment_status` CHAR(2)      NOT NULL,                       -- 재학상태, NULL 금지, ENUM('재학','휴학','재적') (CHECK)

  CONSTRAINT `PK_STUDENT` PRIMARY KEY (`student_id`),
  CONSTRAINT `CK_STUDENT_GRADE_CLASS`
    CHECK (`grade_class` REGEXP '^[1-9]/[A-Z]$'),
  CONSTRAINT `CK_STUDENT_ENROLLMENT_STATUS`
    CHECK (`enrollment_status` IN ('재학','휴학','재적')),
  CONSTRAINT `FK_STUDENT_USER`
    FOREIGN KEY (`student_id`)   REFERENCES `user`(`user_id`)       ON DELETE CASCADE, -- user 삭제 연쇄
  CONSTRAINT `FK_STUDENT_PROFESSOR`
    FOREIGN KEY (`professor_id`) REFERENCES `Professor`(`professor_id`)                -- 기본 RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* 직원 */
CREATE TABLE `employee` (
  `employee_id` INT UNSIGNED NOT NULL,                            -- PK=FK, user.user_id, NULL 금지

  CONSTRAINT `PK_EMPLOYEE` PRIMARY KEY (`employee_id`),
  CONSTRAINT `FK_EMPLOYEE_USER`
    FOREIGN KEY (`employee_id`) REFERENCES `user`(`user_id`) ON DELETE CASCADE -- user 삭제 연쇄
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* 조교 */
CREATE TABLE `teaching_assistant` (
  `assistant_id` INT UNSIGNED NOT NULL,                           -- PK=FK, user.user_id, NULL 금지
  `office`       VARCHAR(50)  NOT NULL,                           -- 사무실, NULL 금지

  CONSTRAINT `PK_TEACHING_ASSISTANT` PRIMARY KEY (`assistant_id`),
  CONSTRAINT `FK_TA_USER`
    FOREIGN KEY (`assistant_id`) REFERENCES `user`(`user_id`) ON DELETE CASCADE -- user 삭제 연쇄
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* =============== 4) 수업/수강/성적/출석/과제 =============== */
CREATE TABLE `Lecture` (
  `lecture_id`       INT UNSIGNED NOT NULL AUTO_INCREMENT,        -- PK, AUTO_INCREMENT, NULL 금지
  `lecture_name`     VARCHAR(50)  NULL,                           -- 과목명, NULL 허용
  `enrollment_count` INT          NOT NULL,                        -- 수강인원, NULL 금지 (범위 제한 필요시 CHECK 추가 가능)
  `credit`           TINYINT      NOT NULL,                        -- 학점, NULL 금지, 0~9 (CHECK)
  `classroom`        VARCHAR(50)  NOT NULL,                        -- 강의실, NULL 금지
  `professor_id`     INT UNSIGNED NOT NULL,                        -- 담당교수, NULL 금지, FK → Professor
  `lecture_year`     CHAR(5)      NOT NULL,                        -- '0000년' 형식, NULL 금지 (CHECK REGEXP)
  `lecture_semester` TINYINT      NOT NULL,                        -- 학기, NULL 금지, 1~2 (CHECK)
  `lecture_hours`    TINYINT      NOT NULL,                        -- 시수, NULL 금지, 1~9 (CHECK)

  CONSTRAINT `PK_LECTURE` PRIMARY KEY (`lecture_id`),
  CONSTRAINT `CK_LECTURE_CREDIT`   CHECK (`credit` BETWEEN 0 AND 9),
  CONSTRAINT `CK_LECTURE_YEAR_FMT` CHECK (`lecture_year` REGEXP '^[0-9]{4}년$'),
  CONSTRAINT `CK_LECTURE_SEMESTER` CHECK (`lecture_semester` BETWEEN 1 AND 2),
  CONSTRAINT `CK_LECTURE_HOURS`    CHECK (`lecture_hours` BETWEEN 1 AND 9),
  CONSTRAINT `FK_LECTURE_PROFESSOR`
    FOREIGN KEY (`professor_id`) REFERENCES `Professor`(`professor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `enrollment` (
  `enrollment_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,           -- PK, AUTO_INCREMENT, NULL 금지
  `lecture_id`    INT UNSIGNED NOT NULL,                           -- 수업 FK, NULL 금지
  `student_id`    INT UNSIGNED NOT NULL,                           -- 학생 FK, NULL 금지

  CONSTRAINT `PK_ENROLLMENT` PRIMARY KEY (`enrollment_id`),
  CONSTRAINT `FK_ENROLLMENT_LECTURE`
    FOREIGN KEY (`lecture_id`) REFERENCES `Lecture`(`lecture_id`),
  CONSTRAINT `FK_ENROLLMENT_STUDENT`
    FOREIGN KEY (`student_id`) REFERENCES `student`(`student_id`)
 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `attendance` (
  `attendance_date` DATE        NOT NULL,                          -- 출석일, PK 일부, NULL 금지
  `enrollment_id`   INT UNSIGNED NOT NULL,                         -- 수강 FK, PK 일부, NULL 금지
  `absent_hours`    INT         NOT NULL,                          -- 결석(지각)시간, NULL 금지, 0~98 (CHECK)

  CONSTRAINT `PK_ATTENDANCE` PRIMARY KEY (`attendance_date`, `enrollment_id`),
  CONSTRAINT `CK_ATTENDANCE_ABSENT_HOURS` CHECK (`absent_hours` BETWEEN 0 AND 98),
  CONSTRAINT `FK_ATTENDANCE_ENROLLMENT`
    FOREIGN KEY (`enrollment_id`) REFERENCES `enrollment`(`enrollment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `grade` (
  `enrollment_id` INT UNSIGNED NOT NULL,                           -- PK=FK, NULL 금지
  `grade`         VARCHAR(2)   NOT NULL,                           -- 등급, NULL 금지, 허용 값 집합 (CHECK)

  CONSTRAINT `PK_GRADE` PRIMARY KEY (`enrollment_id`),
  CONSTRAINT `CK_GRADE_VALID`
    CHECK (`grade` IN ('A+','A','A-','B+','B','B-','C+','C','C-','D+','D','D-','F')),
  CONSTRAINT `FK_GRADE_ENROLLMENT`
    FOREIGN KEY (`enrollment_id`) REFERENCES `enrollment`(`enrollment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `assignment` (
  `assignment_id`          INT UNSIGNED  NOT NULL AUTO_INCREMENT,  -- PK, AUTO_INCREMENT, NULL 금지
  `assignment_name`        VARCHAR(100)  NOT NULL,                 -- 과제명, NULL 금지
  `assignment_description` TEXT          NOT NULL,                 -- 과제설명, NULL 금지
  `lecture_id`             INT UNSIGNED  NOT NULL,                 -- 강의 FK, NULL 금지
  `registered_date`        DATE          NULL,                     -- 등록일, NULL 허용
  `file_path`              VARCHAR(300)  NULL,                     -- 첨부 경로, NULL 허용

  CONSTRAINT `PK_ASSIGNMENT` PRIMARY KEY (`assignment_id`),
  CONSTRAINT `FK_ASSIGNMENT_LECTURE`
    FOREIGN KEY (`lecture_id`) REFERENCES `Lecture`(`lecture_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `assignment_submit` (
  `assignment_id`           INT UNSIGNED NOT NULL,                 -- PK 일부, FK → assignment, NULL 금지
  `enrollment_id`           INT UNSIGNED NOT NULL,                 -- PK 일부, FK → enrollment, NULL 금지
  `submission_name`         VARCHAR(100) NOT NULL,                 -- 제출명, NULL 금지
  `file_path`               VARCHAR(300) NULL,                     -- 첨부 경로, NULL 허용
  `submission_description`  TEXT         NOT NULL,                 -- 제출설명, NULL 금지

  CONSTRAINT `PK_ASSIGNMENT_SUBMIT` PRIMARY KEY (`assignment_id`, `enrollment_id`),
  CONSTRAINT `FK_AS_SUBMIT_ASSIGNMENT`
    FOREIGN KEY (`assignment_id`) REFERENCES `assignment`(`assignment_id`),
  CONSTRAINT `FK_AS_SUBMIT_ENROLLMENT`
    FOREIGN KEY (`enrollment_id`) REFERENCES `enrollment`(`enrollment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* =============== 5) 게시판/댓글 =============== */
CREATE TABLE `board` (
  `board_id`   INT UNSIGNED  NOT NULL AUTO_INCREMENT,              -- PK, AUTO_INCREMENT, NULL 금지
  `board_name` VARCHAR(100)  NOT NULL,                             -- 게시판명, NULL 금지
  `post_count` INT           NOT NULL,                             -- 게시글 수, NULL 금지

  CONSTRAINT `PK_BOARD` PRIMARY KEY (`board_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `post` (
  `post_id`        INT UNSIGNED   NOT NULL AUTO_INCREMENT,         -- PK, AUTO_INCREMENT, NULL 금지
  `author_id`      INT UNSIGNED   NOT NULL,                        -- 작성자, NULL 금지, FK → user
  `created_date`   DATE           NOT NULL,                        -- 작성일, NULL 금지
  `board_id`       INT UNSIGNED   NOT NULL,                        -- 게시판, NULL 금지, FK → board
  `title`          VARCHAR(100)   NOT NULL,                        -- 제목, NULL 금지
  `content`        TEXT           NOT NULL,                        -- 내용, NULL 금지
  `file_path`      VARCHAR(300)   NULL,                            -- 첨부 경로, NULL 허용
  `allow_comment`  VARCHAR(1)     NOT NULL,                        -- 댓글허용, NULL 금지, 't'/'f' (CHECK)

  CONSTRAINT `PK_POST` PRIMARY KEY (`post_id`),
  CONSTRAINT `CK_POST_ALLOW_COMMENT` CHECK (`allow_comment` IN ('t','f')),
  CONSTRAINT `FK_POST_BOARD`
    FOREIGN KEY (`board_id`)  REFERENCES `board`(`board_id`),
  CONSTRAINT `FK_POST_AUTHOR`
    FOREIGN KEY (`author_id`) REFERENCES `user`(`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `Comments` (
  `comment_id`        INT UNSIGNED   NOT NULL AUTO_INCREMENT,      -- PK, AUTO_INCREMENT, NULL 금지
  `author_id`         INT UNSIGNED   NOT NULL,                     -- 작성자, NULL 금지, FK → user
  `file_path`         VARCHAR(300)   NULL,                         -- 첨부 경로, NULL 허용
  `comment_content`   VARCHAR(100)   NOT NULL,                     -- 내용, NULL 금지
  `parent_comment_id` INT UNSIGNED   NULL,                         -- 부모댓글, NULL 허용, Self-FK, CASCADE

  CONSTRAINT `PK_COMMENTS` PRIMARY KEY (`comment_id`),
  CONSTRAINT `FK_COMMENTS_PARENT`
    FOREIGN KEY (`parent_comment_id`) REFERENCES `Comments`(`comment_id`)
      ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_COMMENTS_AUTHOR`
    FOREIGN KEY (`author_id`) REFERENCES `user`(`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* =============== 6) 채팅 =============== */
CREATE TABLE `Chatroom` (
  `chatroom_id`       INT UNSIGNED  NOT NULL AUTO_INCREMENT,       -- PK, AUTO_INCREMENT, NULL 금지
  `chatroom_name`     VARCHAR(30)   NOT NULL,                      -- 채팅방명, NULL 금지
  `is_group`          VARCHAR(1)    NOT NULL,                      -- 그룹여부, NULL 금지, 't'/'f' (CHECK)
  `last_message_time` DATE          NULL,                          -- 마지막 메시지 일자, NULL 허용

  CONSTRAINT `PK_CHATROOM` PRIMARY KEY (`chatroom_id`),
  CONSTRAINT `CK_CHATROOM_IS_GROUP` CHECK (`is_group` IN ('t','f'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `Chatroom_List` (
  `chatroom_id` INT UNSIGNED NOT NULL,                             -- PK 일부, FK → Chatroom, NULL 금지
  `member_id`   INT UNSIGNED NOT NULL,                             -- PK 일부, FK → user, NULL 금지

  CONSTRAINT `PK_CHATROOM_LIST` PRIMARY KEY (`chatroom_id`, `member_id`),
  CONSTRAINT `FK_CHATROOMLIST_CHATROOM`
    FOREIGN KEY (`chatroom_id`) REFERENCES `Chatroom`(`chatroom_id`)
      ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_CHATROOMLIST_MEMBER`
    FOREIGN KEY (`member_id`) REFERENCES `user`(`user_id`)
      ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `chatting` (
  `message_id`   INT UNSIGNED  NOT NULL AUTO_INCREMENT,            -- PK, AUTO_INCREMENT, NULL 금지
  `chatroom_id`  INT UNSIGNED  NOT NULL,                           -- 채팅방 FK, NULL 금지, CASCADE
  `created_date` DATE          NOT NULL,                           -- 작성일, NULL 금지
  `content`      TEXT          NOT NULL,                           -- 내용, NULL 금지
  `file_path`    VARCHAR(300)  NULL,                               -- 첨부 경로, NULL 허용
  `author_id`    INT UNSIGNED  NOT NULL,                           -- 작성자 FK, NULL 금지

  CONSTRAINT `PK_CHATTING` PRIMARY KEY (`message_id`),
  CONSTRAINT `FK_CHATTING_CHATROOM`
    FOREIGN KEY (`chatroom_id`) REFERENCES `Chatroom`(`chatroom_id`)
      ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_CHATTING_AUTHOR`
    FOREIGN KEY (`author_id`) REFERENCES `user`(`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* =============== 7) 휴학 =============== */
CREATE TABLE `Leave_of_Absence` (
  `leave_id`    INT          NOT NULL,                             -- PK 일부, NULL 금지 (업무상 단순 식별자)
  `employee_id` INT UNSIGNED NOT NULL,                             -- PK 일부, FK → employee, NULL 금지
  `student_id`  INT UNSIGNED NOT NULL,                             -- PK 일부, FK → student, NULL 금지
  `reason`      TEXT         NOT NULL,                             -- 사유, NULL 금지
  `leave_date`  DATE         NOT NULL,                             -- 신청일, NULL 금지

  CONSTRAINT `PK_LEAVE_OF_ABSENCE` PRIMARY KEY (`leave_id`, `employee_id`, `student_id`),
  CONSTRAINT `FK_LOA_EMPLOYEE` FOREIGN KEY (`employee_id`) REFERENCES `employee`(`employee_id`),
  CONSTRAINT `FK_LOA_STUDENT`  FOREIGN KEY (`student_id`)  REFERENCES `student`(`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE `Chatroom_List`
  MODIFY COLUMN `chatroom_id` INT UNSIGNED NOT NULL,
  MODIFY COLUMN `member_id`   INT UNSIGNED NOT NULL;

/* 2) 기존 제약이 있으면 제거
   - 이름이 다르면 실제 이름으로 바꿔서 실행해.
   - 이미 없으면 이 구문은 건너뛰어도 됨.
*/
ALTER TABLE `Chatroom_List`
  DROP FOREIGN KEY `FK_CHATROOMLIST_CHATROOM`,
  DROP FOREIGN KEY `FK_CHATROOMLIST_MEMBER`,
  DROP PRIMARY KEY;

/* 3) 복합 PK + FK 재생성 */
ALTER TABLE `Chatroom_List`
  ADD CONSTRAINT `PK_CHATROOM_LIST`
    PRIMARY KEY (`chatroom_id`, `member_id`),
  ADD CONSTRAINT `FK_CHATROOMLIST_CHATROOM`
    FOREIGN KEY (`chatroom_id`) REFERENCES `Chatroom`(`chatroom_id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_CHATROOMLIST_MEMBER`
    FOREIGN KEY (`member_id`) REFERENCES `user`(`user_id`)
    ON DELETE CASCADE;
