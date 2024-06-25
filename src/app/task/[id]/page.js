"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { RoutesList } from "../../../components/RoutesList";

export default function TaskPage(props) {
  const [task, setTask] = useState({});
  const [routes, setRoutes] = useState([]);
  const [subtasks, setSubtasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState("");

  const fetchTaskData = async () => {
    // task fetch
    fetch("http://localhost:8080/api/v1/tasks/" + props.params.id)
      .then((resp) => resp.json())
      .then((result) => {
        setTask(result);
      });
    // subtasks fetch
    fetch("http://localhost:8080/api/v1/tasks/" + props.params.id + "/subtasks")
      .then((resp) => resp.json())
      .then((result) => {
        setSubtasks(result.taskList);
      });
    // routes fetch
    fetch("http://localhost:8080/api/v1/tasks/" + props.params.id + "/routes")
      .then((resp) => resp.json())
      .then((result) => {
        result.routes.unshift({ taskId: "", name: "root" });
        setRoutes(result.routes);
      });
  };

  useEffect(() => {
    fetchTaskData();
  }, [props.params.id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskName.trim()) {
      alert("할 일을 입력해주세요.");
      return;
    }
    try {
      const response = await fetch("http://localhost:8080/api/v1/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parentId: props.params.id,
          name: newTaskName.trim(),
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to create task");
      }
      setNewTaskName("");
      await fetchTaskData();
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    setMainViewWidth(650);
  };

  const sidebarRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [mainViewWidth, setMainViewWidth] = useState(650);

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
          <RoutesList routes={routes} />
          <h1>{task.name}</h1>
          <button onClick={toggleSidebar}>
            {isSidebarOpen ? "상세 끄기" : "상세 보기"}
          </button>
          {subtasks.length === 0 ? (
            <p>하위 할 일이 없습니다.</p>
          ) : (
            <ul>
              {subtasks.map((subtask) => (
                <li
                  key={subtask.taskId}
                  onContextMenu={(e) => handleContextMenu(e, subtask.taskId)}
                  className="task-item"
                  onClick={() =>
                    (window.location.href = "/task/" + subtask.taskId)
                  }
                >
                  <input
                    type="checkbox"
                    defaultChecked={subtask.check}
                    onClick={(e) => e.stopPropagation()} // 체크박스 클릭 시 이벤트 전파 막기
                  />
                  <span>{subtask.name}</span>
                </li>
              ))}
            </ul>
          )}
          <form onSubmit={handleCreateTask}>
            <input
              type="text"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              placeholder="새로운 할 일"
            />
            <button type="submit">추가</button>
          </form>
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
          <h1>상세 페이지</h1>
        </div>
      )}
    </div>
  );
}
