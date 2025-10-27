
import Header from "./components/header";


export const metadata = {
  title: "메인 콘텐츠",
};


export default function MainContentLayout({ children }) {
  return (
    <>
      <Header />                    {/* ✅ main 밖 */}
      <main className="content">    {/* ✅ 페이지당 단 하나의 main */}
        {children}
      </main>
    </>
  );
}


