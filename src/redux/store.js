// store.js
import { configureStore } from "@reduxjs/toolkit";
import taskReducer from "../redux/reducers/taskSlice"; // taskSlice.js에서 export한 reducer를 import
import uiReducer from "./reducers/uiSlice";
import themeReducer from "./reducers/themeSlice";
import menuReducer from "./reducers/menuSlice";

const store = configureStore({
  reducer: {
    tasks: taskReducer,
    ui: uiReducer,
    theme: themeReducer,
    menu: menuReducer,
    // 다른 reducer들도 여기에 추가할 수 있습니다.
  },
});

export default store;
