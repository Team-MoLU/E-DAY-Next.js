import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateTask, setSelectedTask } from "@/redux/reducers/taskSlice";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function TaskDetailSidebar() {
  const dispatch = useDispatch();
  const selectedTask = useSelector((state) => state.tasks.selectedTask);
  const [name, setName] = useState(""); // name 상태 추가
  const [memo, setMemo] = useState(""); // memo 상태 추가

  useEffect(() => {
    setName(selectedTask.name);
    setMemo(selectedTask.memo);
  }, [selectedTask]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "name") {
      setName(value);
    } else if (name === "memo") {
      setMemo(value); // memo 필드의 입력 값을 memo 상태에 업데이트
    }
  };

  const handleInputBlur = () => {
    const updatedName = name;
    const updatedMemo = memo;

    if (selectedTask) {
      let { path, ...updatedTask } = selectedTask;
      updatedTask = {
        ...updatedTask,
        name: updatedName,
        memo: updatedMemo,
      };
      dispatch(setSelectedTask({ ...updatedTask, path: path }));
      dispatch(
        updateTask({
          section: "root",
          path: path,
          updatedTask: updatedTask,
        })
      );
    }
  };

  const handlePriorityClick = () => {
    if (selectedTask) {
      const newPriority = (selectedTask.priority + 1) % 4;
      let { path, ...updatedTask } = selectedTask;
      updatedTask = { ...updatedTask, priority: newPriority };
      dispatch(setSelectedTask({ ...updatedTask, path: path }));
      dispatch(
        updateTask({
          section: "root",
          path: path,
          updatedTask: updatedTask,
        })
      );
    }
  };

  const handleDateRangeChange = (update) => {
    if (selectedTask) {
      let { path, ...updatedTask } = selectedTask;
      updatedTask = {
        ...updatedTask,
        startDate: update[0] ? formatDate(update[0]) : null,
        endDate: update[1] ? formatDate(update[1]) : null,
      };
      dispatch(setSelectedTask({ ...updatedTask, path: path }));
      dispatch(
        updateTask({
          section: "root",
          path: path,
          updatedTask: updatedTask,
        })
      );
    }
  };

  const formatDate = (date) => {
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
    return adjustedDate.toISOString().split("T")[0];
  };

  if (!selectedTask) {
    return <div>선택된 태스크가 없습니다.</div>;
  }

  if (selectedTask.name === "root") {
    return (
      <div>
        <label>Name:</label>
        <input type="text" name="name" value={name} />
      </div>
    );
  }

  return (
    <>
      <div>
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={name}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
        />
      </div>
      <div>
        <label>Date Range:</label>
        <DatePicker
          selectsRange={true}
          startDate={
            selectedTask.startDate ? new Date(selectedTask.startDate) : null
          }
          endDate={selectedTask.endDate ? new Date(selectedTask.endDate) : null}
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
          value={memo}
          onChange={handleInputChange}
          onBlur={handleInputBlur} // 입력이 끝나면 onBlur 이벤트가 발생합니다.
        />
      </div>
    </>
  );
}
