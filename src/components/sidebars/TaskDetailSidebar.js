import React, { useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateTask, setSelectedTask } from "@/redux/reducers/taskSlice";
import DatePicker from "react-datepicker"; // Make sure to import this

const TaskDetailSidebar = () => {
  const dispatch = useDispatch();
  const selectedTask = useSelector((state) => state.tasks.selectedTask);

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
          path: [],
          updatedTask: selectedTask,
        })
      );
    }
  }, [dispatch, selectedTask]);

  const handlePriorityClick = useCallback(() => {
    if (selectedTask) {
      const newPriority = (selectedTask.priority + 1) % 4;
      dispatch(setSelectedTask({ ...selectedTask, priority: newPriority }));
    }
  }, [dispatch, selectedTask]);

  const handleDateRangeChange = useCallback(
    (update) => {
      if (selectedTask) {
        dispatch(
          setSelectedTask({
            ...selectedTask,
            startDate: update[0] ? formatDate(update[0]) : null,
            endDate: update[1] ? formatDate(update[1]) : null,
          })
        );
      }
    },
    [dispatch, selectedTask]
  );

  const formatDate = (date) => {
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
    return adjustedDate.toISOString().split("T")[0];
  };

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
          <label>Date Range:</label>
          <DatePicker
            selectsRange={true}
            startDate={
              selectedTask.startDate ? new Date(selectedTask.startDate) : null
            }
            endDate={
              selectedTask.endDate ? new Date(selectedTask.endDate) : null
            }
            onChange={handleDateRangeChange}
            dateFormat="yyyy-MM-dd"
            isClearable
            timeZone="UTC"
          />
        </div>
        <div>
          <label>Priority:</label>
          <span
            style={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={handlePriorityClick}
          >
            {selectedTask.priority}
          </span>
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
  }, [
    selectedTask,
    handleInputChange,
    handleSave,
    handlePriorityClick,
    handleDateRangeChange,
  ]);

  return <div className="task-detail">{content}</div>;
};

export default React.memo(TaskDetailSidebar);
