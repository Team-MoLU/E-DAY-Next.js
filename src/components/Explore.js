"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addTask,
  deleteTask,
  getTaskByPath,
  updateTask,
} from "@/redux/reducers/taskSlice";

export const Explore = () => {
  // task data 관련
  const data = useSelector((state) => state.tasks.root);
  const dispatch = useDispatch();
  const [currentTask, setCurrentTask] = useState(data);
  const [path, setPath] = useState([]);

  useEffect(() => {
    const updatedCurrentTask = getTaskByPath(data, path);
    // 만약 현재 currentTask가 TaskPage에서 삭제되면,
    if (
      updatedCurrentTask === null ||
      updatedCurrentTask.id !== currentTask.id
    ) {
      // currentTask를 부모 Task로 변경
      const newPath = path.slice(0, -1);
      setPath(newPath);
      setCurrentTask(getTaskByPath(data, newPath));
    } else {
      setCurrentTask(getTaskByPath(data, path));
    }
  }, [data]);

  return (
    <div className="explore">
      <h1>탐색</h1>
      <div>
        {/* 경로 */}
        <div>
          <span>경로: </span>
          <span
            style={{ cursor: "pointer", color: "blue" }}
            onClick={() => {
              setCurrentTask(data);
              setPath([]);
            }}
          >
            {data.name}
          </span>
          {path.map((p, index) => (
            <span key={"p" + index}>
              {" / "}
              <span
                style={{ cursor: "pointer", color: "blue" }}
                onClick={() => {
                  setCurrentTask(getTaskByPath(data, path.slice(0, index + 1)));
                  setPath(path.slice(0, index + 1));
                }}
              >
                {getTaskByPath(data, path.slice(0, index + 1)) !== null &&
                  getTaskByPath(data, path.slice(0, index + 1)).name}
              </span>
            </span>
          ))}
        </div>
        {/* 현재 Task의 이름 */}
        {currentTask.name === "root" ? (
          <h2>{currentTask.name}</h2>
        ) : (
          <>
            <input type="checkbox" checked={currentTask.check} readOnly />
            <span>{currentTask.name}</span>
          </>
        )}

        {/* 하위 Task의 List */}
        <ul>
          {currentTask.children.map((task, index) => (
            <li
              key={index}
              className="task-item"
              onClick={() => {
                setCurrentTask(currentTask.children[index]);
                setPath([...path, index]);
              }}
            >
              <input
                type="checkbox"
                checked={task.check}
                onClick={(e) => e.stopPropagation()} // 체크박스 클릭 시 이벤트 전파 막기
                readOnly
              />
              <span>{task.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
