import React from 'react';
import TaskItem from './TaskItem';

function TaskList({ tasks, projects, onDelete, onProjectChange }) {
  return (
    <div>
      <h2>Task List</h2>
      {tasks.length === 0 ? (
        <p>No tasks yet</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onDelete={onDelete}
              projects={projects}
              onProjectChange={onProjectChange}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

export default TaskList;
