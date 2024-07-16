"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Tree from "../../../components/Tree";
import TreeFilter from "@/components/TreeFilter";
import { getTaskByPath, setSelectedTask } from "@/redux/reducers/taskSlice";
import { useDispatch } from "react-redux";

export default function TreeViewPage() {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);
  const router = useRouter();
  const dispatch = useDispatch();

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
        ref={containerRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: "hidden",
        }}
        onContextMenu={handleContextMenu}
      >
        {containerSize.width > 0 && containerSize.height > 0 && (
          <Tree
            width={containerSize.width}
            height={containerSize.height}
            onNodeClick={onNodeClick}
          />
        )}
      </div>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          padding: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 10,
        }}
      >
        <TreeFilter />
      </div>
    </div>
  );
}
