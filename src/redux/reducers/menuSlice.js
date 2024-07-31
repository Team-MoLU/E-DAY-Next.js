import { createSlice } from "@reduxjs/toolkit";

const menuSlice = createSlice({
  name: "menu",
  initialState: {
    activeContent: "home",
    searchString: "",
  },
  reducers: {
    setMenu: (state, action) => {
      state.activeContent = action.payload;
    },
    setSearchString: (state, action) => {
      state.searchString = action.payload;
    },
  },
});

export const { setMenu, setSearchString } = menuSlice.actions;
export default menuSlice.reducer;
