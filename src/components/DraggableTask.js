"use client";
import common from "@/lib/common/common_fn";
import Icon from "../components/Icon";
import { useDrag, useDrop } from "react-dnd";
import { Provider, useSelector, useDispatch } from "react-redux";

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
  const primaryColor = useSelector((state) => state.theme.primaryColor);

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
      <div className="task-leftItem">
        <button
          className="toggleButton"
          onDoubleClick={(e) => e.stopPropagation()}
          onClick={() => onCheckChange()}
        >
          {task.check === true ? (
            <Icon name="check" size={28} color={primaryColor} />
          ) : (
            <Icon name="uncheck" size={28} color="#585D6A" />
          )}
        </button>
        <span>{task.name}</span>
      </div>
    </li>
  );
};
