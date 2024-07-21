import React, { useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { startResizing, stopResizing, resize } from "@/redux/actions/uiAction";
import { toggleSidebar } from "@/redux/reducers/uiSlice";
import TaskDetailSidebar from "./sidebars/TaskDetailSidebar";
import ArchiveDetailSidebar from "./sidebars/ArchiveDetailSidebar";
import { Explore } from "./Explore";

const Sidebar = () => {
  const dispatch = useDispatch();
  const { isOpen, activeContent, width, isResizing } = useSelector(
    (state) => state.ui.sidebar
  );

  const handleResizeStart = useCallback(
    (e) => {
      e.preventDefault();
      dispatch(startResizing());
    },
    [dispatch]
  );

  const handleResize = useCallback(
    (e) => {
      if (isResizing) {
        dispatch(resize(e.clientX));
      }
    },
    [dispatch, isResizing]
  );

  const handleResizeStop = useCallback(() => {
    dispatch(stopResizing());
  }, [dispatch]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleResize);
      window.addEventListener("mouseup", handleResizeStop);
    }
    return () => {
      window.removeEventListener("mousemove", handleResize);
      window.removeEventListener("mouseup", handleResizeStop);
    };
  }, [isResizing, handleResize, handleResizeStop]);

  const renderContent = () => {
    switch (activeContent) {
      case "taskDetail":
        return <TaskDetailSidebar />;
      case "taskDetailReadOnly":
        return <ArchiveDetailSidebar />;
      case "explore":
        return <Explore />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: `${width}px`,
        height: "100%",
        padding: "20px",
        borderLeft: "1px solid #ccc",
        backgroundColor: "white",
        boxShadow: "-2px 0 5px rgba(0,0,0,0.1)",
        zIndex: 1000,
        overflowY: "auto",
        transition: isResizing ? "none" : "width 0.3s ease",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "-5px",
          width: "10px",
          height: "100%",
          cursor: "ew-resize",
        }}
        onMouseDown={handleResizeStart}
      />
      <button
        onClick={() => {
          dispatch(toggleSidebar());
        }}
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
      {renderContent()}
    </div>
  );
};

export default Sidebar;
