'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from '../attendance-check/style.module.css';

// --------------------------
// 0. Toast
// --------------------------
const toast = (msg) => alert(msg);
const TODAY = new Date();

// --------------------------
// 1. Helper
// --------------------------

const transformAttendanceData = (rawData) => {
    const transformed = {};
    rawData.forEach(item => {
        const date = item.date || item.attendance_date;
        const studentId = item.studentId;

        if (!transformed[date]) {
            transformed[date] = {};
        }

        transformed[date][studentId] = {
            status: item.attendance_status,
            memo: item.memo || '',
        };
    });
    return transformed;
};

const getKoreanStatus = (status) => {
    switch (status) {
        case 'present':
        case '출석':
            return '출석';
        case 'late':
        case '지각':
            return '지각';
        case 'absent':
        case '결석':
            return '결석';
        case 'leave':
        case '조퇴':
            return '조퇴';
        default:
            return '미처리';
    }
};

const getStatusClass = (status) => {
    switch (status) {
        case 'present':
        case '출석':
            return styles.present;
        case 'late':
        case '지각':
            return styles.late;
        case 'absent':
        case '결석':
            return styles.absent;
        case 'leave':
        case '조퇴':
            return styles.leave;
        default:
            return styles.noData;
    }
};

// --------------------------
// 2. 실제 DB API 호출
// --------------------------

const fetchAttendanceData = async (monthStr, lectureId) => {
    const res = await fetch(
        `/api/univer_city/attendance_check?courseId=${lectureId}&month=${monthStr}`
    );
    if (!res.ok) return [];
    return await res.json();
};

const fetchDailyStudentAttendance = async (date, lectureId) => {
    const res = await fetch(
        `/api/univer_city/attendance_data?lectureId=${lectureId}&date=${date}`
    );
    if (!res.ok) return [];
    return await res.json();
};

// ⭐ DB 강의 목록
const fetchLectureList = async () => {
    const res = await fetch("/api/univer_city/lecture_list");
    if (!res.ok) return [];
    return await res.json();
};

// ⭐ 강의 상세 정보(요일/시간)
const fetchLectureDetail = async (lectureId) => {
    const res = await fetch(`/api/univer_city/lecture_detail?lectureId=${lectureId}`);
    if (!res.ok) return null;
    return await res.json();
};

