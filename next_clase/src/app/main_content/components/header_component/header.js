// app/components/header.js
"use client";

import { useEffect, useState } from "react";

export default function Header() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const res = await fetch("/api/univer_city/user_route", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!cancelled && res.ok) {
          setLoggedIn(true);
        } else if (!cancelled) {
          setLoggedIn(false);
        }
      } catch (e) {
        if (!cancelled) {
          setLoggedIn(false);
        }
      }
    }

    checkSession();
    return () => {
      cancelled = true;
    };
  }, []);

  // ✅ 로그아웃 클릭 시 logout_route 호출 + 메인으로 이동
  async function handleLogout() {
    try {
      const res = await fetch("http://localhost:3000/main_content/components/header_component/header_route/logout_route", {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        setLoggedIn(false);
        // 🔹 세션 삭제 성공 후 메인 페이지로 이동
        window.location.href = "http://localhost:3000/";
      } else {
        console.error("로그아웃 실패:", await res.text());
      }
    } catch (e) {
      console.error("로그아웃 에러:", e);
    }
  }

  return (
    <div className="appHeader greenLayout">
      <div className="top-bar">
        <a href="/profile">마이페이지</a>

        {loggedIn ? (
          <button type="button" onClick={handleLogout}>
            로그아웃
          </button>
        ) : (
          <a href="/login">로그인</a>
        )}

        <a href="/help">도움말</a>
      </div>

      <div className="navbar">
        <div className="logo">
          <img src="/assest/img/다운로드(1).png" alt="로고" />
          <a className="logo-link" href="/main_content">
            동서울대학교
          </a>
        </div>

        <div className="menu-center-container">
          <nav className="menu">
            <a href="/main_content/Integrated">통합메뉴</a>
            <a href="https://ebook.du.ac.kr/FxLibrary/">도서관</a>
            <a href="/main_content/Integrated/timetable">시간표</a>
            <a href="/messenger">메신저</a>
          </nav>
        </div>

        <button className="search-icon" aria-label="검색">
          <svg viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27a6.471 6.471 0 0 0 1.57-4.23A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L20 21.5 21.5 20 15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
