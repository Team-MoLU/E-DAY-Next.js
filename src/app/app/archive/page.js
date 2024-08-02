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
import { setSidebarContent, toggleSidebar } from "@/redux/reducers/uiSlice";
import Sidebar from "../../../components/Sidebar";
import "react-datepicker/dist/react-datepicker.css";
import { DraggableTask } from "../../../components/DraggableTask";
import { useDrop } from "react-dnd";
import { setMenu } from "@/redux/reducers/menuSlice";

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

  useEffect(() => {
    dispatch(setMenu("archive"));
  }, []);

  // data 변경 시, currentTask refresh
  useEffect(() => {
    setCurrentTask(getTaskByPath(data, path));
  }, [data, path]);

  // path 변경 시, currentTask refresh
  useEffect(() => {
    dispatch(setSelectedArchiveTask({ ...currentTask, path: path }));
  }, [path, currentTask, dispatch]);

  // 페이지에 맞는 사이드바 내용으로 설정
  useEffect(() => {
    dispatch(setSidebarContent("taskDetailReadOnly"));
  }, [dispatch]);

  /**
   * 현재 task를 삭제(cascade)하고, 부모 task로 이동하는 함수
   */
  const handleDeleteTask = () => {
    // dispatch 통해서 현재 node 삭제
    dispatch(
      deleteTask({
        section: data.name,
        path: path,
      })
    );
    // currentTask를 부모 Task로 변경
    const newPath = path.slice(0, -1);
    setPath(newPath);
    setCurrentTask(getTaskByPath(data, newPath));
  };

  /**
   * subtask 를 더블클릭했을 때, 해당 task의 하위로 이동하는 함수
   * @param {*} subtask
   * @param {*} subtaskPath
   */
  const handleSubtaskDoubleClick = (subtask, subtaskPath) => {
    setCurrentTask(subtask);
    setPath(subtaskPath);
  };

  /**
   * 현재 task를 archive에서 root 의 하위로 복구하고, 부모 task로 이동하는 함수
   */
  const handleUnarchiveTask = () => {
    // dispatch 통해서 현재 node 삭제
    dispatch(
      unarchiveTask({
        path: path,
      })
    );
    // currentTask를 부모 Task로 변경
    const newPath = path.slice(0, -1);
    setPath(newPath);
    setCurrentTask(getTaskByPath(data, newPath));
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
  const [searchString, setSearchString] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchedTaskList, setSearchedTaskList] = useState([]);

  useEffect(() => {
    if (searchString === "") {
      setIsSearching(false);
      setSearchedTaskList([]);
    } else {
      setIsSearching(true);
      const result = searchTasks(currentTask, searchString);
      setSearchedTaskList(result);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchString, currentTask]);

  // 검색어 필터링
  const matchesSearchString = (name, searchString) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "")
      .includes(searchString.toLowerCase().replace(/\s+/g, ""));
  };

  // 재귀적으로 작업 목록을 검색하는 함수
  const searchTasks = (task, searchString, path = []) => {
    const result = [];

    // 현재 작업이 검색 문자열을 포함하면 결과에 추가
    if (matchesSearchString(task.name, searchString)) {
      const foundTask = {
        ...task,
        path: path,
      };
      result.push(foundTask);
    }

    // 자식 작업이 있으면 재귀적으로 검색
    if (task.children && task.children.length > 0) {
      task.children.forEach((child, index) => {
        result.push(...searchTasks(child, searchString, path.concat(index)));
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

    setSearchString("");
  };

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
          <label className="block mb-2 font-semibold">검색</label>
          {/* 검색창 */}
          <input
            type="text"
            name="search"
            className="w-full p-2 rounded"
            value={searchString}
            onChange={(e) => setSearchString(e.target.value)}
            placeholder={currentTask.name + " 검색"}
          />
          {isSearching && (
            <div>
              <h3>검색 결과:</h3>
              {/* 검색 결과의 List */}
              <ul>
                {searchedTaskList.map((task, index) => (
                  // eslint-disable-next-line react/jsx-key
                  <li
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
              {/* 탐색 버튼 */}
              <button
                onClick={() => {
                  dispatch(setSidebarContent("explore"));
                  // side view가 꺼져있으면 켜기
                  if (sidebarIsOpen === false) {
                    dispatch(toggleSidebar());
                  }
                  // side view 가 켜져있고, 이미 explore 이면, 끄기
                  else if (sidebarActiveContent === "explore") {
                    dispatch(toggleSidebar());
                  }
                }}
              >
                탐색
              </button>
              {/* 상세 버튼 */}
              {currentTask.name !== "root" && (
                <button
                  onClick={() => {
                    dispatch(setSelectedArchiveTask({ ...currentTask, path }));
                    dispatch(setSidebarContent("taskDetailReadOnly"));
                    // side view가 꺼져있으면 켜기
                    if (sidebarIsOpen === false) {
                      dispatch(toggleSidebar());
                    }
                    // side view 가 켜져있고, 이미 taskDetail 이면, 끄기
                    else if (sidebarActiveContent === "taskDetailReadOnly") {
                      dispatch(toggleSidebar());
                    }
                  }}
                >
                  상세
                </button>
              )}
              {/* 삭제 버튼 */}
              {currentTask.name !== "archive" && (
                <button onClick={handleDeleteTask}>삭제</button>
              )}
              {/* 복구 버튼 */}
              {currentTask.name !== "archive" && (
                <button onClick={handleUnarchiveTask}>복구</button>
              )}
              <div>
                {/* 경로 */}
                <div>
                  <span>경로: </span>
                  <span
                    style={{ cursor: "pointer", color: "blue" }}
                    onClick={() => {
                      setCurrentTask(data);
                      setPath([]);
                    }}
                  >
                    {data.name}
                  </span>
                  {path.map((p, index) => (
                    <span key={"p" + index}>
                      {" / "}
                      <span
                        style={{ cursor: "pointer", color: "blue" }}
                        onClick={() => {
                          setCurrentTask(
                            getTaskByPath(data, path.slice(0, index + 1))
                          );
                          setPath(path.slice(0, index + 1));
                        }}
                      >
                        {getTaskByPath(data, path.slice(0, index + 1)).name}
                      </span>
                    </span>
                  ))}
                </div>
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
