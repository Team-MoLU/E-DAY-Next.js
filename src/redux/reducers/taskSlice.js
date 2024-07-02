// taskSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  root: {
    name: "root",
    children: [
      {
        name: "Child 1",
        children: [{ name: "Grandchild 1" }, { name: "Grandchild 2" }],
      },
      {
        name: "Child 2",
        children: [{ name: "Grandchild 3" }, { name: "Grandchild 4" }],
      },
    ],
  },
  trash: {
    name: "trash",
    children: [
      {
        name: "Child 1",
        children: [{ name: "Grandchild 1" }, { name: "Grandchild 2" }],
      },
      {
        name: "Child 2",
        children: [{ name: "Grandchild 3" }, { name: "Grandchild 4" }],
      },
    ],
  },
  archive: {
    name: "archive",
    children: [
      {
        name: "Child 1",
        children: [{ name: "Grandchild 1" }, { name: "Grandchild 2" }],
      },
      {
        name: "Child 2",
        children: [{ name: "Grandchild 3" }, { name: "Grandchild 4" }],
      },
    ],
  },
};

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    addTask: (state, action) => {
      const { parentPath, newTask } = action.payload;
      const parent = getTaskByPath(state.tasks, parentPath);
      if (parent) {
        if (!parent.children) parent.children = [];
        parent.children.push(newTask);
      }
    },
    updateTask: (state, action) => {
      const { path, updatedProperties } = action.payload;
      const task = getTaskByPath(state.tasks, path);
      if (task) {
        Object.assign(task, updatedProperties);
      }
    },
    // Todo: delete 실제 삭제가 아닌 trash로 이동
    deleteTask: (state, action) => {
      const path = action.payload;
      const parentPath = path.slice(0, -1);
      const parent = getTaskByPath(state.tasks, parentPath);
      if (parent && parent.children) {
        const index = path[path.length - 1];
        parent.children.splice(index, 1);
      }
    },
    moveTask: (state, action) => {
      const { fromPath, toPath } = action.payload;
      const taskToMove = getTaskByPath(state.tasks, fromPath);
      if (taskToMove) {
        // Remove from original location
        deleteTask(state, { payload: fromPath });
        // Add to new location
        const newParent = getTaskByPath(state.tasks, toPath);
        if (newParent) {
          if (!newParent.children) newParent.children = [];
          newParent.children.push(taskToMove);
        }
      }
    },
    // Todo: restoreTask : 휴지통에서 복구
    // Todo: dropTask : 영구 삭제
    // Todo: archiveTask
    // Todo: unarchiveTask
  },
});

// Helper function to get a task by its path in the tree
const getTaskByPath = (root, path) => {
  let current = root;
  for (let i = 0; i < path.length; i++) {
    if (!current.children || !current.children[path[i]]) return null;
    current = current.children[path[i]];
  }
  return current;
};

export const { addTask, updateTask, deleteTask, moveTask } = taskSlice.actions;

export default taskSlice.reducer;
