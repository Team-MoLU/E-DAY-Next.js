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
  },
  reducers: {
    toggleSidebar: (state) => {
      state.sidebar.isOpen = !state.sidebar.isOpen;
      if (state.sidebar.isOpen) {
        state.sidebar.width = getInitialSidebarWidth();
      }
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
  },
});

export const {
  toggleSidebar,
  setSidebarContent,
  setSidebarWidth,
  setIsResizing,
} = uiSlice.actions;
export default uiSlice.reducer;
