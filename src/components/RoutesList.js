"use client";
export const RoutesList = ({ routes }) => {
  return (
    <div>
      <span>경로 : </span>
      {routes.map((task, index) => (
        <span key={task.taskId}>
          <span
            style={{ cursor: "pointer", color: "blue" }}
            onClick={() => (window.location.href = "/app/task/" + task.taskId)}
          >
            {task.name}
          </span>
          {index < routes.length - 1 && " / "}
        </span>
      ))}
    </div>
  );
};
