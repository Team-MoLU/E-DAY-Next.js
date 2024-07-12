"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Tree from "../../../components/Tree";
import { getTaskByPath, setSelectedTask } from "@/redux/reducers/taskSlice";
import { useDispatch, useSelector } from "react-redux";

export default function TreeViewPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);
  const router = useRouter();
  const dispatch = useDispatch();

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

  const onNodeClick = (data, path) => {
    const task = getTaskByPath(data, path);
    dispatch(setSelectedTask({ ...task, path: path }));
    router.push(`task/`);
  };

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "95vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
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
        onContextMenu={handleContextMenu}
      >
        {containerSize.width > 0 && containerSize.height > 0 && (
          <Tree
            key={refreshKey}
            width={containerSize.width}
            height={containerSize.height}
            onNodeClick={onNodeClick}
          />
        )}
      </div>
    </div>
  );
}
