"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import Tree from "../../../components/Tree";
import { updateTask } from "@/redux/reducers/taskSlice";

export default function TreeViewPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const dispatch = useDispatch();
  const data = useSelector((state) => state.tasks.root);

  const handleRefresh = useCallback(() => {
    setRefreshKey((prevKey) => prevKey + 1);
  }, []);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    window.addEventListener("resize", updateSize);
    updateSize();

    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("resize", updateSize);
      document.body.style.overflow = "";
    };
  }, []);

  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node);
    setIsSidebarOpen(true);
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "95vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative", // 추가: 부모 요소에 relative 포지셔닝
      }}
    >
      <div
        style={{
          padding: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h1>Tree Structure with D3 and React</h1>
        <button onClick={handleRefresh}>Refresh</button>
      </div>
      <div
        ref={containerRef}
        style={{
          flexGrow: 1,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {containerSize.width > 0 && containerSize.height > 0 && (
          <Tree
            key={refreshKey}
            width={containerSize.width}
            height={containerSize.height}
            onNodeClick={handleNodeClick}
          />
        )}
      </div>
      {isSidebarOpen && (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "30%",
            height: "100%",
            padding: "20px",
            borderLeft: "1px solid #ccc",
            backgroundColor: "white",
            boxShadow: "-2px 0 5px rgba(0,0,0,0.1)",
            zIndex: 1000,
            overflowY: "auto",
          }}
        >
          <button
            onClick={() => setIsSidebarOpen(false)}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              padding: "5px 10px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Close
          </button>
          <TaskDetail task={selectedNode} onTaskChange={setSelectedNode} />
        </div>
      )}
    </div>
  );
}

const TaskDetail = React.memo(({ task, onTaskChange }) => {
  const dispatch = useDispatch();

  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      onTaskChange((prevTask) => ({ ...prevTask, [name]: value }));
    },
    [onTaskChange]
  );

  const handleSave = useCallback(() => {
    dispatch(
      updateTask({
        section: "root",
        path: [],
        updatedTask: task,
      })
    );
  }, [dispatch, task]);

  if (!task) return null;

  return (
    <div className="task-detail">
      <h2>Task Details</h2>
      <div>
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={task.name}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label>Memo:</label>
        <textarea
          name="memo"
          value={task.memo || ""}
          onChange={handleInputChange}
        />
      </div>
      <button onClick={handleSave}>Save</button>
    </div>
  );
});

TaskDetail.displayName = "TaskDetail";
