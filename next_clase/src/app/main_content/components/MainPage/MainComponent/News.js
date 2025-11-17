// app/components/MainComponent/news.js
"use client";

export default function News() {
  return (
    <div className="card">
      <div className="tab-container3">
        <nav className="tabs3">
          <a className="tab active3">동서울대학교뉴스</a>
          <a className="tab3">동서울 신문</a>
        </nav>
        <div className="add-btn3">＋</div>
      </div>

      <ul className="news-list">
        <li className="news-item">
          <div className="title">
            <span className="bullet3"></span>[동동자료료]2025학년도 1학기 동서울대⋯
          </div>
        </li>
        <li className="news-item">
          <div className="title">
            <span className="bullet3"></span>[동동자료]제63회 장학금 수기 공모전 ⋯
          </div>
        </li>
        <li className="news-item">
          <div className="title">
            <span className="bullet3"></span>[동동자료]2025년 1학기 ‘동동서울대학교 ⋯
          </div>
        </li>
        <li className="news-item">
          <div className="title">
            <span className="bullet3"></span>[뉴스]20년 연속 동서울대학교 수상상
          </div>
        </li>
        <li className="news-item">
          <div className="title">
            <span className="bullet3"></span>[뉴스]동서울대학교 운동장 잔디 모두 교체체
          </div>
        </li>
        <li className="news-item">
          <div className="title">
            <span className="bullet3"></span>[동동자료]동서울대햑교...
          </div>
        </li>
        <li className="news-item">
          <div className="title">
            <span className="bullet3"></span>[동동자료]동서울대학교 모두가 원하는...
          </div>
        </li>
      </ul>
    </div>
  );
}
