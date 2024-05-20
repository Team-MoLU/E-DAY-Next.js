import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "E-day",
  description:
    "성장하는 나를 위한 할 일 관리 Cross Platform, Planner 어플리케이션",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="sidebar">
          <h1>E-day</h1>
          <Link href="/">홈</Link>
          <Link href="/tree-view">트리뷰</Link>
          <Link href="/calendar">캘린더</Link>
          <Link href="/retrospect">회고록</Link>
          <Link href="/achievement">달성도</Link>
          <Link href="/archive">아카이브</Link>

          <Link href="/login">login</Link>
          <Link href="/api-test">api test</Link>
        </div>
        <div className="main-content">{children}</div>
      </body>
    </html>
  );
}
