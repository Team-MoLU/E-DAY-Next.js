'use client';

import { getDaysInMonth, subMonths, addMonths, format } from 'date-fns';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import com from "@/lib/common/common_fn"
import {
  addTask,
  deleteTask,
  getTaskByPath,
  updateTask,
} from "@/redux/reducers/taskSlice";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { v4 as uuidv4 } from 'uuid';


const DATE_MONTH_FIXER = 1;
const CALENDER_LENGTH = 42;
const DEFAULT_TRASH_VALUE = 0;
const DAY_OF_WEEK = 7;
const DAY_LIST = ['일', '월', '화', '수', '목', '금', '토'];

const useCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const totalMonthDays = getDaysInMonth(currentDate);

  const preMonthDate = subMonths(currentDate, 1);
  const preMonthLastDate = new Date(preMonthDate.getFullYear(), preMonthDate.getMonth()+1,0).getDate(); 

  const nextMonthDate = addMonths(currentDate, 1);
  
  const prevDayList = Array.from({
    length: Math.max(0, new Date(currentDate.getFullYear(),currentDate.getMonth(),1).getDay()),
  }).map((value, index, array) => preMonthLastDate-index).reverse();
  
  const currentDayList = Array.from({ length: totalMonthDays }).map(
    (_, i) => i + 1,
  );
  
  const nextDayList = Array.from({
    length: CALENDER_LENGTH - currentDayList.length - prevDayList.length,
  }).map((value, index, array) => index+1);
  
  const CalendarList = [];

  for(var idx=0; idx<prevDayList.length; idx++){
    CalendarList.push({"year":preMonthDate.getFullYear(),"month":preMonthDate.getMonth()+1,"day":prevDayList.at(idx)});
  }

  for(var idx=0; idx<currentDayList.length; idx++){
    CalendarList.push({"year":currentDate.getFullYear(),"month":currentDate.getMonth()+1,"day":currentDayList.at(idx)});
  }

  for(var idx=0; idx<nextDayList.length; idx++){
    CalendarList.push({"year":nextMonthDate.getFullYear(),"month":nextMonthDate.getMonth()+1,"day":nextDayList.at(idx)});
  }
  
  const weekCalendarList = CalendarList.reduce(
    (acc, cur, idx) => {
      const chunkIndex = Math.floor(idx / DAY_OF_WEEK);
      if (!acc[chunkIndex]) {
        acc[chunkIndex] = [];
      }
      acc[chunkIndex].push(cur);
      return acc;
    },
    [],
  );
  
  return {
    weekCalendarList: weekCalendarList,
    currentDate: currentDate,
    setCurrentDate: setCurrentDate,
  };
};

