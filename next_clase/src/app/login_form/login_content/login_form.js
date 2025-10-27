// app/components/Integrated_content/login_content.js
"use client";
import "./login_css/login_style.css"
import { useState } from "react";
import { useRouter } from "next/navigation";

/** ===============================
 *  학사관리시스템 로그인 (memo1.html → React)
 *  - 로직/마크업은 memo1.html을 유지
 *  - 스타일 클래스명도 그대로 유지
 *  - 페이지/레이아웃에서 CSS만 임포트해 주면 됨
 *  =============================== */
export function LoginForm() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [userPw, setUserPw] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();

    const id = userId.trim();
    const pw = userPw.trim();

    if (!id || !pw) {
      alert("아이디와 비밀번호를 모두 입력하세요.");
      return;
    }

    // 서버 연결 전 임시 로그인 처리 (원문 로직 유지)
    if (id === "2306007" && pw === "1234") {
      alert("로그인 성공! 성적 관리 페이지로 이동합니다.");
      // memo1.html: window.location.href = 'grades-output.html'
      // Next.js 라우팅으로 대체(원하는 경로로 바꿔도 됨)
      router.push("/grades-output"); 
    } else {
      alert("아이디 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  return (
    <div className="login-page-wrap">
      <div className="login-box">
        <h1>동서울대학교</h1>
        <p className="subtitle">학사관리시스템 로그인</p>

        <form id="loginForm" onSubmit={onSubmit}>
          <input
            type="text"
            id="userId"
            placeholder="아이디"
            required
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <input
            type="password"
            id="userPw"
            placeholder="비밀번호"
            required
            value={userPw}
            onChange={(e) => setUserPw(e.target.value)}
          />
          <button type="submit">로그인</button>
        </form>

        <div className="links">
          <a href="#">아이디 찾기</a>
          <a href="#">비밀번호 찾기</a>
        </div>
      </div>

      <footer>ⓒ 2025 동서울대학교 Academic Management System</footer>
    </div>
  );
}
