// taskSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  root: {
    name: "root",
    children: [
      {
        id: "910ac833-fcbf-4882-afc5-ae7731c37128",
        name: "Child 1",
        memo: "메모",
        startDate: "",
        endDate: "",
        priority: 1,
        check: true,
        children: [
          {
            id: "b505c3d6-2cc4-4ba7-ae36-aa1c8e53fb31",
            name: "Grandchild 1",
            memo: "",
            startDate: "",
            endDate: "",
            priority: 0,
            check: false,
            children: [],
          },
          {
            id: "c4f91ecf-49e1-4a19-8f3f-30e7c58c8e1e",
            name: "Grandchild 2",
            memo: "",
            startDate: "",
            endDate: "",
            priority: 0,
            check: false,
            children: [],
          },
        ],
      },
      {
        id: "2e7e1767-7d1b-4e44-a7de-0a9e78036e92",
        name: "Child 2",
        memo: "",
        startDate: "",
        endDate: "",
        priority: 0,
        check: false,
        children: [
          {
            id: "4a0d6f50-53a3-4d54-8d75-bcb5a35db72f",
            name: "Grandchild 3",
            memo: "",
            startDate: "",
            endDate: "",
            priority: 0,
            check: false,
            children: [],
          },
          {
            id: "14c17c36-9608-4c26-80a7-2d4e6b6e1018",
            name: "Grandchild 4",
            memo: "",
            startDate: "",
            endDate: "",
            priority: 0,
            check: false,
            children: [],
          },
        ],
      },
    ],
  },
  trash: {
    name: "trash",
    children: [
      {
        id: "c2e10d32-24a1-4966-a2f1-7d6a652a9b69",
        name: "Child 1(deleted)",
        memo: "",
        startDate: "",
        endDate: "",
        priority: 0,
        check: false,
        children: [
          {
            id: "5d482c5b-6e26-4316-a593-1a232d0e2181",
            name: "Grandchild 1(deleted)",
            memo: "",
            startDate: "",
            endDate: "",
            priority: 0,
            check: false,
            children: [],
          },
          {
            id: "8f382b6f-813d-40b1-b8bf-5a1f132eeb05",
            name: "Grandchild 2(deleted)",
            memo: "",
            startDate: "",
            endDate: "",
            priority: 0,
            check: false,
            children: [],
          },
        ],
      },
      {
        id: "7e75a77b-5e1d-4a0e-bdcd-87c55aa6d8a3",
        name: "Child 2(deleted)",
        memo: "",
        startDate: "",
        endDate: "",
        priority: 0,
        check: false,
        children: [
          {
            id: "b69a79d5-d204-48d1-8d2b-05e2e7a7c0a5",
            name: "Grandchild 3(deleted)",
            memo: "",
            startDate: "",
            endDate: "",
            priority: 0,
            check: false,
            children: [],
          },
          {
            id: "7d91fa3c-6154-4b4f-85c4-2ef223c80c79",
            name: "Grandchild 4(deleted)",
            memo: "",
            startDate: "",
            endDate: "",
            priority: 0,
            check: false,
            children: [],
          },
        ],
      },
    ],
  },
  archive: {
    name: "archive",
    children: [
      {
        id: "18f5f8e7-120e-49c8-a2f8-78636c1cfcc6",
        name: "Child 1(archive)",
        memo: "this item has been archived.",
        startDate: "2024-02-07",
        endDate: "2024-07-07",
        priority: 2,
        check: true,
        children: [
          {
            id: "6d49aef0-1448-495c-90a5-2ac9a0c264b8",
            name: "Grandchild 1(archive)",
            memo: "",
            startDate: "",
            endDate: "",
            priority: 0,
            check: false,
            children: [],
          },
          {
            id: "75e7be5b-4bc4-42b1-ae1e-56881e531839",
            name: "Grandchild 2(archive)",
            memo: "",
            startDate: "",
            endDate: "",
            priority: 0,
            check: false,
            children: [],
          },
        ],
      },
      {
        id: "1d2f15f0-7368-4a90-83cc-9674326a4a56",
        name: "Child 2(archive)",
        memo: "",
        startDate: "",
        endDate: "",
        priority: 0,
        check: false,
        children: [
          {
            id: "b8a0e2a8-7bc0-46b0-b724-04e6413a16a3",
            name: "Grandchild 3(archive)",
            memo: "",
            startDate: "",
            endDate: "",
            priority: 0,
            check: false,
            children: [],
          },
          {
            id: "6d75a1c1-d7c7-4a68-9a6c-7c6831045e4e",
            name: "Grandchild 4(archive)",
            memo: "",
            startDate: "",
            endDate: "",
            priority: 0,
            check: false,
            children: [],
          },
        ],
      },
    ],
  },
};

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
};

const taskSlice = createSlice({
  name: "tasks",
  initialState: {
    ...initialState,
    selectedTask: null,
  },
  reducers: {
    // (Tree에서) task 선택 시 선택된 task 저장
    setSelectedTask: (state, action) => {
      state.selectedTask = action.payload;
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
    // Todo: archiveTask
    // Todo: unarchiveTask
  },
});

export const {
  setSelectedTask,
  handleNodeClick,
  addTask,
  updateTask,
  deleteTask,
  dropTask,
  restoreTask,
  moveTask,
} = taskSlice.actions;
export default taskSlice.reducer;
