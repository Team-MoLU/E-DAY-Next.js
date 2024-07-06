import { handleNodeClick, setSelectedTask } from "@/redux/reducers/taskSlice";
import { toggleSidebar, setSidebarContent } from "@/redux/reducers/uiSlice";
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
