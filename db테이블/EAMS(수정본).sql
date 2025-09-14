CREATE TABLE `department` (
  `department_id` INT NOT NULL,
  `department_name` VARCHAR(100) NOT NULL,
  `established_date` DATE NOT NULL,   -- YYYY-MM-DD로 저장
  `capacity` INT NOT NULL,            -- 현재 재적 인원(비음수)

  CONSTRAINT `PK_DEPARTMENT` PRIMARY KEY (`department_id`),
  CONSTRAINT `UQ_DEPARTMENT_NAME` UNIQUE (`department_name`),
  CONSTRAINT `CK_DEPARTMENT_CAPACITY` CHECK (`capacity` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 직원 
CREATE TABLE `employee` (
  `employee_id`    INT UNSIGNED NOT NULL AUTO_INCREMENT, -- PK (UNSIGNED, AUTO)
  `employee_name`  VARCHAR(50) NOT NULL,
  `department_name` VARCHAR(50) NOT NULL,
  `birth_date`     DATE NOT NULL,
  `gender`         VARCHAR(1) NOT NULL,
  `phone`          VARCHAR(13) NOT NULL,                 -- 000-0000-0000
  `address`        VARCHAR(100) NULL,
  `account_number` CHAR(43) NULL,

  CONSTRAINT `PK_EMPLOYEE` PRIMARY KEY (`employee_id`),
  CONSTRAINT `CK_EMPLOYEE_PHONE`      CHECK (`phone` REGEXP '^[0-9]{3}-[0-9]{4}-[0-9]{4}$'),
  CONSTRAINT `CK_EMPLOYEE_GENDER_LEN` CHECK (CHAR_LENGTH(`gender`) = 1),
  CONSTRAINT `CK_EMPLOYEE_ACCOUNT`    CHECK (`account_number` IS NULL OR
                                  `account_number` REGEXP '^[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `teaching assistant` (
  `assistant_id`   INT UNSIGNED NOT NULL AUTO_INCREMENT,   -- 학번(IDENTITY)
  `assistant_name` VARCHAR(50) NOT NULL,                   -- 이름
  `office`         VARCHAR(50) NOT NULL,                   -- 사무실 번호
  `birth_date`     DATE NOT NULL,                          -- 생년월일 (YYYY-MM-DD로 저장)
  `phone`          VARCHAR(13) NOT NULL,                   -- 연락처 000-0000-0000
  `address`        VARCHAR(100) NULL,                      -- 주소 (NULL 허용)
  `gender`         VARCHAR(1) NOT NULL,                    -- 성별 (1글자)
  `department_id`  INT NOT NULL,                           -- 학과번호(FK)
  `account_number` CHAR(43) NULL,                          -- 계좌번호 (0000-0000-0000-0000), NULL 허용

  CONSTRAINT `PK_TEACHING_ASSISTANT` PRIMARY KEY (`assistant_id`),



  -- 연락처 형식: 000-0000-0000
  CONSTRAINT `CK_TA_PHONE`
    CHECK (`phone` REGEXP '^[0-9]{3}-[0-9]{4}-[0-9]{4}$'),

  -- 성별: 정확히 1글자
  CONSTRAINT `CK_TA_GENDER_LEN`
    CHECK (CHAR_LENGTH(`gender`) = 1),

  -- 계좌번호 형식: 0000-0000-0000-0000 (NULL이면 통과)
  CONSTRAINT `CK_TA_ACCOUNT`
    CHECK (`account_number` IS NULL OR
           `account_number` REGEXP '^[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}$'),

  -- 학과 FK
  CONSTRAINT `FK_TA_DEPARTMENT`
    FOREIGN KEY (`department_id`) REFERENCES `department`(`department_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 교수
CREATE TABLE `Professor` (
  `professor_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `professor_name` VARCHAR(50) NOT NULL,
  `department_id` INT NOT NULL,                -- 학과번호(FK)
  `birth_date` DATE NOT NULL,                  -- 생년월일
  `phone` VARCHAR(13) NOT NULL,                -- 연락처 000-0000-0000
  `address` VARCHAR(50) NULL,                  -- 주소
  `gender` VARCHAR(1) NOT NULL,                -- 성별 (1글자)

  `lab` VARCHAR(50) NOT NULL,                  -- 연구실/사무실 (NOT NULL)
  `account_number` CHAR(43) NULL,              -- 계좌번호 (0000-0000-0000-0000 형식, NULL 허용)

  CONSTRAINT `PK_PROFESSOR` PRIMARY KEY (`professor_id`),

  -- 연락처 형식: 000-0000-0000
  CONSTRAINT `CK_PROFESSOR_PHONE`
    CHECK (`phone` REGEXP '^[0-9]{3}-[0-9]{4}-[0-9]{4}$'),

  -- 성별은 정확히 1글자
  CONSTRAINT `CK_PROFESSOR_GENDER_LEN`
    CHECK (CHAR_LENGTH(`gender`) = 1),

  -- 계좌번호 형식: 0000-0000-0000-0000
  CONSTRAINT `CK_PROFESSOR_ACCOUNT`
    CHECK (`account_number` IS NULL OR `account_number` REGEXP '^[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}$'),

  -- 학과 FK
  CONSTRAINT `FK_PROFESSOR_DEPARTMENT`
    FOREIGN KEY (`department_id`) REFERENCES `department`(`department_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 학생
CREATE TABLE `student` (
  `student_id`        INT UNSIGNED NOT NULL AUTO_INCREMENT, -- PK (UNSIGNED, AUTO)
  `student_name`      VARCHAR(50) NOT NULL,
  `grade_class`       CHAR(3) NOT NULL,                      -- 예: 3/A
  `birth_date`        DATE NOT NULL,
  `gender`            VARCHAR(1) NOT NULL,
  `phone`             VARCHAR(13) NOT NULL,                  -- 000-0000-0000
  `address`           VARCHAR(100) NULL,
  `account_number`    CHAR(43) NULL,
  `professor_id`      INT UNSIGNED NOT NULL,                 -- FK → Professor.professor_id (UNSIGNED)
  `department_id`     INT NOT NULL,                          -- FK → department.department_id (signed)
  `enrollment_status` CHAR(2) NOT NULL,                      -- '재학','휴학','재적'

  CONSTRAINT `PK_STUDENT` PRIMARY KEY (`student_id`),        -- PK
  CONSTRAINT `CK_STUDENT_GRADE_CLASS` CHECK (`grade_class` REGEXP '^[1-9]/[A-Z]$'),
  CONSTRAINT `CK_STUDENT_GENDER_LEN`  CHECK (CHAR_LENGTH(`gender`) = 1),
  CONSTRAINT `CK_STUDENT_PHONE`       CHECK (`phone` REGEXP '^[0-9]{3}-[0-9]{4}-[0-9]{4}$'),
  CONSTRAINT `CK_STUDENT_ACCOUNT`     CHECK (`account_number` IS NULL OR
                                  `account_number` REGEXP '^[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}$'),
  CONSTRAINT `CK_STUDENT_ENROLLMENT_STATUS`
    CHECK (`enrollment_status` IN ('재학','휴학','재적')),

  CONSTRAINT `FK_STUDENT_PROFESSOR`
    FOREIGN KEY (`professor_id`)  REFERENCES `Professor`(`professor_id`),  -- FK (UNSIGNED↔UNSIGNED)
  CONSTRAINT `FK_STUDENT_DEPARTMENT`
    FOREIGN KEY (`department_id`) REFERENCES `department`(`department_id`) -- FK (signed↔signed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 강의(수업)
CREATE TABLE `Lecture` (
  `lecture_id`       INT UNSIGNED NOT NULL AUTO_INCREMENT,  -- 수업번호: PK, AUTO_INCREMENT, 양수만 허용
  `lecture_name`     VARCHAR(50) NULL,                      -- 수업이름: 최대 50자, NULL 허용
  `enrollment_count` INT NOT NULL,                          -- 수강인원: NOT NULL
  `credit`           TINYINT NOT NULL,                      -- 학점: 0~9 범위, 1자리
  `classroom`        VARCHAR(50) NOT NULL,                  -- 강의실: 최대 50자, NOT NULL
  `professor_id`     INT UNSIGNED NOT NULL,                 -- 교수학번: Professor 테이블 참조 (UNSIGNED 일치 필요)
  `lecture_year`     CHAR(5) NOT NULL,                      -- 수업년도: '0000년' 형식으로 저장
  `lecture_semester` TINYINT NOT NULL,                      -- 수업학기: 1자리 정수 (일반적으로 1학기=1, 2학기=2)
  `lecture_hours`    TINYINT NOT NULL,                      -- 수업시간: 교시 수 (1~9)

  -- PK: 수업번호를 기본키로 지정
  CONSTRAINT `PK_LECTURE` PRIMARY KEY (`lecture_id`),

  -- CHECK: 학점은 반드시 0~9 사이 값
  CONSTRAINT `CK_LECTURE_CREDIT`
    CHECK (`credit` BETWEEN 0 AND 9),

  -- CHECK: 수업년도는 반드시 '0000년' 형식
  CONSTRAINT `CK_LECTURE_YEAR_FMT`
    CHECK (`lecture_year` REGEXP '^[0-9]{4}년$'),

  -- CHECK: 학기는 일반적으로 1 또는 2만 허용 (필요 시 1~9로 확장 가능)
  CONSTRAINT `CK_LECTURE_SEMESTER`
    CHECK (`lecture_semester` BETWEEN 1 AND 2),

  -- CHECK: 수업시간은 최소 1교시, 최대 9교시
  CONSTRAINT `CK_LECTURE_HOURS`
    CHECK (`lecture_hours` BETWEEN 1 AND 9),

  -- FK: 교수ID는 Professor.professor_id 참조
  CONSTRAINT `FK_LECTURE_PROFESSOR`
    FOREIGN KEY (`professor_id`) REFERENCES `Professor`(`professor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 수강
CREATE TABLE `enrollment` (
  `enrollment_id` INT UNSIGNED NOT NULL AUTO_INCREMENT, -- PK (UNSIGNED, AUTO)
  `lecture_id`    INT UNSIGNED NOT NULL,                -- FK → Lecture.lecture_id (UNSIGNED)
  `student_id`    INT UNSIGNED NOT NULL,                -- FK → student.student_id (UNSIGNED)

  CONSTRAINT `PK_ENROLLMENT` PRIMARY KEY (`enrollment_id`), -- PK

  CONSTRAINT `FK_ENROLLMENT_LECTURE`
    FOREIGN KEY (`lecture_id`) REFERENCES `Lecture`(`lecture_id`),          -- FK (UNSIGNED↔UNSIGNED)
  CONSTRAINT `FK_ENROLLMENT_STUDENT`
    FOREIGN KEY (`student_id`) REFERENCES `student`(`student_id`)           -- FK (UNSIGNED↔UNSIGNED)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 출석
CREATE TABLE `attendance` (
  `attendance_date` DATE NOT NULL,                 -- 복합 PK 일부
  `enrollment_id`   INT  UNSIGNED NOT NULL,        -- 복합 PK 일부 & FK → enrollment (UNSIGNED)

  `absent_hours`    INT NOT NULL,                  -- 결석시간 0~98

  CONSTRAINT `PK_ATTENDANCE` PRIMARY KEY (`attendance_date`, `enrollment_id`),     -- 복합 PK
  CONSTRAINT `CK_ATTENDANCE_ABSENT_HOURS` CHECK (`absent_hours` > -1 AND `absent_hours` < 99),

  CONSTRAINT `FK_ATTENDANCE_ENROLLMENT`
    FOREIGN KEY (`enrollment_id`) REFERENCES `enrollment`(`enrollment_id`)        -- FK (UNSIGNED↔UNSIGNED)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 성적
CREATE TABLE `grade` (
  `enrollment_id` INT UNSIGNED NOT NULL,           -- PK & FK → enrollment (UNSIGNED)
  `grade`         VARCHAR(2) NOT NULL,             -- A, B+, C-, ... F

  CONSTRAINT `PK_GRADE` PRIMARY KEY (`enrollment_id`),                                -- PK(1:1)
  CONSTRAINT `CK_GRADE_VALID`
    CHECK (`grade` IN ('A','A-','B+','B','B-','C+','C','C-','D+','D','D-','F')),

  CONSTRAINT `FK_GRADE_ENROLLMENT`
    FOREIGN KEY (`enrollment_id`) REFERENCES `enrollment`(`enrollment_id`)            -- FK (UNSIGNED↔UNSIGNED)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 과제
CREATE TABLE `assignment` (
  `assignment_id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,  -- PK (UNSIGNED, AUTO)
  `assignment_name`        VARCHAR(100) NOT NULL,
  `assignment_description` TEXT NOT NULL,                          -- 미입력 시 백엔드에서 "" 처리
  `lecture_id`             INT UNSIGNED NOT NULL,                  -- FK → Lecture (UNSIGNED)
  `registered_date`        DATE NULL,
  `file_path`              VARCHAR(300) NULL,

  CONSTRAINT `PK_ASSIGNMENT` PRIMARY KEY (`assignment_id`),        -- PK
  CONSTRAINT `FK_ASSIGNMENT_LECTURE`
    FOREIGN KEY (`lecture_id`) REFERENCES `Lecture`(`lecture_id`)  -- FK (UNSIGNED↔UNSIGNED)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 과제 제출
CREATE TABLE `assignment_submit` (
  `assignment_id`           INT UNSIGNED NOT NULL,     -- 복합 PK & FK → assignment (UNSIGNED)
  `enrollment_id`           INT UNSIGNED NOT NULL,     -- 복합 PK & FK → enrollment  (UNSIGNED)
  `submission_name`         VARCHAR(100) NOT NULL,
  `file_path`               VARCHAR(300) NULL,
  `submission_description`  TEXT NOT NULL,

  CONSTRAINT `PK_ASSIGNMENT_SUBMIT` PRIMARY KEY (`assignment_id`, `enrollment_id`),  -- 복합 PK
  CONSTRAINT `FK_AS_SUBMIT_ASSIGNMENT`
    FOREIGN KEY (`assignment_id`) REFERENCES `assignment`(`assignment_id`),          -- FK (UNSIGNED↔UNSIGNED)
  CONSTRAINT `FK_AS_SUBMIT_ENROLLMENT`
    FOREIGN KEY (`enrollment_id`) REFERENCES `enrollment`(`enrollment_id`)           -- FK (UNSIGNED↔UNSIGNED)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 게시판
CREATE TABLE `board` (
  `board_id`    INT UNSIGNED NOT NULL AUTO_INCREMENT, -- PK (UNSIGNED, AUTO)
  `board_name`  VARCHAR(100) NOT NULL,
  `post_count`  INT NOT NULL,

  CONSTRAINT `PK_BOARD` PRIMARY KEY (`board_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 게시글
CREATE TABLE `post` (
  `post_id`        INT UNSIGNED NOT NULL AUTO_INCREMENT, -- PK (UNSIGNED, AUTO)
  `author`         VARCHAR(50) NOT NULL,
  `created_date`   DATE NOT NULL,
  `board_id`       INT UNSIGNED NOT NULL,                -- FK → board.board_id (UNSIGNED로 맞춤)
  `title`          VARCHAR(100) NOT NULL,
  `content`        TEXT NOT NULL,
  `file_path`      VARCHAR(300) NULL,
  `allow_comment`  VARCHAR(1) NOT NULL,                  -- 't'/'f'

  CONSTRAINT `PK_POST` PRIMARY KEY (`post_id`),
  CONSTRAINT `CK_POST_ALLOW_COMMENT` CHECK (`allow_comment` IN ('t','f')),
  CONSTRAINT `FK_POST_BOARD`
    FOREIGN KEY (`board_id`) REFERENCES `board`(`board_id`)     -- FK (UNSIGNED↔UNSIGNED)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 댓글 (자기참조)
CREATE TABLE `Comments` (
  `comment_id`        INT UNSIGNED NOT NULL AUTO_INCREMENT, -- PK (UNSIGNED, AUTO)
  `author`            VARCHAR(50) NOT NULL,
  `file_path`         VARCHAR(300) NULL,
  `comment_content`   VARCHAR(100) NOT NULL,
  `parent_comment_id` INT UNSIGNED NULL,                    -- FK → Comments.comment_id (UNSIGNED 맞춤)

  CONSTRAINT `PK_COMMENTS` PRIMARY KEY (`comment_id`),
  CONSTRAINT `FK_COMMENTS_PARENT`
    FOREIGN KEY (`parent_comment_id`) REFERENCES `Comments`(`comment_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 채팅방
CREATE TABLE `Chatroom` (
  `chatroom_id`       INT UNSIGNED NOT NULL AUTO_INCREMENT, -- PK (UNSIGNED, AUTO)
  `chatroom_name`     VARCHAR(30) NOT NULL,
  `is_group`          VARCHAR(1) NOT NULL,                   -- 't'/'f'
  `last_message_time` DATE NULL,

  CONSTRAINT `PK_CHATROOM` PRIMARY KEY (`chatroom_id`),
  CONSTRAINT `CK_CHATROOM_IS_GROUP` CHECK (`is_group` IN ('t','f'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 채팅방 참여자
CREATE TABLE `Chatroom_List` (
  `chatroom_id` INT UNSIGNED NOT NULL,        -- 복합 PK & FK → Chatroom (UNSIGNED로 맞춤)
  `member_name` VARCHAR(50) NOT NULL,         -- 복합 PK

  CONSTRAINT `PK_Chatroom_List` PRIMARY KEY (`chatroom_id`, `member_name`),
  CONSTRAINT `FK_CHATROOM_TO_CHATTING_LIST`
    FOREIGN KEY (`chatroom_id`) REFERENCES `Chatroom`(`chatroom_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 채팅 메시지
CREATE TABLE `chatting` (
  `message_id`   INT UNSIGNED NOT NULL AUTO_INCREMENT, -- PK (UNSIGNED, AUTO)
  `chatroom_id`  INT UNSIGNED NOT NULL,                -- FK → Chatroom (UNSIGNED로 맞춤)
  `created_date` DATE NOT NULL,
  `content`      TEXT NOT NULL,
  `file_path`    VARCHAR(300) NULL,
  `author`       VARCHAR(50) NOT NULL,

  CONSTRAINT `PK_CHATTING` PRIMARY KEY (`message_id`),
  CONSTRAINT `FK_CHATTING_CHATROOM`
    FOREIGN KEY (`chatroom_id`) REFERENCES `Chatroom`(`chatroom_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 휴학
CREATE TABLE `Leave_of_Absence` (
  `leave_id`    INT NOT NULL,                 -- 복합 PK 일부
  `employee_id` INT UNSIGNED NOT NULL,        -- ✅ employee.employee_id와 동일하게 UNSIGNED로 맞춤
  `student_id`  INT UNSIGNED NOT NULL,        -- student.student_id와 동일 (UNSIGNED)
  `reason`      TEXT NOT NULL,
  `leave_date`  DATE NOT NULL,

  -- 복합 PK
  CONSTRAINT `PK_LEAVE_OF_ABSENCE`
    PRIMARY KEY (`leave_id`, `employee_id`, `student_id`),

  -- 직원 FK
  CONSTRAINT `FK_employee_TO_Leave_of_Absence_1`
    FOREIGN KEY (`employee_id`) REFERENCES `employee`(`employee_id`),

  -- 학생 FK
  CONSTRAINT `FK_student_TO_Leave_of_Absence_1`
    FOREIGN KEY (`student_id`)  REFERENCES `student`(`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



