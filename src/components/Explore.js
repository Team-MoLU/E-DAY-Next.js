"use client";
import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getTaskByPath,
  updateTask,
  moveTask,
  setExploredTask,
} from "@/redux/reducers/taskSlice";
import { useDrop } from "react-dnd";
import { DraggableTask } from "./DraggableTask";
import common from "@/lib/common/common_fn";

export const Explore = () => {
  // task data 관련
  const data = useSelector((state) => state.tasks.root);
  const exploredTask = useSelector((state) => state.tasks.exploredTask);
  const dispatch = useDispatch();
  const [currentTask, setCurrentTask] = useState(
    exploredTask === null ? data : exploredTask
  );
  const [path, setPath] = useState(
    exploredTask === null ? [] : exploredTask.path
  );
  const [currentTaskId, setCurrentTaskId] = useState(
    exploredTask === null ? "root" : exploredTask.id
  );
  const [route, setRoute] = useState(
    exploredTask === null
      ? [{ id: "root", name: "root" }]
      : common.findRouteById(exploredTask.id, data)
  );
  const [childList, setChildList] = useState(
    exploredTask === null ? data.children : exploredTask.children
  );

  // data 변경 시,
  useEffect(() => {
    const newPath = common.findNodePathById(currentTaskId, data);
    // 만약 현재 currentTask가 TaskPage에서 삭제되면,
    if (newPath === null) {
      // currentTask를 부모 Task로 변경
      const parentTaskId = route[route.length - 2].id;
      setCurrentTaskId(parentTaskId);
    } else {
      setPath(newPath);
      const updatedCurrentTask = getTaskByPath(data, newPath);
      setCurrentTask(updatedCurrentTask);
      // childList update
      setChildList(updatedCurrentTask.children);
    }
  }, [data]);

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
    // ExploredTask update
    dispatch(setExploredTask({ ...updatedCurrentTask, path: newPath }));
    // childList update
    setChildList(updatedCurrentTask.children);
  }, [currentTaskId]);

  /**
   * subtask 를 더블클릭했을 때, 해당 task의 하위로 이동하는 함수
   * @param {*} subtask
   * @param {*} subtaskPath
   */
  const handleSubtaskDoubleClick = (subtask, subtaskPath) => {
    setCurrentTaskId(subtask.id);
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

  // Drag and Drop 관련
  const handleDropFromTaskPage = useCallback(
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

  const handleDropExplore = useCallback(
    (item) => {
      const updatedTask = {
        ...currentTask,
        children: childList,
      };
      updateCurrentTask(updatedTask);
    },
    [path, data.name, childList]
  ); // path와 data.name을 의존성 배열에 추가

  const [, dropFromTaskPage] = useDrop(
    () => ({
      accept: "TaskPageItem",
      drop: handleDropFromTaskPage,
    }),
    [handleDropFromTaskPage]
  ); // handleDrop을 의존성 배열에 추가

  const [, dropExplore] = useDrop(
    () => ({
      accept: "ExploreItem",
      drop: handleDropExplore,
    }),
    [handleDropExplore]
  ); // handleDrop을 의존성 배열에 추가

  const handleOrderTask = (fromIndex, toIndex) => {
    const updatedChildrens = [...childList];
    const [movedChild] = updatedChildrens.splice(fromIndex, 1);
    updatedChildrens.splice(toIndex, 0, movedChild);
    setChildList(updatedChildrens);
  };

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
    setCurrentTaskId(task.id);
    setSearchString("");
  };

  return (
    <div className="explore" ref={dropFromTaskPage}>
      <div ref={dropExplore}>
        <h1>탐색</h1>
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
            {/* 경로 */}
            <div>
              <span>경로: </span>
              {route.map((r, index) => (
                <span key={"r" + index}>
                  {" / "}
                  <span
                    style={{ cursor: "pointer", color: "blue" }}
                    onClick={() => {
                      setCurrentTaskId(r.id);
                    }}
                  >
                    {r.name}
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
                <span>{currentTask.name}</span>
              </>
            )}

            {/* 하위 Task의 List */}
            <ul>
              {childList.map((task, index) => (
                <DraggableTask
                  key={index}
                  type={"ExploreItem"}
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
          </div>
        )}
      </div>
    </div>
  );
};
