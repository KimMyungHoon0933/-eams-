// components/Header.js
export default function Header() {
  return (
    <div className="greenLayout">
      <div className="top-bar">
        <a href="#">로그아웃</a>
        <a href="#">마이페이지</a>
        <a href="#">학교홈페이지</a>
      </div>

      <div className="navbar">
        <div className="logo">
          <img src="/assest/img/다운로드 (1).png" alt="로고" />
          동서울대학교
        </div>

        <div className="menu-center-container">
          <div className="menu">
            <a href="/main_content//Integrated">통합정보</a>
            <a href="#">커뮤니티</a>
            <a href="#">일정</a>
            <a href="#">도서관</a>
          </div>
        </div>

        <button className="search-icon" title="검색" aria-label="검색">
          <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2" fill="none" />
            <line x1="17" y1="17" x2="21" y2="21" stroke="white" strokeWidth="2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
