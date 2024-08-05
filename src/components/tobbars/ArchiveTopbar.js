"use client";
import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setMenu, setSearchStringArchive } from "@/redux/reducers/menuSlice";
import { toggleSidebar, setSidebarContent } from "@/redux/reducers/uiSlice";
import { useRouter } from "next/navigation";
import common from "@/lib/common/common_fn";
import {
  getTaskByPath,
  setSelectedArchiveTask,
} from "@/redux/reducers/taskSlice";

export const ArchiveTopbar = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const data = useSelector((state) => state.tasks.archive);
  const activeContent = useSelector((state) => state.menu.activeContent);
  const selectedArchive = useSelector((state) => state.tasks.selectedArchive);
  const {
    isOpen: sidebarIsOpen,
    activeContent: sidebarActiveContent,
    width: sidebarWidth,
  } = useSelector((state) => state.ui.sidebar);
  const searchStringArchive = useSelector(
    (state) => state.menu.searchStringArchive
  );
  const [isSearching, setIsSearching] = useState(false);

  const handleSidebarButtonClick = () => {
    dispatch(setSidebarContent("explore"));
    dispatch(toggleSidebar());
  };

  const [route, setRoute] = useState(
    selectedArchive === null
      ? [{ id: "archive", name: "archive" }]
      : common.findRouteById(selectedArchive.id, data)
  );

  // data 변경 시,
  useEffect(() => {
    const currentTaskId =
      selectedArchive === null ? "archive" : selectedArchive.id;
    // route update
    const newRoute = common.findRouteById(currentTaskId, data);
    setRoute(newRoute);
  }, [data]);

  // selectedArchive 변경 시,
  useEffect(() => {
    const currentTaskId =
      selectedArchive === null ? "archive" : selectedArchive.id;
    // route update
    const newRoute = common.findRouteById(currentTaskId, data);
    setRoute(newRoute);

    // 이동하면 search 끄기
    setIsSearching(false);
  }, [selectedArchive]);

  const handleRouteClick = (id) => {
    const newPath = common.findNodePathById(id, data);
    const updatedCurrentTask = getTaskByPath(data, newPath);

    dispatch(setSelectedArchiveTask({ ...updatedCurrentTask, path: newPath }));
  };

  const toggleSearching = () => {
    setIsSearching(!isSearching);
    dispatch(setSearchStringArchive(""));
  };

  return (
    <div>
      <>
        {/* 검색 토글 버튼 */}
        <span onClick={toggleSearching}>검색</span>
        {isSearching && (
          <input
            type="text"
            name="search"
            className="w-full p-2 rounded"
            value={searchStringArchive}
            onChange={(e) => dispatch(setSearchStringArchive(e.target.value))}
            placeholder={
              selectedArchive === null
                ? "archive 검색"
                : selectedArchive.name + " 검색"
            }
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
