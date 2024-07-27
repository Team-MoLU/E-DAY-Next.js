import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  primaryColor: "#6A76FB",
};

export const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setPrimaryColor: (state, action) => {
      state.primaryColor = action.payload;
    },
  },
});

export const { setPrimaryColor } = themeSlice.actions;

export default themeSlice.reducer;
