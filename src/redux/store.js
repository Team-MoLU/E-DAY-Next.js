// store.js
import { configureStore } from "@reduxjs/toolkit";
import taskReducer from "../redux/reducers/taskSlice"; // taskSlice.js에서 export한 reducer를 import

const store = configureStore({
  reducer: {
    tasks: taskReducer,
    // 다른 reducer들도 여기에 추가할 수 있습니다.
  },
});

export default store;
