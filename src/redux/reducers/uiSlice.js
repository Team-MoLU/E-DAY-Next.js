import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    sidebar: {
      isOpen: false,
      activeContent: null,
    },
  },
  reducers: {
    toggleSidebar: (state) => {
      state.sidebar.isOpen = !state.sidebar.isOpen;
    },
    setSidebarContent: (state, action) => {
      state.sidebar.activeContent = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarContent } = uiSlice.actions;
export default uiSlice.reducer;
