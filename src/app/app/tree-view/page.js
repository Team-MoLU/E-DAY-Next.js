"use client";
import React, { useState, useRef, useEffect } from "react";
import Tree from "../../../components/Tree";

export default function TreeViewPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);

  const handleRefresh = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

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

    // 전체 페이지에서 스크롤 방지
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("resize", updateSize);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "95vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
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
          />
        )}
      </div>
    </div>
  );
}
