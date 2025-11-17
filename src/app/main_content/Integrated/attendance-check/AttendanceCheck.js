'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from '../attendance-check/style.module.css'; 

// 임시 Toast (실제 환경에서는 별도 구현)
const toast = (msg) => alert(msg);
const today = new Date();


// ----------------------------------------------------
// 1. 상태 변환 및 UI 헬퍼 함수
// ----------------------------------------------------

/**
 * DB에서 가져온 출결 데이터 객체를 일별로 처리하기 쉬운 형태로 변환합니다.
 * @param {Array<Object>} rawData - API에서 가져온 출결 데이터 목록.
 * @returns {Object} { 'YYYY-MM-DD': { studentId: { status: string, memo: string, late_minutes: number }, ... }, ... }
 */
const transformAttendanceData = (rawData) => {
    // 💡 이 부분은 API 스펙에 따라 달라질 수 있습니다.
    const transformed = {};
    rawData.forEach(item => {
        const date = item.date || item.attendance_date; 
        const studentId = item.studentId;

        if (!transformed[date]) {
            transformed[date] = {};
        }

        transformed[date][studentId] = {
            status: item.attendance_status, // '출석', '지각', '결석', '조퇴'
            memo: item.memo || '',
        };
    });
    return transformed;
};


// 한국어 상태 변환 헬퍼 함수
const getKoreanStatus = (status) => {
    switch(status) {
        case 'present': 
        case '출석': return '출석';
        case 'late': 
        case '지각': return '지각';
        case 'absent': 
        case '결석': return '결석';
        case 'leave':
        case '조퇴': return '조퇴';
        default: return '미처리'; // 'unknown', 'noData' 등 포함
    }
};

const getStatusClass = (status) => {
    switch(status) {
        case 'present':
        case '출석': return styles.present;
        case 'late':
        case '지각': return styles.late;
        case 'absent':
        case '결석': return styles.absent;
        case 'leave':
        case '조퇴': return styles.leave;
        default: return styles.noData; // 'unknown', 'noData', '미처리'
    }
}


// ----------------------------------------------------
// 2. API 함수 (출결 데이터 조회)
// ----------------------------------------------------
const fetchAttendanceData = async (dateStr) => {
    // 💡 [필수 수정] 실제 API 경로로 대체하세요.
    // console.log(`[API Call] 월별 출석 조회: 날짜=${dateStr}`);
    
    // 임시 더미 데이터 (YYYY-MM-DD, 출결 상태)
    const MOCK_DATA = [
        // 1일, 5일 출석, 10일 지각, 15일 결석, 20일 조퇴
        { date: '2025-11-01', studentId: 'S1', attendance_status: '출석', memo: '' },
        { date: '2025-11-05', studentId: 'S1', attendance_status: 'present', memo: '' },
        { date: '2025-11-10', studentId: 'S1', attendance_status: 'late', memo: '교통 체증' },
        { date: '2025-11-15', studentId: 'S1', attendance_status: 'absent', memo: '개인 사정' },
        { date: '2025-11-20', studentId: 'S1', attendance_status: 'leave', memo: '병원 방문' },
    ];
    
    // await new Promise(resolve => setTimeout(resolve, 1000));
    
    return MOCK_DATA;
};

// ⭐️ [신규 함수] 날짜별 학생 리스트 데이터를 API로 가져오는 모의 함수 (모달용)
const fetchDailyStudentAttendance = async (date, lectureId) => {
    // 💡 [핵심] 실제 API 호출 경로로 대체해야 합니다.
    console.log(`[API Call] 날짜별 학생 출결 조회: 날짜=${date}, 강의ID=${lectureId}`);
    
    // 임시 더미 데이터 (예시)
    const MOCK_DATA = [
        { studentId: 1001, student_number: '20241001', name: '홍길동', status: 'present', hours: 3, memo: '교수님께 미리 연락함', late_reason: '' },
        { studentId: 1002, student_number: '20241002', name: '이순신', status: 'late', hours: 1, memo: '', late_reason: '교통 체증으로 지각' },
        { studentId: 1003, student_number: '20241003', name: '강감찬', status: 'absent', hours: 3, memo: '개인 사정으로 결석', late_reason: '' },
        { studentId: 1004, student_number: '20241004', name: '유관순', status: 'present', hours: 3, memo: '', late_reason: '' },
        { studentId: 1005, student_number: '20241005', name: '김구', status: 'leave', hours: 1, memo: '오후 일정으로 조퇴', late_reason: '' },
    ];
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return MOCK_DATA.map(student => ({
        ...student,
        hours: student.status === 'present' ? 0 : student.hours 
    }));
};


// ----------------------------------------------------
// 3. 메인 컴포넌트
// ----------------------------------------------------

