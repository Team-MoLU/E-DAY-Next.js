"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

export default function RootTaskPage() {
  const [task, setTask] = useState({ text: "", route: [], subNodes: [] });

  useEffect(() => {
    fetch("http://localhost:8080/root")
      .then((resp) => resp.json())
      .then((result) => {
        setTask(result);
      });
  }, []);

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
          <h1>경로 : "/{task.route.join("/")}"</h1>
          <h1>{task.text}</h1>
          <button onClick={toggleSidebar}>
            {isSidebarOpen ? "상세 끄기" : "상세 보기"}
          </button>
          <ul>
            {task.subNodes.map((subTask) => (
              <Link href={"/task/" + subTask.id} key={subTask.id}>
                <li className="task-item">{subTask.text}</li>
              </Link>
            ))}
          </ul>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const text = e.target.elements.text.value;
              const updatedTask = { ...task };
              const lastId =
                updatedTask.subNodes.length > 0
                  ? updatedTask.subNodes[updatedTask.subNodes.length - 1].id
                  : 0;
              updatedTask.subNodes.push({ id: parseInt(lastId) + 1, text });
              setTask(updatedTask);
              // 입력 필드 초기화
              e.target.reset();
            }}
          >
            <p>
              <input type="text" name="text" placeholder="text" />
            </p>
            <p>
              <input type="submit" value="create" />
            </p>
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
