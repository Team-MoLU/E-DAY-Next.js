import { createSlice } from "@reduxjs/toolkit";

const getInitialSidebarWidth = () => {
  if (typeof window !== "undefined") {
    return Math.min(300, window.innerWidth - 650);
  }
  return 300; // 기본값 설정
};

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    sidebar: {
      isOpen: false,
      activeContent: null,
      width: getInitialSidebarWidth(),
      isResizing: false,
    },
    treeFilter: {
      searchTerm: "",
      selectedRoots: [],
      showRootsWithChildren: true,
      showCompletedTasks: false,
    },
  },
  reducers: {
    toggleSidebar: (state) => {
      // sidebar가 꺼져있는 상태에서 키려고 할 때,
      if (state.sidebar.isOpen === false) {
        // width가 300(min) 보다 작은 값이었다면,
        if (state.sidebar.width < 300) {
          state.sidebar.width = getInitialSidebarWidth();
        }
      }
      state.sidebar.isOpen = !state.sidebar.isOpen;
    },
    setSidebarContent: (state, action) => {
      state.sidebar.activeContent = action.payload;
    },
    setSidebarWidth: (state, action) => {
      state.sidebar.width = action.payload;
    },
    setIsResizing: (state, action) => {
      state.sidebar.isResizing = action.payload;
    },
    setTreeFilter: (state, action) => {
      const newFilter = {};
      for (const [key, value] of Object.entries(action.payload)) {
        if (
          typeof value === "string" ||
          typeof value === "boolean" ||
          Array.isArray(value)
        ) {
          newFilter[key] = value;
        } else {
          console.warn(
            `Invalid value type for treeFilter.${key}. Ignoring this field.`
          );
        }
      }
      state.treeFilter = { ...state.treeFilter, ...newFilter };
    },
  },
});

export const {
  toggleSidebar,
  setSidebarContent,
  setSidebarWidth,
  setIsResizing,
  setTreeFilter,
} = uiSlice.actions;
export default uiSlice.reducer;
