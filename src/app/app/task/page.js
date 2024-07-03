"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addTask, getTaskByPath, updateTask } from "@/redux/reducers/taskSlice";
import { v4 as uuidv4 } from "uuid";

export default function TaskPage() {
  // task data 관련
  const data = useSelector((state) => state.tasks.root);
  const dispatch = useDispatch();
  const [currentTask, setCurrentTask] = useState(data);
  const [path, setPath] = useState([]);
  const [newTaskName, setNewTaskName] = useState("");

  useEffect(() => {
    setCurrentTask(getTaskByPath(data, path));
  }, [data]);

  /**
   * task 추가 함수
   */
  const handleAddTask = (e) => {
    e.preventDefault(); // Prevent the default form submission
    if (newTaskName.trim()) {
      const newTask = {
        id: uuidv4(), // Generate UUID for id
        name: newTaskName,
        memo: "", // Initial memo is empty
        startDate: "", // Initial startDate is empty
        endDate: "", // Initial endDate is empty
        priority: 0, // Initial priority is 0
        check: false, // Initial check is false
        children: [], // Initialize with empty children array
      };

      dispatch(
        addTask({
          section: data.name,
          path: path, // root 하위에 바로 추가
          newTask: newTask,
        })
      );

      setNewTaskName(""); // Clear input after adding
    }
  };

  /**
   * 하위 task의 index를 바탕으로 해당 task의 체크 값 변경하는 함수
   * @param {int} subtaskIndex
   */
  const handleCheckboxChange = (subtaskIndex) => {
    const updatedTask = {
      ...currentTask.children[subtaskIndex],
      check: !currentTask.children[subtaskIndex].check,
    };

    dispatch(
      updateTask({
        section: data.name,
        path: [...path, subtaskIndex],
        updatedTask: updatedTask,
      })
    );
  };

  // sidebar 관련
  const sidebarRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [mainViewWidth, setMainViewWidth] = useState(650);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    setMainViewWidth(650);
  };

  const startResizing = useCallback((mouseDownEvent) => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent) => {
      if (isResizing) {
        const newMainViewWidth =
          mouseMoveEvent.clientX -
          sidebarRef.current.getBoundingClientRect().left;
        if (newMainViewWidth / window.innerWidth >= 0.78) {
          setIsSidebarOpen(false);
        }
        setMainViewWidth(newMainViewWidth);
      }
    },
    [isResizing]
  );

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  // view return
  return (
    <div className="task-page">
      <div
        ref={sidebarRef}
        className="main-view"
        style={{
          width: isSidebarOpen ? mainViewWidth : "100%",
        }}
      >
        <div className="main-view-content">
          <button onClick={toggleSidebar}>
            {isSidebarOpen ? "상세 끄기" : "상세 보기"}
          </button>

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
                      setCurrentTask(
                        getTaskByPath(data, path.slice(0, index + 1))
                      );
                      setPath(path.slice(0, index + 1));
                    }}
                  >
                    {getTaskByPath(data, path.slice(0, index + 1)).name}
                  </span>
                </span>
              ))}
            </div>
            {/* 현재 Task의 이름 */}
            <h2>{currentTask.name}</h2>
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
                    onChange={(e) => {
                      handleCheckboxChange(index);
                    }}
                  />
                  <span>{task.name}</span>
                </li>
              ))}
            </ul>
            {/* 새로운 할 일 추가 UI */}
            <form onSubmit={handleAddTask}>
              <input
                type="text"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                placeholder="새로운 할 일"
              />
              <button type="submit">추가</button>
            </form>
          </div>
        </div>
        {isSidebarOpen && (
          <div className="main-sub-view-resizer" onMouseDown={startResizing} />
        )}
      </div>
      {isSidebarOpen && (
        <div
          className="sub-view"
          style={{ width: `calc(100% - ${mainViewWidth}px)` }}
        >
          <h1>sub 페이지</h1>
          <TaskDetail task={currentTask} onTaskChange={setCurrentTask} />
        </div>
      )}
    </div>
  );
}

const TaskDetail = ({ task, onTaskChange }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onTaskChange({ ...task, [name]: value });
  };

  const handleSave = () => {
    // 변경사항 업데이트
  };

  return (
    <div className="task-detail">
      <h1>상세</h1>
      <div className="task-detail-item">
        <strong>Name:</strong>
        <input
          type="text"
          name="name"
          value={task.name}
          onChange={handleInputChange}
        />
      </div>
      <div className="task-detail-item">
        <strong>Start Date:</strong> <span>{task.startDate || "Not set"}</span>
      </div>
      <div className="task-detail-item">
        <strong>End Date:</strong> <span>{task.endDate || "Not set"}</span>
      </div>
      <div className="task-detail-item">
        <strong>Priority:</strong> <span>{task.priority || "Not set"}</span>
      </div>
      <div className="task-detail-item">
        <strong>Memo:</strong>
        <textarea name="memo" value={task.memo} onChange={handleInputChange} />
      </div>
      <button onClick={handleSave}>Save</button>
    </div>
  );
};