export default function CalendarPage() {
  const calendar = useCalendar();
  const [select, setSelect] = useState([]);
  const [selCurDate, setSelCurDate] = useState({});
  const dispatch = useDispatch();

  const data = useSelector((state) => state.tasks.root);

  // currentTask를 제거하고 대신 getTasksForDate 함수를 사용
  const [path, setPath] = useState([]);
  const [newTaskName, setNewTaskName] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);
  const [hoverDate, setHoverDate] = useState(null);

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

  const getTasksForDate = (date) => {
    const dateString = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
    const currentDate = new Date(dateString);

    const findTasksRecursively = (task) => {
      let tasks = [];
      const startDate = new Date(task.startDate);
      const endDate = new Date(task.endDate);

      if (currentDate >= startDate && currentDate <= endDate) {
        tasks.push(task);
      }

      if (task.children) {
        task.children.forEach(childTask => {
          tasks = tasks.concat(findTasksRecursively(childTask));
        });
      }

      return tasks;
    };

    return findTasksRecursively(data);
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTaskName.trim()) {
      const newTask = {
        id: uuidv4(),
        name: newTaskName,
        memo: "",
        startDate: format(new Date(selCurDate.year, selCurDate.month - 1, selCurDate.day), 'yyyy-MM-dd'),
        endDate: format(new Date(selCurDate.year, selCurDate.month - 1, selCurDate.day), 'yyyy-MM-dd'),
        priority: 0,
        check: false,
        children: [],
      };

      dispatch(
        addTask({
          section: data.name,
          path: [],
          newTask: newTask,
        })
      );

      setNewTaskName("");
      setShowAddTask(false);
    }
  };

  const handleUpdateTask = (updatedTask) => {
    const updateTaskRecursively = (tasks) => {
      return tasks.map(task => {
        if (task.id === updatedTask.id) {
          return { ...task, ...updatedTask };
        }
        if (task.children) {
          return { ...task, children: updateTaskRecursively(task.children) };
        }
        return task;
      });
    };
  
    const updatedChildren = updateTaskRecursively(data.children);
    
    dispatch(
      updateTask({
        section: "root",
        path: [],
        updatedTask: { ...data, children: updatedChildren },
      })
    );
  };
  
  const handleDeleteTask = (currentTaskId) => {
    const deleteTaskRecursively = (tasks) => {
      return tasks.filter(task => {
        if (task.id === currentTaskId) {
          return false; // Remove the current task
        }
        if (task.children) {
          // Use recursion to delete from children array
          const updatedChildren = deleteTaskRecursively(task.children);
          return { ...task, children: updatedChildren };
        }
        return true;
      });
    };
  
    const updatedTasks = deleteTaskRecursively([...data.children]); // Copy data.children to avoid mutating the original
  
    dispatch(
      updateTask({
        section: "root",
        path: [],
        updatedTask: { ...data, children: updatedTasks },
      })
    );
  };
  
  

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
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <button onClick={() => calendar.setCurrentDate(subMonths(calendar.currentDate, 1))}>
              이전달로 이동하기
            </button>
            <h2>{calendar.currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
            <button onClick={() => calendar.setCurrentDate(addMonths(calendar.currentDate, 1))}>
              다음달로 이동하기
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginTop: '20px' }}>
            {DAY_LIST.map(day => (
              <div key={day} style={{ textAlign: 'center', fontWeight: 'bold' }}>{day}</div>
            ))}
            {calendar.weekCalendarList.flat().map((date, index) => (
              <div
                key={index}
                style={{ 
                  position: 'relative',
                  textAlign: 'center', 
                  padding: '10px',
                  border: '1px solid #ddd',
                  backgroundColor: date.month-1 != calendar.currentDate.getMonth() ? '#f0f0f0' : (JSON.stringify(selCurDate) == JSON.stringify(date) && isSidebarOpen == true ? '#3b82f6' : 'white'),
                  color: JSON.stringify(selCurDate) == JSON.stringify(date) && isSidebarOpen == true ? 'white' : 'black',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  height: '80px',
                  overflow: 'hidden'
                }}
                onMouseEnter={() => setHoverDate(date)}
                onMouseLeave={() => setHoverDate(null)}
              >
                <div 
                  onClick={() => {
                    if (!isSidebarOpen || JSON.stringify(selCurDate) !== JSON.stringify(date)) {
                      toggleSidebar();
                    }
                    setSelCurDate(date);
                    setPath(path.slice(0, index + 1));
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                  }}
                >
                  <div style={{display: 'flex', justifyContent: 'flex-start', flexDirection:'row-reverse', width:'100%'}}>
                    <div style={{ marginLeft:'auto', marginBottom: '5px'}}>{date.day !== 0 ? date.day : ''}</div>
                    <div style={{marginRight:'auto', display: 'flex', justifyContent: 'flex-start', flexDirection:'column', textAlign:'left'}}>
                    {getTasksForDate(date).slice(0,3).map((task, index) => (
                      <div key={task.id} className="task" style={{ fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {index === 2 ? '...' : task.name}
                      </div>
                    ))}
                    </div>
                  </div>
                </div>
                {hoverDate && JSON.stringify(hoverDate) === JSON.stringify(date) && (
                  <button
                    style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      background: 'none',
                      border: 'none',
                      fontSize: '20px',
                      cursor: 'pointer',
                      color: 'black',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelCurDate(date);
                      setShowAddTask(true);
                      if (!isSidebarOpen) {
                        toggleSidebar();
                      }
                    }}
                  >
                    +
                  </button>
                )}
              </div>
            ))}
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
        <TaskDetail 
          tasks={getTasksForDate(selCurDate)}
          selDate={selCurDate}
          onTaskChanged={handleUpdateTask}
          onTaskDeleted={handleDeleteTask}
        />
          {showAddTask && (
            <div style={{ marginTop: 'auto', padding: '20px' }}>
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
          )}
        </div>
      )}

