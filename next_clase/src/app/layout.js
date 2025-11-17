// app/layout.js
import "./globals.css";
import "./globals.css";




export const metadata = {
  title: "학사 포털",
  description: "동서울대학교 통합정보 포털",
};

export default function RootLayout({ children }) {
  return (
    <html >
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/assest/css/seoulUniversity_Copy.css" />
        <link rel="stylesheet" href="/assest/css/seoulUniverContent.css" />
        <link rel="stylesheet" href="/assest/css/notice.css" />
        <link rel="stylesheet" href="/assest/css/DsuNews.css" />
        <link rel="stylesheet" href="/assest/css/Quickmenu.css" />
        <link rel="stylesheet" href="/assest/css/timetable.css" />
        <link rel="stylesheet" href="/assest/css/herder.css" />


      </head>
      <body>
        {/* ✅ 전역에서 main으로 감싸지 않음 */}
        {children}
      </body>
    </html>
  );
}