// --------------------------
// AttendanceCheck Component
// --------------------------
export default function AttendanceCheck({ initialUserRole }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [userRole, setUserRole] = useState(initialUserRole || 'professor');

    const [lectureList, setLectureList] = useState([]);
    const [selectedLecture, setSelectedLecture] = useState(null);
    const [lectureDetail, setLectureDetail] = useState(null);

    const [modalData, setModalData] = useState(null);
    const [attendanceData, setAttendanceData] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    const USER_ID = 2; // 임시 로그인 학생 ID

    // ---------------------------------------------------
    // ⭐ 1) 강의 목록 로드
    // ---------------------------------------------------
    useEffect(() => {
        const loadLectures = async () => {
            const list = await fetchLectureList();
            setLectureList(list);

            if (list.length > 0) {
                setSelectedLecture(list[0].lecture_id);
            }
        };
        loadLectures();
    }, []);

    // ---------------------------------------------------
    // ⭐ 2) 강의 상세(요일/시간) 로드
    // ---------------------------------------------------
    useEffect(() => {
        if (!selectedLecture) return;

        const loadDetail = async () => {
            const detail = await fetchLectureDetail(selectedLecture);
            setLectureDetail(detail);
        };

        loadDetail();
    }, [selectedLecture]);

    // ---------------------------------------------------
    // ⭐ 3) 출석 데이터 로드
    // ---------------------------------------------------
    useEffect(() => {
        if (!selectedLecture) return;

        const fetchMonth = async () => {
            setIsLoading(true);
            const y = currentDate.getFullYear();
            const m = String(currentDate.getMonth() + 1).padStart(2, '0');
            const monthStr = `${y}-${m}`;

            const rawData = await fetchAttendanceData(monthStr, selectedLecture);
            const transformed = transformAttendanceData(rawData);

            setAttendanceData(transformed);
            setIsLoading(false);
        };

        fetchMonth();
    }, [currentDate, selectedLecture]);

    // ---------------------------------------------------
    // 날짜 클릭 → 모달
    // ---------------------------------------------------
    const handleDayClick = useCallback(
        async (date) => {
            if (userRole !== 'professor') return;
            if (!lectureDetail) return;

            const formattedDate = date.toISOString().split('T')[0];

            setModalData({
                title: `${formattedDate} 출석 상세`,
                body: <p>로딩중...</p>,
            });

            const data = await fetchDailyStudentAttendance(
                formattedDate,
                selectedLecture
            );

            const table = (
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th>학번</th>
                            <th>이름</th>
                            <th>출결</th>
                            <th>시간</th>
                            <th>메모</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((st) => (
                            <tr key={st.studentId}>
                                <td>{st.student_number}</td>
                                <td>{st.name}</td>
                                <td>
                                    <span
                                        className={`${styles.statusPill} ${getStatusClass(
                                            st.status
                                        )}`}
                                    >
                                        {getKoreanStatus(st.status)}
                                    </span>
                                </td>
                                <td>{st.hours > 0 ? `${st.hours}시간` : '-'}</td>
                                <td>{st.memo || st.late_reason || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );

            setModalData({
                title: `${formattedDate} 출석 상세`,
                body: table,
            });
        },
        [userRole, selectedLecture, lectureDetail]
    );

    // ---------------------------------------------------
    // ⭐ 4) 달력 생성 — “수업 요일” 색 표시 추가됨
    // ---------------------------------------------------
    const renderCalendar = useCallback(() => {
        if (!lectureDetail) return null;

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const first = new Date(year, month, 1);

        const startIndex = first.getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const grid = [];

        // 요일 매핑
        const korMap = {
            일: 0,
            월: 1,
            화: 2,
            수: 3,
            목: 4,
            금: 5,
            토: 6,
        };
        const lectureDayIndex = korMap[lectureDetail.day_of_week];

        // 앞부분(이전달)
        for (let i = 0; i < startIndex; i++) {
            grid.push({ current: false });
        }

        // 이번달
        for (let day = 1; day <= daysInMonth; day++) {
            const dateObj = new Date(year, month, day);
            const dateStr = dateObj.toISOString().split('T')[0];

            const isLectureDay = dateObj.getDay() === lectureDayIndex;
            const daily = attendanceData[dateStr]?.[USER_ID];

            const status = daily
                ? daily.status
                : isLectureDay
                ? '미처리'
                : 'noData';

            grid.push({
                current: true,
                date: dateObj,
                isLectureDay,
                status,
            });
        }

        return grid.map((d, idx) => {
            if (!d.current) {
                return (
                    <div
                        key={idx}
                        className={`${styles.day} ${styles.otherMonth}`}
                    ></div>
                );
            }

            // ⭐ 여기에 색상 클래스 추가됨
            let className = `${styles.day}`;
            if (d.isLectureDay) {
                className += ` ${styles.lectureDay}`;
                className += ` ${styles.lectureDayBorder}`;
            }

            return (
                <div
                    key={idx}
                    className={className}
                    onClick={() =>
                        d.isLectureDay && handleDayClick(d.date)
                    }
                >
                    <span className={styles.dateNumber}>
                        {d.date.getDate()}
                    </span>

                    {d.isLectureDay && (
                        <span
                            className={`${styles.statusPill} ${getStatusClass(
                                d.status
                            )}`}
                        >
                            {getKoreanStatus(d.status)}
                        </span>
                    )}
                </div>
            );
        });
    }, [attendanceData, currentDate, selectedLecture, lectureDetail]);

    // ---------------------------------------------------
    // JSX
    // ---------------------------------------------------
    return (
        <div className={styles.layout}>
            <div className={styles.topbar}>
                <div className={styles.titleRow}>
                    <h1 className={styles.title}>출석 조회</h1>

                    {/* ⭐ DB 강의 목록 드롭다운 */}
                    <select
                        className={styles.classSelect}
                        value={selectedLecture || ''}
                        onChange={(e) =>
                            setSelectedLecture(Number(e.target.value))
                        }
                    >
                        {lectureList.map((lec) => (
                            <option
                                key={lec.lecture_id}
                                value={lec.lecture_id}
                            >
                                {lec.lecture_name} ({lec.day_of_week})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.calendarContainer}>
                <div className={styles.calendarNav}>
                    <button
                        onClick={() =>
                            setCurrentDate(
                                (prev) =>
                                    new Date(
                                        prev.getFullYear(),
                                        prev.getMonth() - 1,
                                        1
                                    )
                            )
                        }
                    >
                        &lt; 이전달
                    </button>

                    <h2>{`${currentDate.getFullYear()}년 ${
                        currentDate.getMonth() + 1
                    }월`}</h2>

                    <button
                        onClick={() =>
                            setCurrentDate(
                                (prev) =>
                                    new Date(
                                        prev.getFullYear(),
                                        prev.getMonth() + 1,
                                        1
                                    )
                            )
                        }
                    >
                        다음달 &gt;
                    </button>
                </div>

                <div className={styles.calendar}>
                    <div className={styles.dayName}>일</div>
                    <div className={styles.dayName}>월</div>
                    <div className={styles.dayName}>화</div>
                    <div className={styles.dayName}>수</div>
                    <div className={styles.dayName}>목</div>
                    <div className={styles.dayName}>금</div>
                    <div className={styles.dayName}>토</div>

                    {isLoading ? (
                        <div
                            style={{
                                gridColumn: '1 / span 7',
                                textAlign: 'center',
                                padding: '20px',
                            }}
                        >
                            로딩중...
                        </div>
                    ) : (
                        renderCalendar()
                    )}
                </div>
            </div>

            {/* 모달 */}
            {modalData && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modalContent}>
                        <span
                            className={styles.close}
                            onClick={() => setModalData(null)}
                        >
                            &times;
                        </span>
                        <h3>{modalData.title}</h3>
                        <div className={styles.modalBody}>
                            {modalData.body}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
