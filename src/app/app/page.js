"use client";
import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  initTasks,
  selectTasksStatus,
  selectTasksError,
  addTask,
  getTaskByPath,
  setSelectedTask,
  updateTask,
} from "@/redux/reducers/taskSlice";
import { setSidebarContent, toggleSidebar } from "@/redux/reducers/uiSlice";
import Sidebar from "../../components/Sidebar";
import { v4 as uuidv4 } from "uuid";
import { useDrop } from "react-dnd";
import { useRouter } from "next/navigation";
import LoadingSpinner from '../../components/LoadingSpinner';

export default function HomePage() {
  // task data 관련
  const dispatch = useDispatch();
  const router = useRouter();
  const [newTaskName, setNewTaskName] = useState("");
  const [todayTaskList, setTodayTaskList] = useState([]);
  const status = useSelector(selectTasksStatus);
  const error = useSelector(selectTasksError);

  useEffect(() => {
    dispatch(initTasks({}));
  }, [dispatch]);

  const data = useSelector((state) => state.tasks.root);

  console.log("data::");
  console.log(data);

  // data 변경 시, today task list refresh
  useEffect(() => {
    const isTodayWithinRange = (startDate, endDate) => {
      const today = new Date().toISOString().split("T")[0]; // 'YYYY-MM-DD' 형식의 오늘 날짜
      return startDate && endDate && startDate <= today && endDate >= today;
    };

    const findTasksWithinDateRange = (task, path = []) => {
      const result = [];

      if (isTodayWithinRange(task.startDate, task.endDate)) {
        const todayTask = {
          ...task,
          path: path,
        };
        result.push(todayTask);
      }

      if (task.children && task.children.length > 0) {
        task.children.forEach((child, index) => {
          result.push(...findTasksWithinDateRange(child, path.concat(index)));
        });
      }

      return result;
    };

    const tasksWithinDateRange = findTasksWithinDateRange(data);
    setTodayTaskList(tasksWithinDateRange);
  }, [data]);

  /**
   * 새로운 task를 추가하는 함수
   */
  const handleAddTask = (e) => {
    e.preventDefault(); // Prevent the default form submission
    if (newTaskName.trim()) {
      const todayString = new Date().toISOString().split("T")[0];
      const newTask = {
        id: uuidv4(), // Generate UUID for id
        name: newTaskName,
        memo: "", // Initial memo is empty
        startDate: todayString,
        endDate: todayString,
        priority: 0, // Initial priority is 0
        check: false, // Initial check is false
        children: [], // Initialize with empty children array
      };

      dispatch(
        addTask({
          section: data.name,
          path: [],
          newTask: newTask,
        })
      );

      setNewTaskName(""); // Clear input after adding
    }
  };

  /**
   * TodayTask 의 체크를 클릭했을 때, 체크 값을 toggle 하는 함수
   * @param {*} task
   */
  const toggleTodayTaskCheck = (task) => {
    let { path, ...updatedTask } = task;
    updatedTask = { ...updatedTask, check: !task.check };

    dispatch(
      updateTask({
        section: data.name,
        path: path,
        updatedTask: updatedTask,
      })
    );
  };

  /**
   * TodoTask 를 더블클릭했을 때, 해당 task의 리스트뷰로 이동하는 함수
   * @param {*} task
   */
  const handleTodayTaskDoubleClick = (task) => {
    dispatch(setSelectedTask(task));
    router.push(`app/task/`);
  };

  // sidebar 관련
  const {
    isOpen: sidebarIsOpen,
    activeContent: sidebarActiveContent,
    width: sidebarWidth,
  } = useSelector((state) => state.ui.sidebar);

  // Drag and Drop 관련
  const handleDrop = useCallback(
    (item) => {
      let updatedTask = getTaskByPath(data, item.path);
      const todayString = new Date().toISOString().split("T")[0];
      updatedTask = {
        ...updatedTask,
        startDate: todayString,
        endDate: todayString,
      };

      dispatch(
        updateTask({
          section: item.section,
          path: item.path,
          updatedTask: updatedTask,
        })
      );
    },
    [data.name, dispatch]
  );

  const [, drop] = useDrop(
    () => ({
      accept: "ExploreItem",
      drop: handleDrop,
    }),
    [handleDrop]
  );

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  if (status === 'failed') {
    return <div>에러: {error}</div>;
  }

  // view return
  return (
    <div className="task-page" ref={drop}>
      <div
        className="main-view"
        style={{
          width: sidebarIsOpen ? `calc(100% - ${sidebarWidth}px)` : "100%",
        }}
      >
        <div className="main-view-content">
          {/* 리스트뷰 버튼 */}
          <button
            onClick={() => {
              router.push(`app/task/`);
            }}
          >
            리스트뷰
          </button>
          {/* 트리뷰 버튼 */}
          <button
            onClick={() => {
              router.push(`app/tree-view/`);
            }}
          >
            트리뷰
          </button>
          {/* 탐색 버튼 */}
          <button
            onClick={() => {
              dispatch(setSidebarContent("explore"));
              // side view가 꺼져있으면 켜기
              if (sidebarIsOpen === false) {
                dispatch(toggleSidebar());
              }
              // side view 가 켜져있고, 이미 explore 이면, 끄기
              else if (sidebarActiveContent === "explore") {
                dispatch(toggleSidebar());
              }
            }}
          >
            탐색
          </button>
          <div>
            <h1>오늘 할 일</h1>
            {/* 오늘 할 일의 List */}
            <ul>
              {todayTaskList.map((task, index) => (
                <li
                  key={"todayTask" + index}
                  className="task-item"
                  onDoubleClick={() => {
                    handleTodayTaskDoubleClick(task);
                  }}
                >
                  <input
                    type="checkbox"
                    checked={task.check}
                    onClick={(e) => e.stopPropagation()}
                    onDoubleClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      toggleTodayTaskCheck(task);
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
                placeholder="새로운 오늘 할 일"
              />
              <button type="submit">추가</button>
            </form>
          </div>
        </div>
      </div>
      {sidebarIsOpen && <Sidebar />}
    </div>
  );
}
