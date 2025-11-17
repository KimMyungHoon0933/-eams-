// app/components/MainComponent/announcement.js
"use client";

export default function Announcement() {
  return (
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
        <li className="notice-item">
          <div className="title"><span className="bullet"></span>2025학년도 1학기 동서울대학교교장학금 신청 안내</div>
          <span className="date">2025.05.04</span>
        </li>
        <li className="notice-item">
          <div className="title"><span className="bullet"></span>[학생장학금]2025학년도 1학기 동서울아카데미</div>
          <span className="date">2025.05.04</span>
        </li>
        <li className="notice-item">
          <div className="title"><span className="bullet"></span>[장학]국가장학금 선발자 공개개</div>
          <span className="date">2025.04.07</span>
        </li>
        <li className="notice-item">
          <div className="title"><span className="bullet"></span>[언어교육] 동서울대학교 언어교육 </div>
          <span className="date">2025.05.03</span>
        </li>
        <li className="notice-item">
          <div className="title"><span className="bullet"></span>[동서울대학교] 2025년도 중간고사 성적 공지지</div>
          <span className="date">2025.04.05</span>
        </li>
        <li className="notice-item">
          <div className="title"><span className="bullet"></span>[동서울대학교]2025 겨울방학 동서울울 글쓰기 지도 프로그램 신청</div>
          <span className="date">2025.04.25</span>
        </li>
        <li className="notice-item">
          <div className="title"><span className="bullet"></span>[동서울]2025년 겨울방학 글쓰기 능력 향상 프로그램 신청안내</div>
          <span className="date">2025.03.05</span>
        </li>
      </ul>
    </div>
  );
}
