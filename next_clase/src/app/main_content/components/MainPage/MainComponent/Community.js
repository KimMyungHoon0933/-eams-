// app/components/MainComponent/community.js
"use client";

export default function Community() {
  return (
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
            <li className="news-item">
              <div className="title"><span className="bullet3"></span>님들 이거 실화임?</div>
            </li>
            <li className="news-item">
              <div className="title"><span className="bullet3"></span>저랑 같이 학식 먹으실분 구함</div>
            </li>
            <li className="news-item">
              <div className="title"><span className="bullet3"></span>금요일 오전 수업 과제 양식 아시는 분 없나요?</div>
            </li>
            <li className="news-item">
              <div className="title"><span className="bullet3"></span>우리 내일 수업 있나요?</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
