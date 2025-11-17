// app/page.js
// 어떤 방식으로 내보냈든 일단 전부 가져온다
import * as MC from "./components/MainPage/MainContent"; 
// 경로가 폴더라면 index.* 를 확실히 가리켜보고 싶으면 아래 주석 해제
// import * as MC from "./components/MainPage/MainContent/index";
// 확실히 확장자까지 적고 싶으면 아래 주석 해제 (프로젝트 상황에 맞춰 하나만 사용)
// import * as MC from "./components/MainPage/MainContent.jsx";

const ResolvedMainContent = MC.default ?? MC.MainContent;

export default function Page() {
  // 타입 검증: 함수(컴포넌트) 아니면 친절한 오류 UI로
  if (typeof ResolvedMainContent !== "function") {
    // 콘솔에 무엇이 들어왔는지 출력해서 바로 원인 찾기
    console.error("[MainContent import 문제] 가져온 모듈:", MC);
    return (
      <main className="content" style={{ padding: 24 }}>
        <h2>컴포넌트를 불러오지 못했습니다.</h2>
        <p style={{ whiteSpace: "pre-wrap" }}>
          import 결과가 함수가 아닙니다. (type: {typeof ResolvedMainContent}){"\n"}
          - default 또는 named export가 올바른지 확인하세요.{"\n"}
          - 파일/폴더 경로가 맞는지 확인하세요.{"\n"}
          - 콘솔에 모듈 덤프를 찍어두었으니(개발자도구) 무엇이 export됐는지 바로 확인 가능합니다.
        </p>
      </main>
    );
  }

  return (
    <main className="content">
      <ResolvedMainContent />
    </main>
  );
}
