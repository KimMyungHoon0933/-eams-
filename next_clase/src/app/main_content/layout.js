
import Header from "./components/header_component/header";

export const metadata = {
  title: "메인 콘텐츠",
};


export default function MainContentLayout({ children }) {
  return (
    <>


      <Header />                  

        {children}

    </>
  );
}


