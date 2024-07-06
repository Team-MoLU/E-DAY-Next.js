import { setSelectedTask } from "@/redux/reducers/taskSlice";
import {
  toggleSidebar,
  setSidebarContent,
  setSidebarWidth,
  setIsResizing,
} from "@/redux/reducers/uiSlice";
import common from "@/lib/common/common_fn";

export const handleNodeClickWithSidebar = (node) => (dispatch, getState) => {
  const { tasks, ui } = getState();
  const isSameNode = common.isEmpty(node)
    ? true
    : tasks.selectedTask && tasks.selectedTask.id === node.id;
  const shouldOpenSidebar = !ui.sidebar.isOpen || isSameNode;

  dispatch(setSelectedTask(node));

  if (shouldOpenSidebar) {
    dispatch(toggleSidebar());
  }

  dispatch(setSidebarContent("taskDetail"));
};

export const startResizing = () => (dispatch) => {
  dispatch(setIsResizing(true));
};

export const stopResizing = () => (dispatch) => {
  dispatch(setIsResizing(false));
};

export const resize = (mainViewWidth) => (dispatch, getState) => {
  const { ui } = getState();
  if (ui.sidebar.isResizing) {
    const sidebarWidth = window.innerWidth - mainViewWidth;
    dispatch(setSidebarWidth(sidebarWidth));
    if (sidebarWidth < 250) {
      dispatch(toggleSidebar());
      dispatch(setIsResizing(false));
    }
  }
};
