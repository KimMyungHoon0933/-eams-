'use client';

import { useState, useEffect } from 'react';
import styles from '../Integrated/attendance-input/style.module.css';
import AttendanceCard from '../Integrated/attendance-input/AttendanceCard';
import AttendanceCheck from '../Integrated/attendance-check/AttendanceCheck';

export default function AttendanceContent() {
  const [selectedClass, setSelectedClass] = useState('컴소과 2-1 자료구조');
  const [todayDate, setTodayDate] = useState('');
  const [students, setStudents] = useState([]);
  const [allAttendanceData, setAllAttendanceData] = useState({});
  const [filterMode, setFilterMode] = useState('전체');

  const handleStudentStatusChange = (studentId, status, memo, lateReason) => {
    setAllAttendanceData(prevData => ({
        ...prevData,
        [studentId]: {
            status,
            memo,
            lateReason,
        }
    }));
};
  useEffect(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0'); 
    setTodayDate(`오늘 ${y}-${m}-${d}`);

    const LECTURE_ID = 1; // 💡 [필수 수정] 실제 강의 ID로 대체하세요.
    const ATTENDANCE_DATE = `${y}-${m}-${d}`;

    // ✅ DB 데이터를 불러오는 비동기 함수 정의
    const fetchAttendanceData = async () => {
        try {
            // 💡 [필수 수정] 실제 백엔드 API 주소로 변경해야 합니다.
            // 이 API는 해당 강의의 학생 목록과 출석 정보를 반환해야 합니다.
            const API_URL = `/api/univer_city/attendance_data?lectureId=${LECTURE_ID}&date=${ATTENDANCE_DATE}`;
            const response = await fetch(API_URL); // 기본은 GET 요청

            if (!response.ok) {
                // HTTP 상태 코드가 200 범위가 아닐 경우 에러 처리
                throw new Error('출석 데이터를 불러오는 데 실패했습니다.');
            }

            // 응답 데이터는 DB 필드를 포함한 학생 배열 형식이라고 가정합니다.
            // 예시 데이터 형식: [{ studentId: '20230001', name: '김철수', attendance_status: '출석', memo: '' }, ...]
            const fetchedStudents = await response.json(); 
            
            // 2. 초기 상태 구성: students 상태와 allAttendanceData 상태를 동시에 업데이트합니다.
            const initialData = {};
            fetchedStudents.forEach(s => {
                // studentId를 키로 사용 (DB 스키마에 따라 s.user_id 등으로 변경될 수 있음)
                const uniqueStudentId = s.studentId || s.user_id;

                initialData[uniqueStudentId] = {
                    // 💡 [필수 수정] DB에서 받은 필드명으로 변경하세요. (예: s.attendance_status)
                    status: s.attendance_status || '미처리', 
                    memo: s.memo || '',
                    lateReason: s.late_reason || '',
                };
            });
            
            setStudents(fetchedStudents); // 학생 목록 상태 업데이트
            setAllAttendanceData(initialData); // 초기 출석 데이터 상태 설정
            
        } catch (error) {
            console.error('출석 데이터 로드 오류:', error);
            // 사용자에게 오류 메시지 표시
            toast('출석 데이터를 불러오는 중 오류가 발생했습니다.'); 
        }
    };
    
    // 데이터 로드 함수 호출
    fetchAttendanceData();

  }, []); // 컴포넌트 마운트 시 한 번만 실행
  const toast = (msg) => alert(msg);

  const WEEK_START = '2025-03-01';
  const WEEK_COUNT = 16;
  const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
  };

  const weeks = Array.from({ length: WEEK_COUNT }, (_, i) => {
    const dateStr = addDays(WEEK_START, i * 7);
    return (
      <div key={i} className={styles.weekItem}>
        <span>{i + 1}주차</span>
        <span className={styles.date}>({dateStr})</span>
      </div>
    );
  });

  const handleSubmit = async () => {
    const LECTURE_ID = 1; // 💡 실제 강의 ID로 대체 필요
    const ATTENDANCE_DATE = todayDate.split(' ')[1]; 

    const attendanceRecords = Object.keys(allAttendanceData).map(studentId => ({
        studentId: studentId,
        ...allAttendanceData[studentId]
    }));

    // ⭐️ [수정됨] payload 변수 정의 및 POST 구조 통일
    const payload = {
        lectureId: LECTURE_ID,
        attendanceDate: ATTENDANCE_DATE,
        attendanceData: attendanceRecords
    };
    
    try {
        // 💡 백엔드 라우트 경로를 /api/univer_city/insert_attendance로 통일
        const response = await fetch('/api/univer_city/insert_attendance', { 
            method: 'POST', // ⭐️ POST 메서드 명시
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            toast('제출/저장되었습니다.');
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || '데이터 저장 실패');
        }

    } catch (error) {
        console.error('출석 데이터 저장 오류:', error);
        toast(`저장에 실패했습니다: ${error.message}`);
    }
};
  

  return (
    <div className={styles.layout}>
      <main className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.left}>
            <div className={styles.crumbs}>
              출석관리 &gt; <strong>출석 입력</strong>
            </div>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>출석 입력</h1>
              <select
                className={styles.classSelect}
                onChange={(e) => setSelectedClass(e.target.value)}
                value={selectedClass}
              >
                <option>컴소과 2-1 자료구조</option>
                <option>컴소과 1-2 웹프로그래밍</option>
                <option>컴소과 3-1 운영체제</option>
              </select>
            </div>
          </div>
          <div className={styles.right}>
            <div className={styles.todayDate}>{todayDate}</div>
          </div>
        </header>

        <section className={styles.grid}>
          <aside className={styles.toolCol}>
            <div className={styles.card}>
              <h3>출석상태</h3>
              <label className={styles.field}>
                <span>상태</span>
                <select className={styles.formInput}>
                  {/* formInput 클래스 적용 */}
                  <option>전체</option>
                  <option>출석</option>
                  <option>지각</option>
                  <option>조퇴</option>
                  <option>결석</option>
                </select>
              </label>
              <label className={styles.field}>
                <span>이름/학번 검색</span>
                <input type="text" placeholder="예: 20231234 / 홍길동" />
              </label>
            </div>

            <div className={styles.card}>
              <h3>메모</h3>
              <textarea rows="6" placeholder="수업 특이사항, 과제 공지 등"></textarea>
              <div className={styles.rightRow}>
                <button
                  className={`${styles.btn} ${styles.ghost}`}
                  type="button"
                  onClick={() => toast('메모가 임시저장되었습니다.')}
                >
                  임시저장
                </button>
              </div>
            </div>
          </aside>

          <div className={styles.cards}>
              {students.length > 0 ? (
                  students.map((student) => (
                    <AttendanceCard 
                        key={student.id} 
                        student={student} 
                        // ✅ onStatusChange prop을 새로운 핸들러 함수로 연결
                        // AttendanceCard는 studentId, status, memo, lateReason을 모두 전달해야 합니다.
                        onStatusChange={handleStudentStatusChange} 
                    />
                ))
            ) : (
                <div className={styles.placeholderBox}>
                    {filterMode === '결석자' 
                     ? '결석 또는 미처리 상태인 학생이 없습니다.' 
                     : '학생 데이터가 없습니다.'}
                </div>
              )}
            </div>

          <aside className={styles.infoCol}>
            <div className={styles.card}>
              <h3>주차 선택</h3>
              <div className={styles.weeks}>{weeks}</div>
            </div>

            <div className={styles.card}>
              <h3>오늘 수업정보</h3>
              <dl className={styles.desc}>
                <div>
                  <dt>강의명</dt>
                  <dd>{selectedClass}</dd>
                </div>
                <div>
                  <dt>담당</dt>
                  <dd>김교수</dd>
                </div>
                <div>
                  <dt>정원/수강</dt>
                  <dd>36 / 40</dd>
                </div>
                <div>
                  <dt>평균 출석률</dt>
                  <dd>92%</dd>
                </div>
              </dl>
              <div className={styles.legend}>
                <span className={`${styles.pill} ${styles.ok}`}>출석</span>
                <span className={`${styles.pill} ${styles.late}`}>지각</span>
                <span className={`${styles.pill} ${styles.leave}`}>조퇴</span>
                <span className={`${styles.pill} ${styles.absent}`}>결석</span>
              </div>
            </div>

            <div className={styles.card}>
              <h3>최근 공지</h3>
              <ul className={styles.list}>
                <li>9/10: 팀프로젝트 조 편성 완료</li>
                <li>9/12: 실습실 변경 B-205</li>
                <li>9/15: 퀴즈 #2 공지</li>
              </ul>
            </div>
          </aside>

          
        </section>

        <footer className={styles.bottomBar}>
          <div className={styles.leftRow}>
            <span className={styles.muted}>자동저장 간격 30초</span>
          </div>
          <div className={styles.rightRow}>
            <button
              className={`${styles.btn} ${styles.primary}`} 
              type="button"
              onClick={() => toast('마지막 저장 상태로 원복했습니다.')}
            >
              원복
            </button>
            <button
              className={styles.btn}
              type="button"
              onClick={() => toast('임시저장 완료')}
            >
              임시저장
            </button>
            <button
            className={`${styles.btn} ${styles.primary}`}
            type="button"
            // ✅ 기존 onClick={() => toast('제출/저장되었습니다.')} 를 교체
            onClick={async () => {
                // 💡 ATTENDANCE_DATE, LECTURE_ID는 useEffect 내부에서 계산되거나 정의되어야 합니다.
                // LECTURE_ID를 state로 관리한다고 가정하고, 현재 코드의 구조에 맞게 수정합니다.
                const ATTENDANCE_DATE = new Date().toISOString().split('T')[0]; // 오늘 날짜 YYYY-MM-DD
                const LECTURE_ID = 1; // 💡 [필수 수정] 실제 강의 ID로 대체하세요. 
                const PROFESSOR_ID = '1'; // 💡 [필수 수정] 로그인된 교수 ID로 대체하세요. 

                // allAttendanceData 객체를 POST API가 요구하는 배열 형식으로 변환
                const attendanceRecordsArray = Object.keys(allAttendanceData)
                    .map(studentId => ({
                        studentId: studentId,
                        status: allAttendanceData[studentId].status,
                        memo: allAttendanceData[studentId].memo,
                        lateReason: allAttendanceData[studentId].lateReason,
                    }));
                
                const dataToSave = {
                    lectureId: LECTURE_ID,
                    attendanceDate: ATTENDANCE_DATE,
                    professorId: PROFESSOR_ID,
                    records: attendanceRecordsArray 
                };

                try {
                    const response = await fetch('/api/univer_city/insert_attendance', { // ⭐️ 저장 API 경로
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(dataToSave),
                    });

                    if (response.ok) {
                        // 성공 메시지
                        alert('✅ 출석 정보가 최종 저장/수정되었습니다.'); 
                    } else {
                        const errorData = await response.json();
                        alert(`❌ 저장 실패: ${errorData.message}`);
                    }
                } catch (error) {
                    console.error('저장 중 오류:', error);
                    alert('❌ 네트워크 오류 또는 서버 오류로 저장에 실패했습니다.');
                }
            }} 
          >
            제출/저장
          </button>
          </div>
        </footer>
      </main>
    </div>
  );
}