// TaskListView.js
"use client";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { addTask } from "../redux/reducers/taskSlice";

const TaskListView = () => {
  const data = useSelector((state) => state.tasks.root);
  const dispatch = useDispatch();
  const [newTaskName, setNewTaskName] = useState("");

  const handleAddTask = (e) => {
    e.preventDefault(); // Prevent the default form submission
    if (newTaskName.trim()) {
      dispatch(
        addTask({
          section: "root",
          path: [], // root 하위에 바로 추가
          newTask: { name: newTaskName, children: [] },
        })
      );
      setNewTaskName(""); // Clear input after adding
    }
  };

  return (
    <div>
      <h2>{data.name}</h2>
      <ul>
        {data.children.map((task, index) => (
          <li key={index}>{task.name}</li>
        ))}
      </ul>
      <form onSubmit={handleAddTask}>
        <input
          type="text"
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          placeholder="새로운 할 일"
        />
        <button type="submit">추가</button>
      </form>
    </div>
  );
};

export default TaskListView;
