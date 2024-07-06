"use client";
import { useDrag } from "react-dnd";

export const DraggableTask = ({
  task,
  onClick,
  onCheckChange,
  section,
  path,
}) => {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "TASK",
      item: () => ({ task, section, path }), // 함수로 변경
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [task, section, path]
  ); // 의존성 배열 추가

  return (
    <li
      ref={drag}
      className="task-item"
      style={{ opacity: isDragging ? 0.5 : 1 }}
      onClick={onClick}
    >
      <input
        type="checkbox"
        checked={task.check}
        onClick={(e) => e.stopPropagation()}
        onChange={onCheckChange}
      />
      <span>{task.name}</span>
    </li>
  );
};
