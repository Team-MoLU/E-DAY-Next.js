// taskSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';

const DOMAIN_URI = process.env.NEXT_PUBLIC_DOMAIN_URI;

const initialState = {
  root:{},
  trash:{},
  archive:{}
};

export const initTasks = createAsyncThunk(
  'tasks/initTasks',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${DOMAIN_URI}/api/v1/tasks/rams/init`, {
        withCredentials: true
      });
      console.log("Response data:", response.data);

      return response.data;
    } catch (error) {
      console.error("Fetch error:", error);
      
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
        console.error("Error headers:", error.response.headers);
        return rejectWithValue(`Server error: ${error.response.status}`);
      } else if (error.request) {
        console.error("No response received:", error.request);
        return rejectWithValue("No response from server");
      } else {
        console.error("Error setting up request:", error.message);
        return rejectWithValue(error.message);
      }
    }
  }
);

export const getTaskByPath = (tree, path) => {
  let currentNode = tree;
  for (let index of path) {
    if (!currentNode.children || !currentNode.children[index]) {
      return null; // Invalid path
    }
    currentNode = currentNode.children[index];
  }
  return currentNode;
};

const updateTaskAtPath = (state, path, updatedTask) => {
  let current = state;
  for (let i = 0; i < path.length; i++) {
    if (current.children && current.children[path[i]]) {
      current = current.children[path[i]];
    } else {
      return; // Path not found, do nothing
    }
  }
  if (current) {
    // Update task properties
    Object.assign(current, updatedTask);
  }

  let taskDto = {
    "taskId":current.id,
    "name":current.name,
    "memo":current.memo,
    "startDate":current.startDate,
    "endDate":current.endDate,
    "priority": current.priority,
    "check": current.check
  };

  taskDto.name = updatedTask.name;
  taskDto.memo = updatedTask.memo;
  taskDto.startDate = new Date(updatedTask.startDate);
  taskDto.endDate = new Date(updatedTask.endDate);
  taskDto.priority = updatedTask.priority;
  taskDto.check = updatedTask.check;

  axios.patch(`${DOMAIN_URI}/api/v1/tasks`, 
    taskDto,
    { "Content-Type": "application/json", withCredentials: true },
    ).then((res) => {
      console.log(res);
    })
    .catch((error) => {
      console.log(error);
    });
};

const addTaskAtPath = (state, path, newTask) => {
  let current = state;
  for (let i = 0; i < path.length; i++) {
    if (current.children && current.children[path[i]]) {
      current = current.children[path[i]];
    } else {
      return; // Path not found, do nothing
    }
  }
  if (!current.children) current.children = [];
  current.children.push(newTask);

  let taskDto = {
      "parentId":"",
      "name":"",
      "memo":"",
      "startDate":"",
      "endDate":"",
      "priority": 1
    };

  if(current.id == "root"){
    taskDto.parentId = "0";
  }else{
    taskDto.parentId = current.id;
  }

  taskDto.name = newTask.name;
  taskDto.memo = newTask.memo;
  taskDto.startDate = newTask.startDate;
  taskDto.endDate = newTask.endDate;
  taskDto.priority = newTask.priority;

  axios.post(`${DOMAIN_URI}/api/v1/tasks`, 
    taskDto,
    { "Content-Type": "application/json", withCredentials: true },
    ).then((res) => {
      console.log(res);
    })
    .catch((error) => {
      console.log(error);
    });

  console.log(">>>>>>>>>>ADD TASK>>>>>>>>>>");
};

const deleteTaskAtPath = (state, path) => {
  let current = state;
  let parent = null;
  let indexToDelete = null;
  for (let i = 0; i < path.length; i++) {
    if (current.children && current.children[path[i]]) {
      parent = current;
      indexToDelete = path[i];
      current = current.children[path[i]];
    } else {
      return; // Path not found, do nothing
    }
  }
  if (parent && indexToDelete !== null) {
    parent.children.splice(indexToDelete, 1);
  }

  let taskDto ={
    "taskId":"",
    "cascade":true
  };

  taskDto.taskId = current.id;

  axios.post(`${DOMAIN_URI}/api/v1/tasks/delete`, 
    taskDto,
    { "Content-Type": "application/json", withCredentials: true },
    ).then((res) => {
      console.log(res);
    })
    .catch((error) => {
      console.log(error);
    });
};

const orderChildren = (children, fromIndex, toIndex) => {
  const updatedChildren = [...children];
  const [movedChild] = updatedChildren.splice(fromIndex, 1);
  updatedChildren.splice(toIndex, 0, movedChild);
  return updatedChildren;
};

const taskSlice = createSlice({
  name: "tasks",
  initialState: {
    ...initialState,
    selectedTask: null,
    selectedArchive: null,
    selectedTrash: null,
    exploredTask: null,
  },

  extraReducers: (builder) => {
    builder
      .addCase(initTasks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(initTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.root = action.payload.taskList.root;
        state.trash = action.payload.taskList.trash;
        state.archive = action.payload.taskList.archive;
      })
      .addCase(initTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },

  reducers: {
    // (Tree에서) task 선택 시 선택된 task 저장
    setSelectedTask: (state, action) => {
      state.selectedTask = action.payload;
    },
    // (Tree에서) archive 선택 시 선택된 archive 저장
    setSelectedArchiveTask: (state, action) => {
      state.selectedArchive = action.payload;
    },
    // (Tree에서) trash 선택 시 선택된 trash 저장
    setSelectedTrashTask: (state, action) => {
      state.selectedTrash = action.payload;
    },
    // (Explore에서) task 선택 시 선택된 task 저장
    setExploredTask: (state, action) => {
      state.exploredTask = action.payload;
    },
    // 새로운 task 추가
    addTask: (state, action) => {
      const { section, path, newTask } = action.payload;
      if (state[section]) {
        addTaskAtPath(state[section], path, newTask);
      }
    },
    // tash 속성 update
    updateTask: (state, action) => {
      const { section, path, updatedTask } = action.payload;
      if (state[section]) {
        updateTaskAtPath(state[section], path, updatedTask);
      }
    },
    // task 삭제하여 trash 섹션으로 이동
    deleteTask: (state, action) => {
      const { section, path } = action.payload;
      if (state[section]) {
        const taskToDelete = getTaskByPath(state[section], path);
        addTaskAtPath(state.trash, [], taskToDelete); // Add to trash
        deleteTaskAtPath(state[section], path); // Delete from original location
      }
    },
    // 영구적으로 task를 삭제
    dropTask: (state, action) => {
      const { section, path } = action.payload;
      if (state[section]) {
        deleteTaskAtPath(state[section], path);
      }
    },
    // trash에서 task를 복구
    restoreTask: (state, action) => {
      const { path } = action.payload;
      const taskToRestore = getTaskByPath(state.trash, path);
      if (taskToRestore) {
        addTaskAtPath(state.root, [], taskToRestore); // Add to root
        deleteTaskAtPath(state.trash, path); // Remove from trash
      }
    },
    // task 이동
    moveTask: (state, action) => {
      const { fromSection, fromPath, toSection, toPath } = action.payload;
      if (state[fromSection] && state[toSection]) {
        const taskToMove = getTaskByPath(state[fromSection], fromPath);
        if (taskToMove) {
          addTaskAtPath(state[toSection], toPath, taskToMove); // Add to new location
          deleteTaskAtPath(state[fromSection], fromPath); // Delete from original location
        }
      }
    },
    // task 아카이브 이동
    archiveTask: (state, action) => {
      const { section, path } = action.payload;
      if (state[section]) {
        const taskToArchive = getTaskByPath(state[section], path);
        addTaskAtPath(state.archive, [], taskToArchive); // Add to archive
        deleteTaskAtPath(state[section], path); // Delete from original location
      }
    },
    // tash 아카이브 해제
    unarchiveTask: (state, action) => {
      const { path } = action.payload;
      const taskToUnarchive = getTaskByPath(state.archive, path);
      if (taskToUnarchive) {
        addTaskAtPath(state.root, [], taskToUnarchive); // Add to root
        deleteTaskAtPath(state.archive, path); // Remove from archive
      }
    },
    // task의 하위 task간의 ordering하는 함수
    orderTask: (state, action) => {
      const { section, path, fromIndex, toIndex } = action.payload;
      if (state[section]) {
        const task = getTaskByPath(state[section], path);
        if (task && task.children) {
          task.children = orderChildren(task.children, fromIndex, toIndex);
        }
      }
    },
  },
});

export const {
  setSelectedTask,
  setSelectedArchiveTask,
  setSelectedTrashTask,
  setExploredTask,
  handleNodeClick,
  addTask,
  updateTask,
  deleteTask,
  dropTask,
  restoreTask,
  moveTask,
  archiveTask,
  unarchiveTask,
  orderTask,
} = taskSlice.actions;
export default taskSlice.reducer;
export const selectTasksStatus = state => state.tasks.status;
export const selectTasksError = state => state.tasks.error;
