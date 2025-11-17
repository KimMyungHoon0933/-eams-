// app/components/profile.js
"use client";
import { useEffect, useRef, useState } from "react";
import "./MainComponent_css/profile.css";

/**
 * user_type → role(한글) 매핑
 */
function mapRoleFromUserType(userType) {
  if (!userType) return "-";
  const t = String(userType).trim().toLowerCase();
  if (t === "employee") return "직원";
  if (t === "teaching_assistant") return "조교";
  if (t === "student") return "학생";
  if (t === "professor") return "교수";
  return "-";
}

export default function LoginBox({
  data,
  loading = false,
  fetchError = null,
  userType = null,
  role = undefined,
  unread = 1,
  lastLoginTime,
  lastLoginIp = "***.***.***.***",
  onOpenMessenger,
  showDetails = false,
}) {
  const v = (x) =>
    x === null || x === undefined || x === "" ? "-" : String(x);
  const userName = data?.user_name ?? "-";
  const roleLabel = role ?? mapRoleFromUserType(userType);

  // 🔹 프로필 박스 높이에 따라 폰트 크게/작게
  const boxRef = useRef(null);
  const [largeFont, setLargeFont] = useState(false);

  useEffect(() => {
    if (!boxRef.current) return;

    const handleResize = () => {
      const h = boxRef.current?.offsetHeight ?? 0;
      // 높이 기준은 상황에 맞게 조절 가능 (지금은 260px 이상이면 크게)
      setLargeFont(h > 260);
    };

    handleResize();

    const observer = new ResizeObserver(handleResize);
    observer.observe(boxRef.current);

    window.addEventListener("resize", handleResize);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      ref={boxRef}
      className={`login-box ${largeFont ? "login-box--large" : ""}`}
      style={{
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        gap: "8px",
      }}
    >
      {loading && <div>사용자 정보를 불러오는 중...</div>}
      {!loading && fetchError && (
        <div style={{ color: "crimson" }}>
          {fetchError === "NO_SID_COOKIE" || fetchError === "HTTP_401"
            ? "로그인이 필요합니다."
            : `사용자 정보를 불러오지 못했습니다: ${fetchError}`}
        </div>
      )}

      {/* 2. 이름 + 신분 */}
      <div className="user">
        <span className="user-name">{userName} 님</span>
        <span className="user-role">{roleLabel}</span>
      </div>

      {/* 3. (선택) 상세 정보 */}
      {showDetails && data && (
        <div className="profile-details" style={{ lineHeight: 1.7 }}>
          <div>
            <b>학번/사번</b>: {v(data.user_id)}
          </div>
          <div>
            <b>소속(부서)</b>: {v(data.department_id)}
          </div>
          <div>
            <b>생년월일</b>: {v(data.birth_date)}
          </div>
          <div>
            <b>성별</b>: {v(data.gender)}
          </div>
          <div>
            <b>연락처</b>: {v(data.phone)}</div>
          <div>
            <b>주소</b>: {v(data.address)}</div>
          <div>
            <b>계좌번호</b>: {v(data.account_number)}</div>
        </div>
      )}

      {/* 4. 버튼 그룹 */}
      <div className="btn-group">
        <div className="btn">개인정보변경</div>
        <div className="btn">비밀번호 변경</div>
        <div className="btn">출석 조회</div>
      </div>

      {/* 5. 최종 로그인 정보 */}
      <div>
        <div>최종 로그인</div>
        <div className="info login-info">
          <div>▶ 시간: {v(lastLoginTime)}</div>
          <div style={{ marginTop: "2px" }}>
            ▶ 접속IP: {lastLoginIp}
          </div>
        </div>
      </div>

      {/* 6. 셀렉트 박스들 */}
      <div>
        <div className="select-box">
          <select className="readonly-select">
            <option>신분: {roleLabel}</option>
          </select>
        </div>

        <div className="select-box" style={{ marginTop: 8 }}>
          <select>
            <option>나의 관련사이트</option>
          </select>
        </div>
      </div>
    </div>
  );
}
