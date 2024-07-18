"use client";
import common from "@/lib/common/common_fn";
import { useDrag, useDrop } from "react-dnd";

export const DraggableTask = ({
  task,
  onClick,
  onDoubleClick,
  onCheckChange,
  section,
  path,
  parentPath,
  index,
  orderTask,
}) => {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "TASK",
      item: { section, path, index, parentPath },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [section, path, index, parentPath]
  );

  const [, drop] = useDrop(
    () => ({
      accept: "TASK",
      hover: (item) => {
        console.log("drop on DraggableTask");
        // item.parentPath 와 parentPath 가 다르면
        // 한 리스트 내의 이동
        if (common.arraysEqual(item.parentPath, parentPath)) {
          console.log("arraysEqual(item.parentPath, parentPath)");
          if (item.index !== index) {
            orderTask(parentPath, item.index, index);
            item.index = index;
          }
        }
      },
    }),
    [index, parentPath]
  );

  return (
    <li
      ref={(node) => drag(drop(node))}
      className="task-item"
      style={{ opacity: isDragging ? 0.5 : 1 }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <input
        type="checkbox"
        checked={task.check}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
        onChange={onCheckChange}
      />
      <span>{task.name}</span>
    </li>
  );
};
