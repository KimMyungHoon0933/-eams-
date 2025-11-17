"use client";

import React from "react";
// ⚠️ 이 CSS는 전역 규칙(body 등)을 포함하므로 페이지/레이아웃에서 한 번만 import 하세요.
import "./login_css/login_style.css"; // 경로는 프로젝트에 맞게

export function LoginForm() {
  return (
    // 메모1 구조를 그대로 사용해 동일한 룩앤필 적용
    <div style={{
      minHeight: "100dvh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(180deg, #f7f9fc 0%, #eef4ea 100%)"
    }}>
      <div className="login-box">
        <h1>동서울대학교</h1>
        <p className="subtitle">학사관리시스템 로그인</p>

        {/* ✅ GET /login_form/login_check 로 id/pw 그대로 전송 */}
        <form id="loginForm" action="/login_form/login_check" method="POST">
          <input
            type="text"
            id="userId"
            name="id"
            placeholder="아이디"
            required
            autoComplete="username"
          />
          <input
            type="password"
            id="userPw"
            name="pw"
            placeholder="비밀번호"
            required
            autoComplete="current-password"
          />
          <button type="submit">로그인</button>
        </form>

        <div className="links">
          <a href="#">아이디 찾기</a>
          <a href="#">비밀번호 찾기</a>
        </div>
      </div>
    </div>
  );
}
