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
import Sidebar from "../../../components/Sidebar";
import { v4 as uuidv4 } from "uuid";
import "react-datepicker/dist/react-datepicker.css";
import { DraggableTask } from "../../../components/DraggableTask";
import { useDrop } from "react-dnd";
import common from "@/lib/common/common_fn";
import { setMenu, setSearchString } from "@/redux/reducers/menuSlice";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function TaskPage() {
  // task data 관련
  const data = useSelector((state) => state.tasks.root);
  const selectedTask = useSelector((state) => state.tasks.selectedTask);
  const dispatch = useDispatch();
  const [currentTask, setCurrentTask] = useState(
    selectedTask === null ? data : selectedTask
  );
  const [path, setPath] = useState(
    selectedTask === null ? [] : selectedTask.path
  );
  const [newTaskName, setNewTaskName] = useState("");
  const [currentTaskId, setCurrentTaskId] = useState(
    selectedTask === null ? "root" : selectedTask.id
  );
  const [route, setRoute] = useState(
    selectedTask === null
      ? [{ id: "root", name: "root" }]
      : common.findRouteById(selectedTask.id, data)
  );
  const [childList, setChildList] = useState(
    selectedTask === null ? data.children : selectedTask.children
  );

  // Topbar의 menu 설정
  useEffect(() => {
    dispatch(setMenu("list-view"));
  }, []);

  // data 변경 시,
  useEffect(() => {
    const newPath = common.findNodePathById(currentTaskId, data);
    setPath(newPath);
    const updatedCurrentTask = getTaskByPath(data, newPath);
    setCurrentTask(updatedCurrentTask);
    // childList update
    setChildList(updatedCurrentTask.children);
  }, [data]);

  // selectedTask 변경 시,
  useEffect(() => {
    const selectedTaskId = selectedTask === null ? "root" : selectedTask.id;
    setCurrentTaskId(selectedTaskId);
  }, [selectedTask]);

  // current task id 변경 시,
  useEffect(() => {
    // path update
    const newPath = common.findNodePathById(currentTaskId, data);
    setPath(newPath);
    // currentTask update
    const updatedCurrentTask = getTaskByPath(data, newPath);
    setCurrentTask(updatedCurrentTask);
    // route update
    const newRoute = common.findRouteById(currentTaskId, data);
    setRoute(newRoute);
    // selectedTask update
    dispatch(setSelectedTask({ ...updatedCurrentTask, path: newPath }));
    // childList update
    setChildList(updatedCurrentTask.children);
  }, [currentTaskId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "name") {
      setCurrentTask({ ...currentTask, name: value });
    } else if (name === "memo") {
      setCurrentTask({ ...currentTask, memo: value });
    }
  };

  const handleNameInputBlur = () => {
    const updatedTask = {
      ...currentTask,
      name: currentTask.name,
    };
    updateCurrentTask(updatedTask);
  };

  const handleMemoInputBlur = () => {
    const updatedTask = {
      ...currentTask,
      memo: currentTask.memo,
    };
    updateCurrentTask(updatedTask);
  };

  const handlePriorityClick = () => {
    const newPriority = (currentTask.priority + 1) % 4;
    const updatedTask = {
      ...currentTask,
      priority: newPriority,
    };
    updateCurrentTask(updatedTask);
  };

  const handleDateRangeChange = (update) => {
    const updatedTask = {
      ...currentTask,
      startDate: update[0] ? formatDate(update[0]) : null,
      endDate: update[1] ? formatDate(update[1]) : null,
    };
    updateCurrentTask(updatedTask);
  };

  const formatDate = (date) => {
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
    return adjustedDate.toISOString().split("T")[0];
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
    // currentTask를 부모 Task로 변경
    const parentTaskId = route[route.length - 2].id;
    setCurrentTaskId(parentTaskId);
    // dispatch 통해서 현재 node 삭제
    dispatch(
      deleteTask({
        section: data.name,
        path: path,
      })
    );
  };

  /**
   * 현재 task를 아카이빙하고, 부모 task로 이동하는 함수
   */
  const handleArchiveTask = () => {
    // currentTask를 부모 Task로 변경
    const parentTaskId = route[route.length - 2].id;
    setCurrentTaskId(parentTaskId);
    // dispatch 통해서 현재 node 아카이브
    dispatch(
      archiveTask({
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
    setCurrentTaskId(subtask.id);
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

  const handleDropTaskPage = useCallback(
    (item) => {
      const updatedTask = {
        ...currentTask,
        children: childList,
      };
      updateCurrentTask(updatedTask);
    },
    [path, data.name, childList]
  ); // path와 data.name을 의존성 배열에 추가

  const [, dropFromExplore] = useDrop(
    () => ({
      accept: "ExploreItem",
      drop: handleDropFromExplore,
    }),
    [handleDropFromExplore]
  ); // handleDrop을 의존성 배열에 추가

  const [, dropTaskPage] = useDrop(
    () => ({
      accept: "TaskPageItem",
      drop: handleDropTaskPage,
    }),
    [handleDropTaskPage]
  ); // handleDrop을 의존성 배열에 추가

  const handleOrderTask = (fromIndex, toIndex) => {
    const updatedChildrens = [...childList];
    const [movedChild] = updatedChildrens.splice(fromIndex, 1);
    updatedChildrens.splice(toIndex, 0, movedChild);
    setChildList(updatedChildrens);
  };

  // 검색 관련
  const searchString = useSelector((state) => state.menu.searchString);
  const [isSearching, setIsSearching] = useState(false);
  const [searchedTaskList, setSearchedTaskList] = useState([]);

  useEffect(() => {
    if (searchString === "") {
      setIsSearching(false);
      setSearchedTaskList([]);
    } else {
      setIsSearching(true);
      const result = searchTasks(currentTask, searchString, path);
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
    setCurrentTaskId(task.id);
    dispatch(setSearchString(""));
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
        <div className="main-view-content" ref={dropTaskPage}>
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
              {/* 삭제 버튼 */}
              {currentTask.name !== "root" && (
                <button onClick={handleDeleteTask}>삭제</button>
              )}
              {/* 아카이빙 버튼 */}
              {currentTask.name !== "root" && (
                <button onClick={handleArchiveTask}>아카이빙</button>
              )}
              <div>
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
                      onBlur={handleNameInputBlur} // 입력이 끝나면 onBlur 이벤트가 발생합니다.
                    />
                  </>
                )}
                {/* 상세 */}
                {currentTask.name !== "root" && (
                  <>
                    <div>
                      <label>Priority:</label>
                      <span
                        style={{
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                        onClick={handlePriorityClick}
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
                        onChange={handleDateRangeChange}
                        dateFormat="yyyy-MM-dd"
                        isClearable
                        timeZone="UTC"
                      />
                    </div>
                    <div>
                      <label>Memo:</label>
                      <textarea
                        name="memo"
                        value={currentTask.memo}
                        onChange={handleInputChange}
                        onBlur={handleMemoInputBlur} // 입력이 끝나면 onBlur 이벤트가 발생합니다.
                      />
                    </div>
                  </>
                )}
                {/* 하위 Task의 List */}
                <ul>
                  {childList.map((task, index) => (
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
                      onCheckChange={(e) => {
                        toggleSubTaskCheck(index);
                      }}
                      index={index} // 현재 인덱스 전달
                      orderTask={handleOrderTask} // orderTask 함수 전달
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
