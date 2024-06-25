"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { RoutesList } from "../../../components/RoutesList";
import { useRouter } from "next/navigation";

export default function TaskPage(props) {
  const [task, setTask] = useState({});
  const [routes, setRoutes] = useState([]);
  const [subtasks, setSubtasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState("");
  const router = useRouter();

  const fetchTaskData = async () => {
    // task fetch
    fetch("http://localhost:8080/api/v1/tasks/" + props.params.id)
      .then((resp) => resp.json())
      .then((result) => {
        setTask(result);
      });
    // subtasks fetch
    fetch("http://localhost:8080/api/v1/tasks/" + props.params.id + "/subtasks")
      .then((resp) => resp.json())
      .then((result) => {
        setSubtasks(result.taskList);
      });
    // routes fetch
    fetch("http://localhost:8080/api/v1/tasks/" + props.params.id + "/routes")
      .then((resp) => resp.json())
      .then((result) => {
        result.routes.unshift({ taskId: "", name: "root" });
        setRoutes(result.routes);
      });
  };

  useEffect(() => {
    fetchTaskData();
  }, [props.params.id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskName.trim()) {
      alert("할 일을 입력해주세요.");
      return;
    }
    try {
      const response = await fetch("http://localhost:8080/api/v1/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parentId: props.params.id,
          name: newTaskName.trim(),
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to create task");
      }
      setNewTaskName("");
      await fetchTaskData();
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTask({ ...task, [name]: value });
  };

  /**
   * 현재 task를 삭제하고, 부모 task로 이동하는 함수
   * @param {*} taskId
   * @param {*} parentId
   */
  const handleDeleteTask = async (taskId, parentId) => {
    try {
      // 삭제 API 호출
      const response = await fetch(
        "http://localhost:8080/api/v1/tasks/delete",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            taskId: taskId,
            cascade: true,
          }),
        }
      );
      // 응답이 성공적인지 확인 후 처리
      if (!response.ok) {
        throw new Error("Failed to delete task");
      }
      // 부모 task의 URL로 클라이언트 사이드에서 이동
      router.push("/task/" + parentId);
      // 추가적인 작업 수행 (예: 태스크 목록 재로딩 등)
      await fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleCheckboxChange = async (currentTask) => {
    setSubtasks((prevSubtasks) =>
      prevSubtasks.map((task) =>
        task.taskId === currentTask.taskId
          ? { ...task, check: !task.check }
          : task
      )
    );
    // // API 로 백엔드에게 check 값 변경 알림
    // try {
    //   const response = await fetch("http://localhost:8080/api/v1/tasks", {
    //     method: "PATCH",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       taskId: currentTask.taskId,
    //       check: !currentTask.check,
    //     }),
    //   });
    //   if (!response.ok) {
    //     throw new Error("Failed to create task");
    //   }
    //   await fetchTasks();
    // } catch (error) {
    //   console.error("Error changing task check:", error);
    // }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    setMainViewWidth(650);
  };

  const sidebarRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [mainViewWidth, setMainViewWidth] = useState(650);

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
          <RoutesList routes={routes} />
          <input type="checkbox" defaultChecked={task.check} />
          <input
            type="text"
            name="name"
            value={task.name}
            onChange={handleInputChange}
          />
          <br />
          <button
            onClick={() =>
              handleDeleteTask(task.taskId, routes[routes.length - 2].taskId)
            }
          >
            삭제
          </button>
          <button onClick={toggleSidebar}>
            {isSidebarOpen ? "상세 끄기" : "상세 보기"}
          </button>
          {subtasks.length === 0 ? (
            <p>하위 할 일이 없습니다.</p>
          ) : (
            <ul>
              {subtasks.map((subtask) => (
                <li
                  key={subtask.taskId}
                  onContextMenu={(e) => handleContextMenu(e, subtask.taskId)}
                  className="task-item"
                  onClick={() =>
                    (window.location.href = "/task/" + subtask.taskId)
                  }
                >
                  <input
                    type="checkbox"
                    checked={task.check}
                    onClick={(e) => e.stopPropagation()} // 체크박스 클릭 시 이벤트 전파 막기
                    onChange={(e) => {
                      handleCheckboxChange(task);
                    }}
                  />
                  <span>{subtask.name}</span>
                </li>
              ))}
            </ul>
          )}
          <form onSubmit={handleCreateTask}>
            <input
              type="text"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              placeholder="새로운 할 일"
            />
            <button type="submit">추가</button>
          </form>
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
          <TaskDetail task={task} onTaskChange={setTask} />
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

  const handleSave = async () => {
    // try {
    //   // 서버에 PATCH 요청 보내기
    //   const response = await fetch(`/api/task/${task.taskId}`, {
    //     method: 'PATCH',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(task),
    //   });
    //   if (!response.ok) {
    //     throw new Error('Network response was not ok');
    //   }
    //   const result = await response.json();
    //   console.log('API response:', result);
    //   alert('Task updated successfully');
    // } catch (error) {
    //   console.error('Error updating task:', error);
    //   alert('Failed to update task');
    // }
  };

  return (
    <div className="task-detail">
      <h1>Task Detail</h1>
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
