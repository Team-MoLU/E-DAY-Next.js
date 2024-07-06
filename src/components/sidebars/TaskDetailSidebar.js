import React, { useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateTask, setSelectedTask } from "@/redux/reducers/taskSlice";
import DatePicker from "react-datepicker";

const TaskDetailSidebar = () => {
  const dispatch = useDispatch();
  const selectedTask = useSelector((state) => state.tasks.selectedTask);

  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      if (selectedTask) {
        const updatedTask = { ...selectedTask, [name]: value };
        dispatch(setSelectedTask(updatedTask));
        dispatch(
          updateTask({
            section: "root",
            path: selectedTask.path,
            updatedTask: updatedTask,
          })
        );
      }
    },
    [dispatch, selectedTask]
  );

  const handlePriorityClick = useCallback(() => {
    if (selectedTask) {
      const newPriority = (selectedTask.priority + 1) % 4;
      const updatedTask = { ...selectedTask, priority: newPriority };
      dispatch(setSelectedTask(updatedTask));
      dispatch(
        updateTask({
          section: "root",
          path: selectedTask.path,
          updatedTask: updatedTask,
        })
      );
    }
  }, [dispatch, selectedTask]);

  const handleDateRangeChange = useCallback(
    (update) => {
      if (selectedTask) {
        const updatedTask = {
          ...selectedTask,
          startDate: update[0] ? formatDate(update[0]) : null,
          endDate: update[1] ? formatDate(update[1]) : null,
        };
        dispatch(setSelectedTask(updatedTask));
        dispatch(
          updateTask({
            section: "root",
            path: selectedTask.path,
            updatedTask: updatedTask,
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
        <div>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={selectedTask.name}
            onChange={handleInputChange}
            onBlur={handleInputChange}
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
            onBlur={handleInputChange}
          />
        </div>
      </>
    );
  }, [
    selectedTask,
    handleInputChange,
    handlePriorityClick,
    handleDateRangeChange,
  ]);

  return <div className="task-detail">{content}</div>;
};

export default React.memo(TaskDetailSidebar);
