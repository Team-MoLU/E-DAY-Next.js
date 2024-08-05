"use client";
import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setMenu, setSearchString } from "@/redux/reducers/menuSlice";
import { toggleSidebar, setSidebarContent } from "@/redux/reducers/uiSlice";
import { useRouter } from "next/navigation";
import common from "@/lib/common/common_fn";
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
      : common.findRouteById(selectedTask.id, data) === null
      ? [{ id: "root", name: "root" }]
      : common.findRouteById(selectedTask.id, data)
  );

  // data 변경 시,
  useEffect(() => {
    const currentTaskId = selectedTask === null ? "root" : selectedTask.id;
    // route update
    const newRoute = common.findRouteById(currentTaskId, data);
    if (newRoute === null) {
      setRoute([{ id: "root", name: "root" }]);
    } else {
      setRoute(newRoute);
    }
  }, [data]);

  // selectedTask 변경 시,
  useEffect(() => {
    const currentTaskId = selectedTask === null ? "root" : selectedTask.id;
    // route update
    const newRoute = common.findRouteById(currentTaskId, data);
    if (newRoute === null) {
      setRoute([{ id: "root", name: "root" }]);
    } else {
      setRoute(newRoute);
    }
    // 이동하면 search 끄기
    setIsSearching(false);
  }, [selectedTask]);

  const handleRouteClick = (id) => {
    const newPath = common.findNodePathById(id, data);
    const updatedCurrentTask = getTaskByPath(data, newPath);

    dispatch(setSelectedTask({ ...updatedCurrentTask, path: newPath }));
  };

  const toggleSearching = () => {
    setIsSearching(!isSearching);
    dispatch(setSearchString(""));
  };

  return (
    <div>
      {activeContent === "home" && <h1>오늘 할 일</h1>}
      {activeContent === "list-view" && (
        <>
          {/* 검색 토글 버튼 */}
          <span onClick={toggleSearching}>검색</span>
          {isSearching && (
            <input
              type="text"
              name="search"
              className="w-full p-2 rounded"
              value={searchString}
              onChange={(e) => dispatch(setSearchString(e.target.value))}
              placeholder={selectedTask.name + " 검색"}
            />
          )}
          {/* 경로 */}
          {!isSearching && (
            <div>
              <span>경로: </span>
              {route.map((r, index) => (
                <span key={"r" + index}>
                  {" / "}
                  <span
                    style={{ cursor: "pointer", color: "blue" }}
                    onClick={() => handleRouteClick(r.id)}
                  >
                    {r.name}
                  </span>
                </span>
              ))}
            </div>
          )}
        </>
      )}
      <button onClick={handleTreeviewButtonClick}>트리뷰</button>
      {/* activeContent === "list-view"이면, button 배경 다르게 */}
      <button
        onClick={handleListviewButtonClick}
        style={{
          backgroundColor:
            activeContent === "list-view" ? "lightblue" : "#007bff",
        }}
      >
        리스트뷰
      </button>
      <button
        onClick={handleSidebarButtonClick}
        style={{
          backgroundColor: sidebarIsOpen === true ? "lightblue" : "#007bff",
        }}
      >
        탐색
      </button>
    </div>
  );
};
