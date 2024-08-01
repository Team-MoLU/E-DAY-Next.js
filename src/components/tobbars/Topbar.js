import React, { useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { HomeTopbar } from "./HomeTopbar";
import { TreeviewTopbar } from "./TreeviewTopbar";

const Topbar = () => {
  const dispatch = useDispatch();
  const activeContent = useSelector((state) => state.menu.activeContent);

  const renderContent = () => {
    switch (activeContent) {
      case "home":
        return <HomeTopbar />;
      case "list-view":
        return <HomeTopbar />;
      case "tree-view":
        return <TreeviewTopbar />;
      case "calendar":
        return <h1>calendar topbar</h1>;
      case "archive":
        return <h1>archive topbar</h1>;
      case "trash":
        return <h1>trash topbar</h1>;
      case "retrospect":
        return <h1>retrospect topbar</h1>;
      case "achievement":
        return <h1>achievement topbar</h1>;
      default:
        return null;
    }
  };

  return <div className="top-bar">{renderContent()}</div>;
};

export default Topbar;
