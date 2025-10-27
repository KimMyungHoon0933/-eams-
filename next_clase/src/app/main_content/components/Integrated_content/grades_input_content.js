// src/app/components/Integrated_content/grades_input_content.js
'use client';

export function GradesInputContent() {
  return (
    <>
      {/* ===== 상단 바 ===== */}
      <header className="topbar">
        <div className="crumbs">HOME / 성적 관리</div>
        <div className="todayDate">2025년 9월 29일</div>
      </header>

      <main className="main">
        {/* ===== 페이지 제목 ===== */}
        <div className="titleRow">
          <h1 className="title">성적 입력</h1>
          <select className="classSelect">
            <option>3학년 1반</option>
            <option>3학년 2반</option>
          </select>
        </div>

        {/* ===== 본문 그리드 ===== */}
        <div className="grid">
          {/* --- 1. 왼쪽 도구 컬럼 --- */}
          <aside className="toolCol">
            <div className="card">
              <h3>도구</h3>
              <div className="field">
                <span>날짜 선택</span>
                <input type="date" defaultValue="2025-09-29" />
              </div>
              <button className="btn">조회</button>
            </div>
          </aside>

          {/* --- 2. 중앙 성적표 영역 --- */}
          <section className="centerArea">
            <div className="tableHead">
              <h3>과목별 성적 입력</h3>
              <button className="btn primary">일괄 저장</button>
            </div>
            <div className="tableWrap">
              <table className="gradeTable">
                <thead>
                  <tr>
                    <th>과목</th>
                    <th>시험 구분</th>
                    <th>점수</th>
                    <th>등급</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="left">
                      국어
                      <div className="sub">담당: 김민준</div>
                    </td>
                    <td><select><option>중간고사</option><option>기말고사</option></select></td>
                    <td><input type="number" defaultValue="95" /></td>
                    <td><output>1등급</output></td>
                  </tr>
                  <tr>
                    <td className="left">
                      수학
                      <div className="sub">담당: 이서연</div>
                    </td>
                    <td><select><option>중간고사</option><option>기말고사</option></select></td>
                    <td><input type="number" defaultValue="88" /></td>
                    <td><output>2등급</output></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* --- 3. 우측 학생 정보 컬럼 --- */}
          <aside className="infoCol">
            <div className="card">
              <h3>학생 정보</h3>
              <div className="profile">
                <div className="avatar">😊</div>
                <div className="who">
                  <div className="name">홍길동</div>
                  <div className="meta">3학년 1반 15번</div>
                </div>
              </div>
              <div className="desc">
                <div><dt>연락처</dt><dd>010-1234-5678</dd></div>
                <div><dt>이메일</dt><dd>gildong@example.com</dd></div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* ===== 하단 바 ===== */}
      <footer className="bottomBar">
        <span className="muted">수정 중인 내용이 있습니다.</span>
        <div className="rightRow">
          <button className="btn ghost">초기화</button>
          <button className="btn primary">저장하기</button>
        </div>
      </footer>
    </>
  );
}