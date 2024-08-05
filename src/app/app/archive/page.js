"use client";
import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteTask,
  getTaskByPath,
  setSelectedArchiveTask,
  moveTask,
  unarchiveTask,
} from "@/redux/reducers/taskSlice";
import Sidebar from "../../../components/Sidebar";
import "react-datepicker/dist/react-datepicker.css";
import { DraggableTask } from "../../../components/DraggableTask";
import { useDrop } from "react-dnd";
import { setMenu, setSearchStringArchive } from "@/redux/reducers/menuSlice";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function ArchivePage() {
  // task data 관련
  const data = useSelector((state) => state.tasks.archive);
  const selectedArchive = useSelector((state) => state.tasks.selectedArchive);
  const dispatch = useDispatch();
  const [currentTask, setCurrentTask] = useState(
    selectedArchive === null ? data : selectedArchive
  );
  const [path, setPath] = useState(
    selectedArchive === null ? [] : selectedArchive.path
  );

  // Topbar의 menu 설정
  useEffect(() => {
    dispatch(setMenu("archive"));
  }, []);

  // data 변경 시, currentTask refresh
  useEffect(() => {
    setCurrentTask(getTaskByPath(data, path));
  }, [data, path]);

  // selectedArchive 변경 시,
  useEffect(() => {
    const newPath = selectedArchive === null ? [] : selectedArchive.path;
    setPath(newPath);
  }, [selectedArchive]);

  /**
   * 현재 task를 삭제(cascade)하고, 부모 task로 이동하는 함수
   */
  const handleDeleteTask = () => {
    // currentTask를 부모 Task로 변경
    const newPath = path.slice(0, -1);
    setPath(newPath);
    const newCurrentTask = getTaskByPath(data, newPath);
    setCurrentTask(newCurrentTask);
    dispatch(setSelectedArchiveTask({ ...newCurrentTask, path: newPath }));
    // dispatch 통해서 현재 node 삭제
    dispatch(
      deleteTask({
        section: data.name,
        path: path,
      })
    );
  };

  /**
   * subtask 를 더블클릭했을 때, 해당 task의 하위로 이동하는 함수
   * @param {*} subtask
   * @param {*} subtaskPath
   */
  const handleSubtaskDoubleClick = (subtask, subtaskPath) => {
    dispatch(setSelectedArchiveTask({ ...subtask, path: subtaskPath }));
    setPath(subtaskPath);
  };

  /**
   * 현재 task를 archive에서 root 의 하위로 복구하고, 부모 task로 이동하는 함수
   */
  const handleUnarchiveTask = () => {
    // currentTask를 부모 Task로 변경
    const newPath = path.slice(0, -1);
    setPath(newPath);
    const newCurrentTask = getTaskByPath(data, newPath);
    setCurrentTask(newCurrentTask);
    dispatch(setSelectedArchiveTask({ ...newCurrentTask, path: newPath }));
    // dispatch 통해서 현재 node 삭제
    dispatch(
      unarchiveTask({
        path: path,
      })
    );
  };

  // sidebar 관련
  const {
    isOpen: sidebarIsOpen,
    activeContent: sidebarActiveContent,
    width: sidebarWidth,
  } = useSelector((state) => state.ui.sidebar);

  // Drag and Drop 관련
  const handleDropFromExplore = useCallback(
    (item) => {
      if (item.section === data.name) {
        // 경로가 동일한 경우
        if (JSON.stringify(item.path) === JSON.stringify(path)) {
          alert("현재 위치의 하위 경로로는 이동할 수 없습니다.");
          return;
        }
        // item.path가 path의 상위 경로인 경우 (path가 item.path의 하위 경로인 경우)
        if (
          path.length > item.path.length &&
          JSON.stringify(item.path) ===
            JSON.stringify(path.slice(0, item.path.length))
        ) {
          alert("현재 위치의 하위 경로로는 이동할 수 없습니다.");
          return;
        }
      }
      dispatch(
        moveTask({
          fromSection: item.section,
          fromPath: item.path,
          toSection: data.name,
          toPath: path,
        })
      );
    },
    [path, data.name]
  ); // path와 data.name을 의존성 배열에 추가

  const [, dropFromExplore] = useDrop(
    () => ({
      accept: "ExploreItem",
      drop: handleDropFromExplore,
    }),
    [handleDropFromExplore]
  ); // handleDrop을 의존성 배열에 추가

  // 검색 관련
  const searchStringArchive = useSelector(
    (state) => state.menu.searchStringArchive
  );
  const [isSearching, setIsSearching] = useState(false);
  const [searchedTaskList, setSearchedTaskList] = useState([]);

  useEffect(() => {
    if (searchStringArchive === "") {
      setIsSearching(false);
      setSearchedTaskList([]);
    } else {
      setIsSearching(true);
      const result = searchTasks(currentTask, searchStringArchive);
      setSearchedTaskList(result);
    }
  }, [searchStringArchive, currentTask]);

  // 검색어 필터링
  const matchesSearchString = (name, searchStringArchive) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "")
      .includes(searchStringArchive.toLowerCase().replace(/\s+/g, ""));
  };

  // 재귀적으로 작업 목록을 검색하는 함수
  const searchTasks = (task, searchString, currentTaskPath = [], path = []) => {
    const result = [];

    // 현재 작업이 검색 문자열을 포함하면 결과에 추가
    if (matchesSearchString(task.name, searchString)) {
      const foundTask = {
        ...task,
        path: currentTaskPath.concat(path),
      };
      result.push(foundTask);
    }

    // 자식 작업이 있으면 재귀적으로 검색
    if (task.children && task.children.length > 0) {
      task.children.forEach((child, index) => {
        result.push(
          ...searchTasks(
            child,
            searchString,
            currentTaskPath,
            path.concat(index)
          )
        );
      });
    }

    return result;
  };

  /**
   * searched task 를 더블클릭했을 때, 해당 task의 리스트뷰로 이동하는 함수
   * @param {*} task
   */
  const handleSearchedTaskDoubleClick = (task) => {
    dispatch(setSelectedArchiveTask(task));
    let { path, ...newCurrentTask } = task;

    setCurrentTask(newCurrentTask);
    setPath(path);

    dispatch(setSearchStringArchive(""));
  };

  if (!data) return <div>Loading...</div>;
  if (!selectedArchive) return <div>Loading...</div>;

  // view return
  return (
    <div className="task-page">
      <div
        ref={dropFromExplore}
        className="main-view"
        style={{
          width: sidebarIsOpen ? `calc(100% - ${sidebarWidth}px)` : "100%",
        }}
      >
        <div className="main-view-content">
          {isSearching && (
            <div>
              <h3>검색 결과:</h3>
              {/* 검색 결과의 List */}
              <ul>
                {searchedTaskList.map((task, index) => (
                  <li
                    key={"search" + index}
                    className="task-item"
                    onDoubleClick={() => {
                      handleSearchedTaskDoubleClick(task);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={task.check}
                      onClick={(e) => e.stopPropagation()}
                      onDoubleClick={(e) => e.stopPropagation()}
                      onChange={() => {}}
                    />
                    <span>
                      {task.name} (Path: {task.path.join(" > ")})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {!isSearching && (
            <div>
              {/* 삭제 버튼 */}
              {currentTask.name !== "archive" && (
                <button onClick={handleDeleteTask}>삭제</button>
              )}
              {/* 복구 버튼 */}
              {currentTask.name !== "archive" && (
                <button onClick={handleUnarchiveTask}>복구</button>
              )}
              <div>
                {/* 현재 Task의 이름 */}
                {currentTask.name === "archive" ? (
                  <h2>{currentTask.name}</h2>
                ) : (
                  <>
                    <input
                      type="checkbox"
                      checked={currentTask.check}
                      onChange={() => {}}
                    />
                    {currentTask.name}
                  </>
                )}
                {/* 상세 */}
                {currentTask.name !== "archive" && (
                  <>
                    <div>
                      <label>Priority:</label>
                      <span
                        style={{
                          textDecoration: "underline",
                        }}
                      >
                        {currentTask.priority}
                      </span>
                    </div>
                    <div>
                      <label>Date Range:</label>
                      <DatePicker
                        selectsRange={true}
                        startDate={
                          currentTask.startDate
                            ? new Date(currentTask.startDate)
                            : null
                        }
                        endDate={
                          currentTask.endDate
                            ? new Date(currentTask.endDate)
                            : null
                        }
                        dateFormat="yyyy-MM-dd"
                        isClearable
                        readOnly
                        timeZone="UTC"
                      />
                    </div>
                    <div>
                      <label>Memo:</label>
                      <textarea name="memo" value={currentTask.memo} readOnly />
                    </div>
                  </>
                )}
                {/* 하위 Task의 List */}
                <ul>
                  {currentTask.children.map((task, index) => (
                    <DraggableTask
                      key={index}
                      type={"TaskPageItem"}
                      task={task}
                      section={data.name}
                      path={[...path, index]}
                      parentPath={path}
                      onDoubleClick={() => {
                        handleSubtaskDoubleClick(task, [...path, index]);
                      }}
                      onCheckChange={() => {}}
                      index={index}
                      orderTask={() => {}}
                    />
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
      {sidebarIsOpen && <Sidebar />}
    </div>
  );
}
