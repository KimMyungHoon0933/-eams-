// app/components/MainContent.js
"use client";
import { useState } from "react";
import Messenger from "./messeage_component/Messenger";

export default function MainContent() {
  const [showMessenger, setShowMessenger] = useState(false);

  return (
    <>
      <link rel="stylesheet" href="/assest/css/seoulUniversity_Copy.css"/>
      <link rel="stylesheet" href="/assest/css/seoulUniverContent.css"/>
      <link rel="stylesheet" href="/assest/css/notice.css"/>
      <link rel="stylesheet" href="/assest/css/DsuNews.css"/>
      <link rel="stylesheet" href="/assest/css/Quickmenu.css"/>
      <link rel="stylesheet" href="/assest/css/timetable.css"/>
      <link rel="stylesheet" href="/assest/css/herder.css"/>

      {/* 로그인 박스 */}
      <div className="login-box">
        <div className="user">
          <span className="user-name">홍** 님</span>
          <span className="user-role">학부생</span>
        </div>
        <div className="btn-group">
          <div className="btn">개인정보변경</div>
          <div className="btn">비밀번호 변경</div>
          <div className="btn">채팅방 설정</div>
        </div>
        <div className="mail-box">
          <p>안읽은 메시지</p>
          <div><span style={{ color: "red" }}>1</span> 건</div>
          {/* ✅ 클릭 시 모달 열기 */}
          <button className="mail-btn" onClick={() => setShowMessenger(true)}>
            메시지 조회
          </button>
        </div>
        <div>최종 로그인</div>
        <div className="info">
          ▶ 시간: 2018.12.06 19:22<br/>
          ▶ 접속IP: ***.***.***.***
        </div>
        <div className="select-box"><select><option>신분: 학부생</option></select></div>
        <div className="select-box"><select><option>나의 관련사이트</option></select></div>
      </div>

      {/* 공지사항 카드 */}
      <div className="card">
        <div className="tab-container">
          <nav className="tabs">
            <a className="tab active">공지사항</a>
            <a className="tab">단과공지</a>
            <a className="tab">채용/인턴/창업</a>
          </nav>
          <div className="add-btn">＋</div>
        </div>
        <ul className="notice-list">
          <li className="notice-item"><div className="title"><span className="bullet"></span>2025학년도 1학기 동서울대학교교장학금 신청 안내</div><span className="date">2025.05.04</span></li>
          <li className="notice-item"><div className="title"><span className="bullet"></span>[학생장학금]2025학년도 1학기 동서울아카데미</div><span className="date">2025.05.04</span></li>
          <li className="notice-item"><div className="title"><span className="bullet"></span>[장학]국가장학금 선발자 공개개</div><span className="date">2025.04.07</span></li>
          <li className="notice-item"><div className="title"><span className="bullet"></span>[언어교육] 동서울대학교 언어교육 </div><span className="date">2025.05.03</span></li>
          <li className="notice-item"><div className="title"><span className="bullet"></span>[동서울대학교] 2025년도 중간고사 성적 공지지</div><span className="date">2025.04.05</span></li>
          <li className="notice-item"><div className="title"><span className="bullet"></span>[동서울대학교]2025 겨울방학 동서울울 글쓰기 지도 프로그램 신청</div><span className="date">2025.04.25</span></li>
          <li className="notice-item"><div className="title"><span className="bullet"></span>[동서울]2025년 겨울방학 글쓰기 능력 향상 프로그램 신청안내</div><span className="date">2025.03.05</span></li>
        </ul>
      </div>

      {/* 퀵메뉴 */}
      <div className="card">
        <div className="Quickmenu">
          <h3>Quick menu</h3>
          <div className="quick-links">
            <ul className="left-column">
              <li>강의 시간표</li><li>학점취득현황</li><li>나의 E-class</li><li>학사일정</li>
              <li>장학정보조회</li><li>상담내역조회</li><li>학적변동정보</li><li>채용정보</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 강의 시간표 */}
      <div className="card">
        <div className="schedule-header">
          <span className="title">강의시간표</span>
          <button className="refresh-btn">🔄</button>
        </div>
        <div className="schedule-date-nav">
          <button id="prev-day">◀</button>
          <span id="current-date">2025.05.04(일)</span>
          <button id="next-day">▶</button>
        </div>
        <div className="schedule-container">
          <div className="schedule-slide-track" id="slide-track">
            <div className="schedule-content" id="schedule-content">데이터가 없습니다.</div>
          </div>
        </div>
      </div>

      {/* 바로가기 카드 */}
      <div className="card">
        <div className="card5">
          <span className="session">
            <img src="/assest/img/휴학신청.png"/>
            <img src="/assest/img/계절학기 등록납부.png"/>
            <img src="/assest/img/성적조회.png"/>
            <p>휴학 및 복학 신청</p><p>수강신청</p><p>성적조회</p>
          </span>
          <span className="session">
            <img src="/assest/img/강의평가.png"/>
            <img src="/assest/img/강의평가.png"/>
            <img src="/assest/img/강의평가.png"/>
            <p>강의평가</p><p>출석조회</p><p>시간표 조회</p>
          </span>
        </div>
      </div>

      {/* 뉴스 */}
      <div className="card">
        <div className="tab-container3">
          <nav className="tabs3">
            <a className="tab active3">동서울대학교뉴스</a>
            <a className="tab3">동서울 신문</a>
          </nav>
          <div className="add-btn3">＋</div>
        </div>
        <ul className="news-list">
          <li className="news-item"><div className="title"><span className="bullet3"></span>[동동자료료]2025학년도 1학기 동서울대⋯</div></li>
          <li className="news-item"><div className="title"><span className="bullet3"></span>[동동자료]제63회 장학금 수기 공모전 ⋯</div></li>
          <li className="news-item"><div className="title"><span className="bullet3"></span>[동동자료]2025년 1학기 ‘동동서울대학교 ⋯</div></li>
          <li className="news-item"><div className="title"><span className="bullet3"></span>[뉴스]20년 연속 동서울대학교 수상상</div></li>
          <li className="news-item"><div className="title"><span className="bullet3"></span>[뉴스]동서울대학교 운동장 잔디 모두 교체체</div></li>
          <li className="news-item"><div className="title"><span className="bullet3"></span>[동동자료]동서울대햑교...</div></li>
          <li className="news-item"><div className="title"><span className="bullet3"></span>[동동자료]동서울대학교 모두가 원하는...</div></li>
        </ul>
      </div>

      {/* 달력 */}
      <div className="card">
        <div className="calendar-container">
          <div className="calendar-header">
            <button id="prevMonth">◀</button>
            <h1 id="monthYear"></h1>
            <button id="nextMonth">▶</button>
          </div>
          <div className="calendar-grid" id="calendarGrid"></div>
        </div>
      </div>

      {/* 커뮤니티 / 공고 */}
      <div className="card">
        <div className="tab-container2">
          <nav className="tabs2">
            <a className="tab active2">커뮤니티</a>
          </nav>
          <div className="add-btn2">＋</div>
        </div>
        <div className="event-main">
          <div className="event-info">
            <div className="event-title">컴퓨터소프트웨어 학과 게시판</div>
            <ul className="news-list">
              <li className="news-item"><div className="title"><span className="bullet3"></span>님들 이거 실화임?</div></li>
              <li className="news-item"><div className="title"><span className="bullet3"></span>저랑 같이 학식 먹으실분 구함</div></li>
              <li className="news-item"><div className="title"><span className="bullet3"></span>금요일 오전 수업 과제 양식 아시는 분 없나요?</div></li>
              <li className="news-item"><div className="title"><span className="bullet3"></span>우리 내일 수업 있나요?</div></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="announcementArea">
          <div><h1>공고 1</h1></div>
          <div><h1>공고 2</h1></div>
        </div>
      </div>

      {/* ✅ Messenger 모달 */}
      {showMessenger && (
        <div className="messenger-overlay" onClick={() => setShowMessenger(false)}>
          <div
            className="messenger-modal"
            onClick={(e) => e.stopPropagation()} // 오버레이 클릭 닫기와 충돌 방지
          >
            <button
              className="close-btn"
              onClick={() => setShowMessenger(false)}
              aria-label="닫기"
              title="닫기"
            >
              ✖
            </button>
            <Messenger />
          </div>
        </div>
      )}
    </>
  );
}


