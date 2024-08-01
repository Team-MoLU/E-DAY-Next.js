"use client";
import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setMenu } from "@/redux/reducers/menuSlice";
import { toggleSidebar, setSidebarContent } from "@/redux/reducers/uiSlice";
import { useRouter } from "next/navigation";
import styles from "./TreeviewTopbar.module.css";
import Icon from "@/components/Icon";

export const TreeviewTopbar = () => {
  const [isFilterActive, setIsFilterActive] = useState(false);

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
    <div className={styles.topbar}>
      <div className={styles.leftItems}>
        <div className={styles.icon}>
          <Icon name="treeview" size={24} />
        </div>
        <h1 className={styles.text}>트리뷰</h1>
      </div>
      <div className={styles.rightItems}>
        <div className={styles.buttonWrapper}>
          <button
            className={`${styles.toggleButton} ${
              isFilterActive ? styles.active : ""
            }`}
            onClick={handleFilterButtonClick}
          >
            <Icon name="filter" size={24} />
          </button>
          <span className={styles.hintText}>필터</span>
        </div>
        <div className={styles.buttonWrapper}>
          <button className={styles.button} onClick={handleHomeButtonClick}>
            <Icon name="home" size={24} />
          </button>
          <span className={styles.hintText}>홈</span>
        </div>
        <div className={styles.buttonWrapper}>
          <button className={styles.button} onClick={handleListviewButtonClick}>
            <Icon name="list" size={24} />
          </button>
          <span className={styles.hintText}>리스트뷰</span>
        </div>
      </div>
    </div>
  );
};