export default function AttendanceCheck({ initialUserRole }) {
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(today);
    const [selectedClass, setSelectedClass] = useState('컴소과 2-1 자료구조'); 
    const [userRole, setUserRole] = useState(initialUserRole || 'professor'); // prop 사용
    const USER_ID = '1';
    const LECTURE_ID = 1; // 💡 [필수 수정] 실제 강의 ID로 대체하세요.
    const [modalData, setModalData] = useState(null); // ⭐️ 신규 상태: 모달 데이터
    const [attendanceData, setAttendanceData] = useState({}); 
    const [isLoading, setIsLoading] = useState(true); 
    
    
    // ⭐️ API 호출을 위한 useEffect 추가 (기존 코드와 동일)
    useEffect(() => {
        const fetchAttendanceDataForMonth = async () => {
            setIsLoading(true);
            const y = currentDate.getFullYear();
            const m = String(currentDate.getMonth() + 1).padStart(2, '0');
            const dateStr = `${y}-${m}-01`;
            
            const rawData = await fetchAttendanceData(dateStr); 
            const transformedData = transformAttendanceData(rawData);
            
            setAttendanceData(transformedData);
            setIsLoading(false);
        };
        
        fetchAttendanceDataForMonth();
    }, [currentDate]); 

    // 이전 달로 이동 (기존 코드와 동일)
    const prevMonth = useCallback(() => {
        setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1));
    }, []);

    // 다음 달로 이동 (기존 코드와 동일)
    const nextMonth = useCallback(() => {
        setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1));
    }, []);

    // 강의 변경 핸들러 (기존 코드와 동일)
    const handleClassChange = (e) => {
        setSelectedClass(e.target.value);
        setCurrentDate(new Date()); 
    };
    
    // ⭐️ [신규 함수] 날짜 클릭 시 모달 열기
    const handleDayClick = useCallback(async (date) => {
        if (userRole !== 'professor') return; // 학생은 클릭 불가

        const formattedDate = date.toISOString().split('T')[0];
        
        // 1. 모달 로딩 상태 설정
        setModalData({
            title: `${formattedDate} 강의 출결 상세`,
            body: <p>데이터를 불러오는 중...</p>,
        });

        // 2. 해당 날짜의 상세 출결 데이터 가져오기 (API 호출)
        try {
            const dailyAttendance = await fetchDailyStudentAttendance(formattedDate, LECTURE_ID);
            
            // 3. 모달 내용 구성 (테이블)
            const modalTable = (
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th>학번</th>
                            <th>이름</th>
                            <th>상태</th>
                            <th>결강/지각/조퇴 시간</th>
                            <th>특이사항/메모</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dailyAttendance.map((student) => (
                            <tr key={student.studentId}>
                                <td>{student.student_number}</td>
                                <td>{student.name}</td>
                                <td>
                                    <span className={`${styles.statusPill} ${getStatusClass(student.status)}`}>
                                        {getKoreanStatus(student.status)}
                                    </span>
                                </td>
                                <td>{student.hours > 0 ? `${student.hours}시간` : '-'}</td> 
                                <td>{student.memo || student.late_reason || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );

            // 4. 모달 데이터 설정 (테이블)
            setModalData({
                title: `${formattedDate} 강의 출결 상세`,
                body: modalTable,
            });

        } catch (error) {
            console.error("날짜별 상세 출석 조회 오류:", error);
            setModalData({
                title: `${formattedDate} 강의 출결 상세`,
                body: <p style={{color: 'red'}}>상세 출결 데이터를 불러오는 데 실패했습니다.</p>,
            });
        }
    }, [userRole]); // userRole이 바뀔 때만 재생성

    // 캘린더 렌더링
    const renderCalendar = useCallback(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // ... (날짜 계산 로직은 기존 코드와 동일) ...
        const firstDayOfMonth = new Date(year, month, 1);
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        const startDayIndex = firstDayOfMonth.getDay();
        const days = [];
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // 이전 달 날짜 채우기
        for (let i = 0; i < startDayIndex; i++) {
            const date = new Date(year, month - 1, daysInPrevMonth - startDayIndex + i + 1);
            days.push({ date, isCurrentMonth: false, isLectureDay: false, status: 'noData', isToday: false });
        }

        // 현재 달 날짜 채우기
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            const dateStr = date.toISOString().split('T')[0];
            const isToday = date.toDateString() === today.toDateString();
            
            const dayOfWeek = date.getDay();
            const isLectureDay = [1, 3, 5].includes(dayOfWeek); // Mock: 월, 수, 금만 수업
            
            let status = 'noData'; 
            
            const dailyData = attendanceData[dateStr] ? attendanceData[dateStr][USER_ID] : null;
            
            if (dailyData) {
                 status = dailyData.status; 
            } else if (isLectureDay) {
                status = 'unknown'; 
            } else {
                status = 'noData'; 
            }
            
            days.push({ date, isCurrentMonth: true, isLectureDay, status, isToday });
        }

        // 다음 달 날짜 채우기 
        const totalDays = days.length;
        const remainingDays = 42 - totalDays; 

        for (let i = 1; i <= (remainingDays > 7 ? remainingDays : 7); i++) {
             const date = new Date(year, month + 1, i);
             if (days.length % 7 === 0 && days.length >= 35) break; 
             
             days.push({ date, isCurrentMonth: false, isLectureDay: false, status: 'noData', isToday: false });
        }
        
        return days.map((day, index) => {
            const { date, isCurrentMonth, isLectureDay, status, isToday } = day;
            
            let dayClass = styles.day;
            
            if (!isCurrentMonth) {
                dayClass += ` ${styles.otherMonth}`;
            }
            
            if (userRole === 'professor' && isCurrentMonth && isLectureDay) {
                dayClass += ` ${styles.lectureDayProfessor}`;
            } else if (isCurrentMonth && isLectureDay) {
                 dayClass += ` ${styles.lectureDayStudent}`;
            }

            if (isToday) {
                 dayClass += ` ${styles.today}`;
            }
            
            let statusPill = null;
            if (isLectureDay || status === 'present' || status === 'late' || status === 'absent' || status === 'leave') {
                statusPill = (
                    <span className={`${styles.statusPill} ${getStatusClass(status)}`}>
                        {getKoreanStatus(status)}
                    </span>
                );
            }
            
            return (
                <div
                    key={index}
                    className={dayClass}
                    // ⭐️ [수정] 교수 권한이고 현재 달/수업 요일일 때만 클릭 이벤트 적용
                    onClick={() => {
                        if (userRole === 'professor' && isCurrentMonth && isLectureDay) {
                           handleDayClick(date); 
                        }
                    }}
                >
                    <span className={styles.dateNumber}>{date.getDate()}</span>
                    
                    {statusPill}
                    
                </div>
            );
        });
        
    }, [currentDate, attendanceData, userRole, handleDayClick]); 
    
    // 최종 JSX 구조
    return (
        <div className={styles.layout}>
            {/* 상단바 (기존 코드와 동일) */}
            <div className={styles.topbar}>
                <div className={styles.crumbs}>출석관리 &gt; <strong>출석 조회</strong></div>
                <div className={styles.titleRow}>
                    <h1 className={styles.title}>출석 조회</h1>
                    <select 
                        className={styles.classSelect}
                        value={selectedClass} 
                        onChange={handleClassChange}
                    >
                        <option value="자료구조">자료구조</option>
                        <option value="전자회로">전자회로</option>
                    </select>
                </div>
            </div>
            
            {/* 캘린더 컨테이너 (기존 코드와 동일) */}
            <div className={styles.calendarContainer}>
                <div className={styles.calendarNav}>
                    <button onClick={prevMonth}> &lt; 이전 달</button>
                    <h2>{`${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`}</h2>
                    <button onClick={nextMonth}>다음 달 &gt; </button>
                </div>
                
                <div className={styles.calendar}>
                    <div className={styles.dayName}>일</div>
                    <div className={styles.dayName}>월</div>
                    <div className={styles.dayName}>화</div>
                    <div className={styles.dayName}>수</div>
                    <div className={styles.dayName}>목</div>
                    <div className={styles.dayName}>금</div>
                    <div className={styles.dayName}>토</div>
                    
                    {isLoading ? 
                        <div style={{gridColumn: '1 / span 7', textAlign: 'center', padding: '20px', color: '#666'}}>
                            데이터를 로드하는 중입니다...
                        </div>
                        :
                        renderCalendar()
                    }
                </div>
            </div>
            
            {/* 범례 (기존 코드와 동일) */}
            <div className={styles.legend}>
                **범례:** <span className={`${styles.statusBox} ${styles.present}`}>출석</span>
                <span className={`${styles.statusBox} ${styles.late}`}>지각</span>
                <span className={`${styles.statusBox} ${styles.leave}`}>조퇴</span>
                <span className={`${styles.statusBox} ${styles.absent}`}>결석</span>
                <span className={`${styles.statusBox} ${styles.noData}`}>수업/미처리</span>
            </div>

            {/* ⭐️ [모달 렌더링] */}
            {modalData && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modalContent}>
                        <span className={styles.close} onClick={() => setModalData(null)}>&times;</span>
                        <h3>{modalData.title}</h3>
                        <div className={styles.modalBody}>
                            {modalData.body}
                        </div>
                        {/* 관리 버튼 추가 */}
                        <div className={styles.modalFooter}>
                            {userRole === 'professor' && (
                                <button 
                                    className={`${styles.btn} ${styles.primary}`}
                                    onClick={() => toast('출결 관리 페이지로 이동 또는 인라인 수정 활성화')}
                                >
                                    출결 관리
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}