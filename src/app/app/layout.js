import Link from "next/link";

export default function AppLayout({ children }) {
  return (
    <>
      <div className="sidebar">
        <h1>E-day</h1>
        <Link href="/app">홈</Link>
        <Link href="/app/tree-view">트리뷰</Link>
        <Link href="/app/calendar">캘린더</Link>
        <Link href="/app/retrospect">회고록</Link>
        <Link href="/app/achievement">달성도</Link>
        <Link href="/app/archive">아카이브</Link>
        <Link href="/app/task">task</Link>
      </div>
      <div className="main-content">{children}</div>
    </>
  );
}
