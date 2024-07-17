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

  if (!selectedTask) {
    return <div>선택된 태스크가 없습니다.</div>;
  }

  if (selectedTask.name === "archive") {
    return (
      <div>
        <label>Name:</label>
        <br />
        {name}
      </div>
    );
  }

  return (
    <>
      <div>
        <label>Name:</label>
        <br />
        {name}
      </div>
      <div>
        <label>Date Range:</label>
        <DatePicker
          selectsRange={true}
          startDate={
            selectedTask.startDate ? new Date(selectedTask.startDate) : null
          }
          endDate={selectedTask.endDate ? new Date(selectedTask.endDate) : null}
          dateFormat="yyyy-MM-dd"
          isClearable
          readOnly
          timeZone="UTC"
        />
      </div>
      <div>
        <label>Priority:</label>
        <span style={{ textDecoration: "underline" }}>
          {selectedTask.priority}
        </span>
      </div>
      <div>
        <label>Memo:</label>
        <br />
        {memo}
      </div>
    </>
  );
}
