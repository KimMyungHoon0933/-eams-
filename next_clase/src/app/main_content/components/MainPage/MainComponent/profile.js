// app/components/profile.js
"use client";

/**
 * user_type → role(한글) 매핑
 * - employee            → 직원
 * - teaching_assistant  → 조교
 * - student             → 학생
 * - professor/Professor → 교수
 * - 그 외/없음           → "-"
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

// 이름만 기본 출력, 상세는 옵션(showDetails)로 제어
export default function LoginBox({
  data,                 // MainContent에서 전처리된 객체
  loading = false,
  fetchError = null,
  userType = null,      // ✅ 1번에서 넘겨주는 user_type 값을 받음
  // role prop은 더 이상 필요 없지만, 하위호환을 위해 남겨두고 fallback로만 사용
  role = undefined,
  unread = 1,
  lastLoginTime,
  lastLoginIp = "***.***.***.***",
  onOpenMessenger,
  showDetails = false,  // 기본 false → 상세 숨김
}) {
  const v = (x) => (x === null || x === undefined || x === "" ? "-" : String(x));
  const userName = data?.user_name ?? "-";

  // ✅ user_type 우선 매핑, role prop은 없을 때만 보조로 사용
  const roleLabel = role ?? mapRoleFromUserType(userType);

  return (
    <div className="login-box">
      {loading && <div style={{ marginBottom: 8 }}>사용자 정보를 불러오는 중...</div>}
      {!loading && fetchError && (
        <div style={{ marginBottom: 8, color: "crimson" }}>
          {fetchError === "NO_SID_COOKIE" || fetchError === "HTTP_401"
            ? "로그인이 필요합니다."
            : `사용자 정보를 불러오지 못했습니다: ${fetchError}`}
        </div>
      )}

      {/* 상단: 이름 + role */}
      <div className="user">
        <span className="user-name">{userName} 님</span>
        <span className="user-role">{roleLabel}</span>
      </div>

      {/* ✅ 상세는 기본 숨김, 필요할 때만 표시 */}
      {showDetails && data && (
        <div className="profile-details" style={{ marginTop: 12, lineHeight: 1.7 }}>
          <div><b>학번/사번</b>: {v(data.user_id)}</div>
          <div><b>소속(부서)</b>: {v(data.department_id)}</div>
          <div><b>생년월일</b>: {v(data.birth_date)}</div>
          <div><b>성별</b>: {v(data.gender)}</div>
          <div><b>연락처</b>: {v(data.phone)}</div>
          <div><b>주소</b>: {v(data.address)}</div>
          <div><b>계좌번호</b>: {v(data.account_number)}</div>
        </div>
      )}

      <div className="btn-group" style={{ marginTop: 12 }}>
        <div className="btn">개인정보변경</div>
        <div className="btn">비밀번호 변경</div>
        <div className="btn">채팅방 설정</div>
      </div>

      <div className="mail-box">
        <p>안읽은 메시지</p>
        <div><span style={{ color: "red" }}>{unread}</span> 건</div>
        <button className="mail-btn" onClick={onOpenMessenger} disabled={!!fetchError}>
          메시지 조회
        </button>
      </div>

      <div>최종 로그인</div>
      <div className="info">
        ▶ 시간: {v(lastLoginTime)}<br />
        ▶ 접속IP: {lastLoginIp}
      </div>

      <div className="select-box">
        <select>
          <option>신분: {roleLabel}</option>
        </select>
      </div>
      <div className="select-box">
        <select>
          <option>나의 관련사이트</option>
        </select>
      </div>
    </div>
  );
}
