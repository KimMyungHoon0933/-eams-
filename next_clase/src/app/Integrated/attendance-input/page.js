// app/attendance-input/page.js
'use client';

import { useState, useEffect } from 'react';
import IntegratedMenu from '../../components/IntegratedMenu'; // ✅ 꼭 임포트
import styles from './style.module.css';

function AttendanceContent() {
  const [selectedClass, setSelectedClass] = useState('컴소과 2-1 자료구조');
  const [todayDate, setTodayDate] = useState('');

  useEffect(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    setTodayDate(`오늘 ${y}-${m}-${d}`);
  }, []);

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
              <h3>필터</h3>
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

          <div className={styles.centerPlaceholder}>
            <div className={styles.placeholderBox}>중앙 출석표 컴포넌트 영역</div>
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
                  <dd>40 / 36</dd>
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
              className={`${styles.btn} ${styles.ghost}`}
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
              onClick={() => toast('제출/저장되었습니다.')}
            >
              제출/저장
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default function AttendanceInputPage() {
  return (
    <IntegratedMenu
      // 원하는 경우 좌측 헤더에 경로 제목이 뜨게 하려면 초기 키를 설정
      initialKey="출석 > 출석 입력"
      // 우측 컨텐츠를 이 함수로 완전히 대체
      renderOverride={() => <AttendanceContent />}
    />
  );
}
