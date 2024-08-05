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
import Sidebar from "../../components/Sidebar";
import { v4 as uuidv4 } from "uuid";
import { useDrop } from "react-dnd";
import { useRouter } from "next/navigation";
import LoadingSpinner from '../../components/LoadingSpinner';
import { setMenu } from "@/redux/reducers/menuSlice";
import Icon from "../../components/Icon";
import common from "@/lib/common/common_fn";

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
  const primaryColor = useSelector((state) => state.theme.primaryColor);

  useEffect(() => {
    dispatch(setMenu("home"));
  }, []);

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
    [data, dispatch]
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
          <div>
            <h1 className="title">오늘 할 일</h1>
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
                  <div className="task-leftItem">
                    <button
                      className="toggleButton"
                      onDoubleClick={(e) => e.stopPropagation()}
                      onClick={() => {
                        toggleTodayTaskCheck(task);
                      }}
                    >
                      {task.check === true ? (
                        <Icon name="check" size={28} color={primaryColor} />
                      ) : (
                        <Icon name="uncheck" size={28} color="#585D6A" />
                      )}
                    </button>
                    <span>{task.name}</span>
                  </div>
                  <span className="task-rightItem">
                    {common.findRouteById(task.id, data).map((r, index) => (
                      <span key={"r" + index}>
                        {index == 0 ? "" : "/"}
                        <span>{index == 0 ? "할 일" : r.name}</span>
                      </span>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
            <div className="pt-40"></div>
            {/* 새로운 할 일 추가 UI */}
            <div
              className="inputSection"
              style={{
                right: sidebarIsOpen
                  ? `calc(40px + ${sidebarWidth}px)`
                  : "40px",
              }}
            >
              <form onSubmit={handleAddTask} className="form">
                <input
                  type="text"
                  value={newTaskName}
                  className="inputField"
                  onChange={(e) => setNewTaskName(e.target.value)}
                  placeholder="할 일을 입력하세요"
                />
                <button type="submit" className="addButton">
                  <Icon name="add" size={24} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      {sidebarIsOpen && <Sidebar />}
    </div>
  );
}
