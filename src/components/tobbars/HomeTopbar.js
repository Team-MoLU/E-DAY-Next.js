"use client";
import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setMenu, setSearchString } from "@/redux/reducers/menuSlice";
import { toggleSidebar, setSidebarContent } from "@/redux/reducers/uiSlice";
import { useRouter } from "next/navigation";
import common from "@/lib/common/common_fn";
import styles from "./Topbar.module.css";
import Icon from "@/components/Icon";
import { getTaskByPath, setSelectedTask } from "@/redux/reducers/taskSlice";

export const HomeTopbar = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const data = useSelector((state) => state.tasks.root);
  const activeContent = useSelector((state) => state.menu.activeContent);
  const selectedTask = useSelector((state) => state.tasks.selectedTask);
  const {
    isOpen: sidebarIsOpen,
    activeContent: sidebarActiveContent,
    width: sidebarWidth,
  } = useSelector((state) => state.ui.sidebar);
  const searchString = useSelector((state) => state.menu.searchString);
  const [isSearching, setIsSearching] = useState(false);

  const handleSidebarButtonClick = () => {
    dispatch(setSidebarContent("explore"));
    dispatch(toggleSidebar());
  };

  const handleListviewButtonClick = () => {
    if (activeContent == "home") {
      // list-view 로 이동
      router.push(`/app/task`);
    } else if (activeContent == "list-view") {
      // home 으로 이동
      router.push(`/app`);
    }
  };

  const handleTreeviewButtonClick = () => {
    // tree-view 로 이동
    router.push(`/app/tree-view`);
  };

  const [route, setRoute] = useState(
    selectedTask === null
      ? [{ id: "root", name: "root" }]
      : common.findRouteById(selectedTask.id, data)
  );

  // data 변경 시,
  useEffect(() => {
    const currentTaskId = selectedTask === null ? "root" : selectedTask.id;
    // route update
    const newRoute = common.findRouteById(currentTaskId, data);
    setRoute(newRoute);
  }, [selectedTask, data]);

  // selectedTask 변경 시,
  useEffect(() => {
    const currentTaskId = selectedTask === null ? "root" : selectedTask.id;
    // route update
    const newRoute = common.findRouteById(currentTaskId, data);
    setRoute(newRoute);

    // 이동하면 search 끄기
    setIsSearching(false);
  }, [selectedTask, data]);

  const handleRouteClick = (id) => {
    const newPath = common.findNodePathById(id, data);
    const updatedCurrentTask = getTaskByPath(data, newPath);

    dispatch(setSelectedTask({ ...updatedCurrentTask, path: newPath }));
  };

  const toggleSearching = () => {
    setIsSearching(!isSearching);
  };

  return (
    <div
      className={styles.topbar}
      style={{
        width: sidebarIsOpen ? `calc(100% - ${sidebarWidth}px)` : "100%",
      }}
    >
      {activeContent === "home" && (
        <div className={styles.leftItems}>
          <div className={styles.icon}>
            <Icon name="home" size={24} />
          </div>
          <h1 className={styles.text}>오늘 할 일</h1>
        </div>
      )}
      {activeContent === "list-view" && (
        <>
          {/* 검색 토글 버튼 */}
          <div className={styles.leftSearchItems}>
            <div className={styles.searchIcon}>
              <button className={styles.button} onClick={toggleSearching}>
                <Icon name="search" size={24} />
              </button>
            </div>
            {isSearching && (
              <input
                type="text"
                name="search"
                className={styles.searchSection}
                value={searchString}
                onChange={(e) => dispatch(setSearchString(e.target.value))}
                placeholder={selectedTask.name + " 검색"}
              />
            )}
            {/* 경로 */}
            {!isSearching && (
              <div>
                {route.map((r, index) => (
                  <span className={styles.text} key={"r" + index}>
                    {index == 0 ? "" : " / "}
                    <span
                      className={styles.routeText}
                      onClick={() => handleRouteClick(r.id)}
                    >
                      {index == 0 ? "할 일" : r.name}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </>
      )}
      <div className={styles.rightItems}>
        <div className={styles.buttonWrapper}>
          <button className={styles.button} onClick={handleTreeviewButtonClick}>
            <Icon name="treeview" size={24} />
          </button>
          <span className={styles.hintText}>트리뷰</span>
        </div>
        {/* activeContent === "list-view"이면, button 배경 다르게 */}
        <div className={styles.buttonWrapper}>
          <button
            className={`${styles.toggleButton} ${
              activeContent == "list-view" ? styles.active : ""
            }`}
            onClick={handleListviewButtonClick}
          >
            <Icon name="list" size={24} />
          </button>
          <span className={styles.hintText}>
            {activeContent === "list-view" ? "오늘 할 일" : "리스트 뷰"}
          </span>
        </div>
        <div className={styles.buttonWrapper}>
          <button
            className={`${styles.toggleButton} ${
              sidebarIsOpen === true ? styles.active : ""
            }`}
            onClick={handleSidebarButtonClick}
          >
            <Icon name="sidebar" size={24} />
          </button>
          <span className={styles.hintText}>탐색</span>
        </div>
      </div>
    </div>
  );
};
