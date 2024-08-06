// calendarTasksSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';

const DOMAIN_URI = process.env.NEXT_PUBLIC_DOMAIN_URI;

export const fetchTasksByDate = createAsyncThunk(
  'calendarTasks/fetchTasksByDate',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${DOMAIN_URI}/api/v1/tasks`, {
        params: { startDate, endDate },
        withCredentials: true
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);
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

const calendarTasksSlice = createSlice({
  
  name: 'calendarTasks',
  initialState: {
    tasks: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
  },
  // reducers 섹션은 제거했습니다. 필요한 경우 기존의 리듀서를 여기에 추가할 수 있습니다.
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasksByDate.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTasksByDate.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tasks = action.payload;
      })
      .addCase(fetchTasksByDate.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export default calendarTasksSlice.reducer;

// 선택자 함수들
export const selectAllCalendarTasks = state => state.calendarTasks.tasks;
export const selectCalendarTasksStatus = state => state.calendarTasks.status;
export const selectCalendarTasksError = state => state.calendarTasks.error;