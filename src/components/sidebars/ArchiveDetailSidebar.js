import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function ArchiveDetailSidebar() {
  const dispatch = useDispatch();
  const selectedArchive = useSelector((state) => state.tasks.selectedArchive);
  const [name, setName] = useState(""); // name 상태 추가
  const [memo, setMemo] = useState(""); // memo 상태 추가

  useEffect(() => {
    setName(selectedArchive.name);
    setMemo(selectedArchive.memo);
  }, [selectedArchive]);

  if (!selectedArchive) {
    return <div>선택된 태스크가 없습니다.</div>;
  }

  if (selectedArchive.name === "archive") {
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
            selectedArchive.startDate
              ? new Date(selectedArchive.startDate)
              : null
          }
          endDate={
            selectedArchive.endDate ? new Date(selectedArchive.endDate) : null
          }
          dateFormat="yyyy-MM-dd"
          isClearable
          readOnly
          timeZone="UTC"
        />
      </div>
      <div>
        <label>Priority:</label>
        <span style={{ textDecoration: "underline" }}>
          {selectedArchive.priority}
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
