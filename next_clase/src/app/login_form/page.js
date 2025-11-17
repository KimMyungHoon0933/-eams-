// app/Integrated/login/page.js
"use client";

import "./login_content/login_css/login_style.css"


// 🔽 여기에 전역/라우트 전용 CSS를 임포트
// memo1.html 에서 쓰던 CSS가 있다면, 이 라우트 폴더(= app/Integrated/login/)에
// login.css로 옮겨서 아래처럼 임포트하면 됨.
// (app 라우트의 page/layout 에서는 글로벌 CSS 임포트 가능)
import { LoginForm } from  "./login_content/login_form";

// 만약 기존 경로 CSS를 그대로 쓰고 싶다면(권장은 아님), 아래처럼도 가능
// import "../../../public/assest/css/Integrated_content_css/login.css";

export default function LoginPage() {
  return (




<div>
        <LoginForm />
</div>

  );
}
