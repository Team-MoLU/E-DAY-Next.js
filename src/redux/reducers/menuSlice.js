import { createSlice } from "@reduxjs/toolkit";

const menuSlice = createSlice({
  name: "menu",
  initialState: {
    activeContent: "home",
    searchString: "",
    searchStringArchive: "",
    searchStringTrash: "",
  },
  reducers: {
    setMenu: (state, action) => {
      state.activeContent = action.payload;
    },
    setSearchString: (state, action) => {
      state.searchString = action.payload;
    },
    setSearchStringArchive: (state, action) => {
      state.searchStringArchive = action.payload;
    },
    setSearchStringTrash: (state, action) => {
      state.searchStringTrash = action.payload;
    },
  },
});

export const {
  setMenu,
  setSearchString,
  setSearchStringArchive,
  setSearchStringTrash,
} = menuSlice.actions;
export default menuSlice.reducer;
