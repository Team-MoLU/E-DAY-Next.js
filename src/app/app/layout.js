"use client";
import Link from "next/link";
import { Provider } from "react-redux";
import store from "../../redux/store";

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
      </div>
      <Provider store={store}>
        <div className="main-content">{children}</div>
      </Provider>
    </>
  );
}
