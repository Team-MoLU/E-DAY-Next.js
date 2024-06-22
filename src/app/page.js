"use client";
import { useState, useEffect, useRef, useCallback } from "react";

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function HomePage() {
  const [tasks, setTasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [mainViewWidth, setMainViewWidth] = useState(650);
  const [contextMenu, setContextMenu] = useState(null);
  const sidebarRef = useRef(null);

  const fetchTasks = async () => {
    const today = new Date();
    const formattedDate = formatDate(today);
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/tasks?startDate=${formattedDate}&endDate=${formattedDate}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = await response.json();
      setTasks(data.taskList || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskName.trim()) {
      alert("할 일을 입력해주세요.");
      return;
    }
    const today = new Date();
    const formattedDate = formatDate(today);
    try {
      const response = await fetch("http://localhost:8080/api/v1/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parentId: "0",
          name: newTaskName.trim(),
          startDate: `${formattedDate}T08:00:00`,
          endDate: `${formattedDate}T22:00:00`,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to create task");
      }
      setNewTaskName("");
      await fetchTasks();
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/v1/tasks/delete",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            taskId: taskId,
            cascade: true,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete task");
      }
      await fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
    setContextMenu(null);
  };

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

  const handleContextMenu = useCallback((e, taskId) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      taskId: taskId,
    });
  }, []);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className="task-page">
      <div
        ref={sidebarRef}
        className="main-view"
        style={{
          width: isSidebarOpen ? mainViewWidth + "px" : "100%",
        }}
      >
        <div className="main-view-content">
          <h1>오늘의 할 일</h1>
          <button onClick={toggleSidebar}>
            {isSidebarOpen ? "상세 끄기" : "상세 보기"}
          </button>
          {tasks.length === 0 ? (
            <p>오늘은 할 일이 없습니다.</p>
          ) : (
            <ul>
              {tasks.map((task) => (
                <li
                  key={task.taskId}
                  onContextMenu={(e) => handleContextMenu(e, task.taskId)}
                  style={{ userSelect: "none" }}
                >
                  <input type="checkbox" defaultChecked={task.check} />
                  <span>{task.name}</span>
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
      {contextMenu && (
        <div
          style={{
            position: "fixed",
            top: contextMenu.y,
            left: contextMenu.x,
            background: "white",
            border: "1px solid black",
            padding: "5px",
            zIndex: 1000,
          }}
        >
          <button onClick={() => handleDeleteTask(contextMenu.taskId)}>
            삭제
          </button>
        </div>
      )}
    </div>
  );
}
