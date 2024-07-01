"use client";
import React from "react";
import Tree from "./Tree";

const data = {
  name: "Root",
  children: [
    {
      name: "Child 1",
      children: [{ name: "Grandchild 1" }, { name: "Grandchild 2" }],
    },
    {
      name: "Child 2",
      children: [{ name: "Grandchild 3" }, { name: "Grandchild 4" }],
    },
  ],
};

export default function TreeViewPage() {
  return (
    <div>
      <h1>Tree Structure with D3 and React</h1>
      <Tree data={data} />
    </div>
  );
}