<style jsx>
  {`
        .task-page {
          display: flex;
          height: 100vh;
        }

        .main-view {
          flex-grow: 1;
          overflow-y: auto;
          padding: 20px;
          transition: width 0.3s ease;
        }

        .main-view-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .main-sub-view-resizer {
          width: 5px;
          background: #ccc;
          cursor: col-resize;
        }

        .sub-view {
          background: #f0f0f0;
          padding: 20px;
          overflow-y: auto;
        }

        .task-detail {
          background: white;
          border: 1px solid #ddd;
          border-radius: 5px;
          padding: 15px;
          margin-bottom: 15px;
        }

        .task-detail-item {
          margin-bottom: 10px;
        }

        button {
          margin-right: 10px;
          padding: 5px 10px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 3px;
          cursor: pointer;
        }

        button:hover {
          background: #2563eb;
        }

        input, textarea {
          width: 100%;
          padding: 5px;
          margin-top: 5px;
        }

        :global(.react-datepicker-wrapper) {
          width: 100%;
        }
      `}</style>
    </div>
  );
}

const TaskDetail = ({ tasks, selDate, onTaskChanged, onTaskDeleted }) => {
  const [editingTaskId, setEditingTaskId] = useState(null);

  const handleEditClick = (taskId) => {
    setEditingTaskId(taskId);
  };

  const handleSaveClick = (updatedTask) => {
    onTaskChanged(updatedTask);
    setEditingTaskId(null);
  };

  return (
    <div>
      <h1>상세</h1>
      <h1>{selDate.year + "-" + selDate.month + "-" + selDate.day}</h1>
      {tasks.map((t) => (
        <div key={t.id} className="task-detail">
          {editingTaskId === t.id ? (
            <EditableTaskDetail 
              task={t} 
              onSave={handleSaveClick}
              onCancel={() => setEditingTaskId(null)}
            />
          ) : (
            <ReadOnlyTaskDetail 
              task={t} 
              onEdit={() => handleEditClick(t.id)}
              onDelete={() => onTaskDeleted(t.id)}
            />
          )}
        </div>
      ))}
    </div>
  );
};

const ReadOnlyTaskDetail = ({ task, onEdit, onDelete }) => (
  <>
    <div className="task-detail-item">
      <strong>Name:</strong> <span>{task.name || "Not set"}</span>
    </div>
    <div className="task-detail-item">
      <strong>Date Range:</strong> {task.startDate} to {task.endDate}
    </div>
    <div className="task-detail-item">
      <strong>Priority:</strong> {task.priority}
    </div>
    <div className="task-detail-item">
      <strong>Memo:</strong> {task.memo}
    </div>
    <button onClick={onEdit}>✏️ Edit</button>
    <button onClick={onDelete}>🗑️ Delete</button>
  </>
);

const EditableTaskDetail = ({ task, onSave, onCancel }) => {
  const [editedTask, setEditedTask] = useState({ ...task });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedTask(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(editedTask);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="task-detail-item">
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={editedTask.name}
            onChange={handleChange}
          />
        </label>
      </div>
      <div className="task-detail-item">
        <label>
          Start Date:
          <DatePicker
            selected={new Date(editedTask.startDate)}
            onChange={(date) => setEditedTask(prev => ({ ...prev, startDate: format(date, 'yyyy-MM-dd') }))}
          />
        </label>
      </div>
      <div className="task-detail-item">
        <label>
          End Date:
          <DatePicker
            selected={new Date(editedTask.endDate)}
            onChange={(date) => setEditedTask(prev => ({ ...prev, endDate: format(date, 'yyyy-MM-dd') }))}
          />
        </label>
      </div>
      <div className="task-detail-item">
        <label>
          Priority:
          <input
            type="number"
            name="priority"
            value={editedTask.priority}
            onChange={handleChange}
          />
        </label>
      </div>
      <div className="task-detail-item">
        <label>
          Memo:
          <textarea
            name="memo"
            value={editedTask.memo}
            onChange={handleChange}
          />
        </label>
      </div>
      <button type="submit">💾 Save</button>
      <button type="button" onClick={onCancel}>❌ Cancel</button>
    </form>
  );
};