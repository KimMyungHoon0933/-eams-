// src/components/attendance/ClassInfoSection.js
'use client';

export default function ClassInfoSection({ courseInfo, announcements }) {
    
  // 임시 데이터 (props로 받는다고 가정)
  const defaultInfo = {
    className: '컴소과 2-1 자료구조',
    professor: '김교수',
    capacity: 40,
    enrolled: 36,
    avgAttendance: '92%',
  };
  const info = courseInfo || defaultInfo;

  const defaultAnnouncements = [
    { id: 1, text: '9/10: 팀프로젝트 조 편성 완료' },
    { id: 2, text: '9/12: 실습실 변경 B-205' },
    { id: 3, text: '9/15: 퀴즈 #2 공지' },
  ];
  const notices = announcements || defaultAnnouncements;

  return (
    <>
      {/* 1. 오늘 수업정보 카드 */}
      <div className="card" style={{ padding: '14px', marginTop: '20px' }}>
        <h3>오늘 수업정보</h3>
        <dl className="desc">
            {/* JSX 변환 시 class 대신 className 사용 및 닫는 태그 / 필수 */}
            <div><dt>강의명</dt><dd id="className">{info.className}</dd></div> 
            <div><dt>담당</dt><dd>{info.professor}</dd></div>
            <div><dt>정원/수강</dt><dd> {info.enrolled} / {info.capacity} </dd></div>
            <div><dt>평균 출석률</dt><dd>{info.avgAttendance}</dd></div>
        </dl>
        <div className="legend">
            <span className="pill ok">출석</span>
            <span className="pill late">지각</span>
            <span className="pill leave">조퇴</span>
            <span className="pill absent">결석</span>
        </div>
      </div>

      {/* 2. 최근 공지 카드 */}
      <div className="card" style={{ marginTop: '16px', padding: '14px' }}>
        <h3>최근 공지</h3>
        <ul className="list" style={{ paddingLeft: '0', listStyle: 'none', margin: '0' }}>
          {notices.map(n => (
            <li key={n.id} style={{ fontSize: '14px', marginBottom: '6px' }}>{n.text}</li>
          ))}
        </ul>
      </div>
    </>
  );
}