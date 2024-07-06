"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  dropTask,
  getTaskByPath,
  restoreTask,
} from "@/redux/reducers/taskSlice";

export default function TrashPage() {
  // task data 관련
  const data = useSelector((state) => state.tasks.trash);
  const dispatch = useDispatch();
  const [currentTask, setCurrentTask] = useState(data);
  const [path, setPath] = useState([]);

  useEffect(() => {
    setCurrentTask(getTaskByPath(data, path));
  }, [data]);

  /**
   * 현재 task를 삭제(cascade)하고, 부모 task로 이동하는 함수
   */
  const handleDropTask = () => {
    // dispatch 통해서 현재 node 삭제
    dispatch(
      dropTask({
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
   * 현재 task를 trash에서 root 의 하위로 복구하고, 부모 task로 이동하는 함수
   */
  const handleRestoreTask = () => {
    // dispatch 통해서 현재 node 삭제
    dispatch(
      restoreTask({
        path: path,
      })
    );
    // currentTask를 부모 Task로 변경
    const newPath = path.slice(0, -1);
    setPath(newPath);
    setCurrentTask(getTaskByPath(data, newPath));
  };

  // sidebar 관련
  const sidebarRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [mainViewWidth, setMainViewWidth] = useState(650);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    setMainViewWidth(650);
  };

  const startResizing = useCallback((mouseDownEvent) => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent) => {
      if (isResizing) {
        const newMainViewWidth =
          mouseMoveEvent.clientX -
          sidebarRef.current.getBoundingClientRect().left;
        if (newMainViewWidth / window.innerWidth >= 0.78) {
          setIsSidebarOpen(false);
        }
        setMainViewWidth(newMainViewWidth);
      }
    },
    [isResizing]
  );

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  // view return
  return (
    <div className="task-page">
      <div
        ref={sidebarRef}
        className="main-view"
        style={{
          width: isSidebarOpen ? mainViewWidth : "100%",
        }}
      >
        <div className="main-view-content">
          {/* 상세 버튼 */}
          <button onClick={toggleSidebar}>
            {isSidebarOpen ? "상세 끄기" : "상세 보기"}
          </button>
          {/* 영구 삭제 버튼 */}
          {currentTask.name !== "trash" && (
            <button onClick={handleDropTask}>영구 삭제</button>
          )}
          {/* 복구 버튼 */}
          {currentTask.name !== "trash" && (
            <button onClick={handleRestoreTask}>복구</button>
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
            {currentTask.name === "trash" ? (
              <h2>{currentTask.name}</h2>
            ) : (
              <>
                <input type="checkbox" checked={currentTask.check} />
                <sapn>{currentTask.name}</sapn>
              </>
            )}
            {/* 하위 Task의 List */}
            <ul>
              {currentTask.children.map((task, index) => (
                <li
                  key={index}
                  className="task-item"
                  onClick={() => {
                    setCurrentTask(currentTask.children[index]);
                    setPath([...path, index]);
                  }}
                >
                  <input
                    type="checkbox"
                    checked={task.check}
                    onClick={(e) => e.stopPropagation()} // 체크박스 클릭 시 이벤트 전파 막기
                  />
                  <span>{task.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {isSidebarOpen && (
          <div className="main-sub-view-resizer" onMouseDown={startResizing} />
        )}
      </div>
      {isSidebarOpen && (
        <div
          className="sub-view"
          style={{ width: `calc(100% - ${mainViewWidth}px)` }}
        >
          <h1>sub 페이지</h1>
          <TaskDetail task={currentTask} />
        </div>
      )}
    </div>
  );
}

const TaskDetail = ({ task }) => {
  return task.name === "trash" ? (
    <h1>trash는 상세가 없어요</h1>
  ) : (
    <div className="task-detail">
      <h1>상세</h1>
      <div className="task-detail-item">
        <strong>Name:</strong> <span>{task.name || "Not set"}</span>
      </div>
      <div className="task-detail-item">
        <strong>Start Date:</strong> <span>{task.startDate || "Not set"}</span>
      </div>
      <div className="task-detail-item">
        <strong>End Date:</strong> <span>{task.endDate || "Not set"}</span>
      </div>
      <div className="task-detail-item">
        <strong>Priority:</strong> <span>{task.priority || "Not set"}</span>
      </div>
      <div className="task-detail-item">
        <strong>Memo:</strong>
        <textarea name="memo" value={task.memo} />
      </div>
    </div>
  );
};
