// taskSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  root: {
    name: "root",
    children: [
      {
        name: "Child 1",
        children: [
          { name: "Grandchild 1", children: [] },
          { name: "Grandchild 2", children: [] },
        ],
      },
      {
        name: "Child 2",
        children: [
          { name: "Grandchild 3", children: [] },
          { name: "Grandchild 4", children: [] },
        ],
      },
    ],
  },
  trash: {
    name: "trash",
    children: [
      {
        name: "Child 1",
        children: [
          { name: "Grandchild 1", children: [] },
          { name: "Grandchild 2", children: [] },
        ],
      },
      {
        name: "Child 2",
        children: [
          { name: "Grandchild 3", children: [] },
          { name: "Grandchild 4", children: [] },
        ],
      },
    ],
  },
  archive: {
    name: "archive",
    children: [
      {
        name: "Child 1",
        children: [
          { name: "Grandchild 1", children: [] },
          { name: "Grandchild 2", children: [] },
        ],
      },
      {
        name: "Child 2",
        children: [
          { name: "Grandchild 3", children: [] },
          { name: "Grandchild 4", children: [] },
        ],
      },
    ],
  },
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

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    addTask: (state, action) => {
      const { section, path, newTask } = action.payload;
      if (state[section]) {
        addTaskAtPath(state[section], path, newTask);
      }
    },

    // Todo: update
    // Todo: delete 실제 삭제가 아닌 trash로 이동
    // Todo: moveTask
    // Todo: restoreTask : 휴지통에서 복구
    // Todo: dropTask : 영구 삭제
    // Todo: archiveTask
    // Todo: unarchiveTask
  },
});

export const { addTask } = taskSlice.actions;
export default taskSlice.reducer;
