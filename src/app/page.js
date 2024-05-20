"use client";
import { useState } from "react";

export default function HomePage() {
  const [currentNode, setCurrentNode] = useState("user");

  const nodes = [
    "밥 먹기",
    "토익 단어 외우기",
    "밥 먹지 말던가.... 웅....",
    "밥 알아서 하기",
    "집 가기 제발ㄹ 보내줘",
  ];

  const handleClick = (node) => {
    setCurrentNode(node);
  };

  return (
    <div>
      <h1>{currentNode}</h1>
      <ul>
        {nodes.map((node, index) => (
          <li
            key={index}
            className="node-item"
            onClick={() => handleClick(node)}
          >
            {node}
          </li>
        ))}
      </ul>
    </div>
  );
}
