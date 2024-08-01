"use client";
import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setMenu } from "@/redux/reducers/menuSlice";
import { toggleSidebar, setSidebarContent } from "@/redux/reducers/uiSlice";
import { useRouter } from "next/navigation";

export const TreeviewTopbar = () => {
  const dispatch = useDispatch();
  // todo 1: tree-view filter 상태를 redux에 저장
  const router = useRouter();

  const handleFilterButtonClick = () => {
    // todo 1: tree-view filter 상태에 toggle
  };

  const handleHomeButtonClick = () => {
    // list-view 로 이동
    router.push(`/app`);
  };

  const handleListviewButtonClick = () => {
    // list-view 로 이동
    router.push(`/app/task/`);
  };

  return (
    <div>
      <h1>트리뷰</h1>
      {/* todo 1: tree-view filter 상태에 toggle, button 배경 다르게 */}
      <button onClick={handleFilterButtonClick}>필터</button>

      <button onClick={handleHomeButtonClick}>홈</button>
      <button onClick={handleListviewButtonClick}>리스트뷰</button>
    </div>
  );
};
