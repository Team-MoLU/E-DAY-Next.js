import React, { useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateTask, setSelectedTask } from "@/redux/reducers/taskSlice";

const TaskDetailSidebar = () => {
  const dispatch = useDispatch();
  const selectedTask = useSelector((state) => state.tasks.selectedTask);
  const isSidebarOpen = useSelector((state) => state.ui.sidebar.isOpen);

  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      if (selectedTask) {
        dispatch(setSelectedTask({ ...selectedTask, [name]: value }));
      }
    },
    [dispatch, selectedTask]
  );

  const handleSave = useCallback(() => {
    if (selectedTask) {
      dispatch(
        updateTask({
          section: "root",
          path: [], // TODO: Implement correct path logic
          updatedTask: selectedTask,
        })
      );
    }
  }, [dispatch, selectedTask]);

  const content = useMemo(() => {
    if (!selectedTask) {
      return <div>선택된 태스크가 없습니다.</div>;
    }

    return (
      <>
        <h2>Task Details</h2>
        <div>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={selectedTask.name}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Memo:</label>
          <textarea
            name="memo"
            value={selectedTask.memo || ""}
            onChange={handleInputChange}
          />
        </div>
        <button onClick={handleSave}>Save</button>
      </>
    );
  }, [selectedTask, handleInputChange, handleSave]);

  if (!isSidebarOpen) return null;

  return <div className="task-detail">{content}</div>;
};

export default React.memo(TaskDetailSidebar);
