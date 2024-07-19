"use client";
import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addTask,
  deleteTask,
  getTaskByPath,
  setSelectedTask,
  updateTask,
  moveTask,
  archiveTask,
} from "@/redux/reducers/taskSlice";
import { setSidebarContent, toggleSidebar } from "@/redux/reducers/uiSlice";
import Sidebar from "../../../components/Sidebar";
import { v4 as uuidv4 } from "uuid";
import "react-datepicker/dist/react-datepicker.css";
import { DraggableTask } from "../../../components/DraggableTask";
import { useDrop } from "react-dnd";
import { useRouter } from "next/navigation";

export default function TaskPage() {
  // task data 관련
  const data = useSelector((state) => state.tasks.root);
  const selectedTask = useSelector((state) => state.tasks.selectedTask);
  const dispatch = useDispatch();
  const router = useRouter();
  const [currentTask, setCurrentTask] = useState(
    selectedTask === null ? data : selectedTask
  );
  const [path, setPath] = useState(
    selectedTask === null ? [] : selectedTask.path
  );
  const [newTaskName, setNewTaskName] = useState("");

  // data 변경 시, currentTask refresh
  useEffect(() => {
    setCurrentTask(getTaskByPath(data, path));
  }, [data]);

  // path 변경 시, currentTask refresh
  useEffect(() => {
    dispatch(setSelectedTask({ ...currentTask, path: path }));
  }, [path]);

  // 페이지에 맞는 사이드바 내용으로 설정
  useEffect(() => {
    dispatch(setSidebarContent("taskDetail"));
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentTask({ ...currentTask, [name]: value });
  };

  const handleInputBlur = () => {
    const updatedTask = {
      ...currentTask,
      name: currentTask.name,
    };
    updateCurrentTask(updatedTask);
  };

  /**
   * 현재 currentTask의 값을 update하여 redux에 반영하는 함수
   * @param {*} updatedTask
   */
  const updateCurrentTask = (updatedTask) => {
    dispatch(
      updateTask({
        section: data.name,
        path: path,
        updatedTask: updatedTask,
      })
    );
  };

  /**
   * 새로운 task를 추가하는 함수
   */
  const handleAddTask = (e) => {
    e.preventDefault(); // Prevent the default form submission
    if (newTaskName.trim()) {
      const newTask = {
        id: uuidv4(), // Generate UUID for id
        name: newTaskName,
        memo: "", // Initial memo is empty
        startDate: "", // Initial startDate is empty
        endDate: "", // Initial endDate is empty
        priority: 0, // Initial priority is 0
        check: false, // Initial check is false
        children: [], // Initialize with empty children array
      };

      dispatch(
        addTask({
          section: data.name,
          path: path,
          newTask: newTask,
        })
      );

      setNewTaskName(""); // Clear input after adding
    }
  };

  /**
   * currentTask의 check 값을 변경하는 함수
   */
  const toggleCurrentTaskCheck = () => {
    const updatedTask = {
      ...currentTask,
      check: !currentTask.check,
    };
    updateCurrentTask(updatedTask);
  };

  /**
   * 하위 task의 index를 바탕으로 해당 하위 task의 check 값을 변경하는 함수
   * @param {int} subtaskIndex
   */
  const toggleSubTaskCheck = (subtaskIndex) => {
    const updatedTask = {
      ...currentTask.children[subtaskIndex],
      check: !currentTask.children[subtaskIndex].check,
    };

    dispatch(
      updateTask({
        section: data.name,
        path: [...path, subtaskIndex],
        updatedTask: updatedTask,
      })
    );
  };

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
   * 현재 task를 아카이빙하고, 부모 task로 이동하는 함수
   */
  const handleArchiveTask = () => {
    dispatch(
      archiveTask({
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

  // sidebar 관련
  const {
    isOpen: sidebarIsOpen,
    activeContent: sidebarActiveContent,
    width: sidebarWidth,
  } = useSelector((state) => state.ui.sidebar);

  // Drag and Drop 관련
  const handleDrop = useCallback(
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
    [path, data.name, dispatch]
  ); // path와 data.name을 의존성 배열에 추가

  const [, drop] = useDrop(
    () => ({
      accept: "TASK",
      drop: handleDrop,
    }),
    [handleDrop]
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
   * searched task 의 체크를 클릭했을 때, 체크 값을 toggle 하는 함수
   * @param {*} task
   * @param {number} index
   */
  const toggleSearchedTaskCheck = (task, index) => {
    let { path, ...updatedTask } = task;
    updatedTask = { ...updatedTask, check: !task.check };

    dispatch(
      updateTask({
        section: data.name,
        path: path,
        updatedTask: updatedTask,
      })
    );
  };

  /**
   * searched task 를 더블클릭했을 때, 해당 task의 리스트뷰로 이동하는 함수
   * @param {*} task
   */
  const handleSearchedTaskDoubleClick = (task) => {
    dispatch(setSelectedTask(task));
    let { path, ...newCurrentTask } = task;

    setCurrentTask(newCurrentTask);
    setPath(path);

    setSearchString("");
  };

  // view return
  return (
    <div className="task-page" ref={drop}>
      <div
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
                      onChange={(e) => {
                        toggleSearchedTaskCheck(task, index);
                      }}
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
              {/* 오늘 할 일 버튼 */}
              <button
                onClick={() => {
                  if (sidebarIsOpen && sidebarActiveContent === "taskDetail") {
                    dispatch(toggleSidebar());
                  }
                  router.push(`/app`);
                }}
              >
                오늘 할 일
              </button>
              {/* 트리뷰 버튼 */}
              <button
                onClick={() => {
                  router.push(`tree-view/`);
                }}
              >
                트리뷰
              </button>
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
                    dispatch(setSelectedTask({ ...currentTask, path }));
                    dispatch(setSidebarContent("taskDetail"));
                    // side view가 꺼져있으면 켜기
                    if (sidebarIsOpen === false) {
                      dispatch(toggleSidebar());
                    }
                    // side view 가 켜져있고, 이미 taskDetail 이면, 끄기
                    else if (sidebarActiveContent === "taskDetail") {
                      dispatch(toggleSidebar());
                    }
                  }}
                >
                  상세
                </button>
              )}
              {/* 삭제 버튼 */}
              {currentTask.name !== "root" && (
                <button onClick={handleDeleteTask}>삭제</button>
              )}
              {/* 아카이빙 버튼 */}
              {currentTask.name !== "root" && (
                <button onClick={handleArchiveTask}>아카이빙</button>
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
                {currentTask.name === "root" ? (
                  <h2>{currentTask.name}</h2>
                ) : (
                  <>
                    <input
                      type="checkbox"
                      checked={currentTask.check}
                      onChange={toggleCurrentTaskCheck}
                    />
                    <input
                      type="text"
                      name="name"
                      value={currentTask.name}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur} // 입력이 끝나면 onBlur 이벤트가 발생합니다.
                    />
                  </>
                )}

                {/* 하위 Task의 List */}
                <ul>
                  {currentTask.children.map((task, index) => (
                    <DraggableTask
                      key={index}
                      task={task}
                      section={data.name}
                      path={[...path, index]}
                      onDoubleClick={() => {
                        handleSubtaskDoubleClick(task, [...path, index]);
                      }}
                      onCheckChange={(e) => {
                        toggleSubTaskCheck(index);
                      }}
                    />
                  ))}
                </ul>
                {/* 새로운 할 일 추가 UI */}
                <form onSubmit={handleAddTask}>
                  <input
                    type="text"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    placeholder="새로운 할 일"
                  />
                  <button type="submit">추가</button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
      {sidebarIsOpen && <Sidebar />}
    </div>
  );
}
