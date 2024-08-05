"use client";
import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setMenu, setSearchStringTrash } from "@/redux/reducers/menuSlice";
import { toggleSidebar, setSidebarContent } from "@/redux/reducers/uiSlice";
import { useRouter } from "next/navigation";
import common from "@/lib/common/common_fn";
import {
  getTaskByPath,
  setSelectedTrashTask,
} from "@/redux/reducers/taskSlice";

export const TrashTopbar = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const data = useSelector((state) => state.tasks.trash);
  const activeContent = useSelector((state) => state.menu.activeContent);
  const selectedTrash = useSelector((state) => state.tasks.selectedTrash);
  const {
    isOpen: sidebarIsOpen,
    activeContent: sidebarActiveContent,
    width: sidebarWidth,
  } = useSelector((state) => state.ui.sidebar);
  const searchStringTrash = useSelector(
    (state) => state.menu.searchStringTrash
  );
  const [isSearching, setIsSearching] = useState(false);

  const handleSidebarButtonClick = () => {
    dispatch(setSidebarContent("explore"));
    dispatch(toggleSidebar());
  };

  const [route, setRoute] = useState(
    selectedTrash === null
      ? [{ id: "trash", name: "trash" }]
      : common.findRouteById(selectedTrash.id, data)
  );

  // data 변경 시,
  useEffect(() => {
    const currentTaskId = selectedTrash === null ? "trash" : selectedTrash.id;
    // route update
    const newRoute = common.findRouteById(currentTaskId, data);
    setRoute(newRoute);
  }, [data]);

  // selectedTrash 변경 시,
  useEffect(() => {
    const currentTaskId = selectedTrash === null ? "trash" : selectedTrash.id;
    // route update
    const newRoute = common.findRouteById(currentTaskId, data);
    setRoute(newRoute);

    // 이동하면 search 끄기
    setIsSearching(false);
  }, [selectedTrash]);

  const handleRouteClick = (id) => {
    const newPath = common.findNodePathById(id, data);
    const updatedCurrentTask = getTaskByPath(data, newPath);

    dispatch(setSelectedTrashTask({ ...updatedCurrentTask, path: newPath }));
  };

  const toggleSearching = () => {
    setIsSearching(!isSearching);
    dispatch(setSearchStringTrash(""));
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
            value={searchStringTrash}
            onChange={(e) => dispatch(setSearchStringTrash(e.target.value))}
            placeholder={
              selectedTrash === null
                ? "trash 검색"
                : selectedTrash.name + " 검색"
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
