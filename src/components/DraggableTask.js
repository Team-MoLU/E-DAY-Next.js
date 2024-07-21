"use client";
import common from "@/lib/common/common_fn";
import { useDrag, useDrop } from "react-dnd";

export const DraggableTask = ({
  type,
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
      type: type,
      item: { section, path, index, parentPath },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [section, path, index, parentPath]
  );

  const [, drop] = useDrop(
    () => ({
      accept: type,
      hover: (item) => {
        if (item.index !== index) {
          orderTask(item.index, index);
          item.index = index;
        }
      },
    }),
    [index, parentPath, orderTask]
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
