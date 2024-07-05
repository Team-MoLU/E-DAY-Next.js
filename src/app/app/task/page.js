"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addTask,
  deleteTask,
  getTaskByPath,
  updateTask,
} from "@/redux/reducers/taskSlice";
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentTask({ ...currentTask, [name]: value });
  };

  const handleInputBlur = () => {
    const updatedTask = {
      ...currentTask,
      name: currentTask.name,
    };
    updateCurrentTask(updatedTask);
  };

  /**
   * 현재 currentTask의 값을 update하는 함수
   * @param {*} updatedTask
   */
  const updateCurrentTask = (updatedTask) => {
    dispatch(
      updateTask({
        section: data.name,
        path: path,
        updatedTask: updatedTask,
      })
    );
  };

  /**
   * 새로운 task를 추가하는 함수
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
   * currentTask의 check 값을 변경하는 함수
   */
  const toggleCurrentTaskCheck = () => {
    const updatedTask = {
      ...currentTask,
      check: !currentTask.check,
    };
    updateCurrentTask(updatedTask);
  };

  /**
   * 하위 task의 index를 바탕으로 해당 하위 task의 check 값을 변경하는 함수
   * @param {int} subtaskIndex
   */
  const toggleSubTaskCheck = (subtaskIndex) => {
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

  /**
   * 현재 task를 삭제(cascade)하고, 부모 task로 이동하는 함수
   */
  const handleDeleteTask = () => {
    // dispatch 통해서 현재 node 삭제
    dispatch(
      deleteTask({
        section: data.name,
        path: path,
      })
    );
    // currentTask를 부모 Task로 변경
    const newPath = path.slice(0, -1);
    setPath(newPath);
    setCurrentTask(getTaskByPath(data, newPath));
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
          {/* 상세 버튼 */}
          <button onClick={toggleSidebar}>
            {isSidebarOpen ? "상세 끄기" : "상세 보기"}
          </button>
          {/* 삭제 버튼 */}
          {currentTask.name !== "root" && (
            <button onClick={handleDeleteTask}>삭제</button>
          )}
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
            {currentTask.name === "root" ? (
              <h2>{currentTask.name}</h2>
            ) : (
              <>
                <input
                  type="checkbox"
                  checked={currentTask.check}
                  onChange={toggleCurrentTaskCheck}
                />
                <input
                  type="text"
                  name="name"
                  value={currentTask.name}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur} // 입력이 끝나면 onBlur 이벤트가 발생합니다.
                />
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
                    onChange={(e) => {
                      toggleSubTaskCheck(index);
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
          <TaskDetail task={currentTask} onTaskChanged={updateCurrentTask} />
        </div>
      )}
    </div>
  );
}

const TaskDetail = ({ task, onTaskChanged }) => {
  const [memo, setMemo] = useState(task.memo); // memo 상태 추가

  useEffect(() => {
    // task prop이 변경될 때 memo 값을 업데이트
    setMemo(task.memo);
  }, [task]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "memo") {
      setMemo(value); // memo 필드의 입력 값을 memo 상태에 업데이트
    }
  };

  const handleInputBlur = () => {
    const updatedTask = {
      ...task,
      memo: memo, // 변경된 memo 값을 포함한 updatedTask 객체 생성
    };
    onTaskChanged(updatedTask); // 부모 컴포넌트로 전달된 함수 호출하여 Redux store 업데이트
  };

  return task.name === "root" ? (
    <h1>root는 상세가 없어요</h1>
  ) : (
    <div className="task-detail">
      <h1>상세</h1>
      <div className="task-detail-item">
        <strong>Name:</strong> <span>{task.name || "Not set"}</span>
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
        <textarea
          name="memo"
          value={memo}
          onChange={handleInputChange}
          onBlur={handleInputBlur} // 입력이 끝나면 onBlur 이벤트가 발생합니다.
        />
      </div>
    </div>
  );
};
