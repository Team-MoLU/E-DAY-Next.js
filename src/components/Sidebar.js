import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { handleNodeClickWithSidebar } from "@/redux/actions/uiAction";
import TaskDetailSidebar from "./sidebars/TaskDetailSidebar";

const Sidebar = () => {
  const dispatch = useDispatch();
  const { activeContent } = useSelector((state) => state.ui.sidebar);

  const renderContent = () => {
    switch (activeContent) {
      case "taskDetail":
        return <TaskDetailSidebar />;
      // 다른 사이드바도 추가할 수 있습니다.
      default:
        return null;
    }
  };

  return (
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
        onClick={() => dispatch(handleNodeClickWithSidebar())}
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
