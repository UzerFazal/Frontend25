import React, { useState } from 'react';

function AddTaskForm({ onTaskAdded, projects }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [projectId, setProjectId] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const combinedDateTime = dueDate && dueTime ? `${dueDate}T${dueTime}` : dueDate;

    try {
      const response = await fetch('http://localhost:3001/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          dueDate: combinedDateTime,
          status: 'Not Started',
          projectId: projectId || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to create task');

      const data = await response.json();
      onTaskAdded(data.task);

      setTitle('');
      setDescription('');
      setDueDate('');
      setDueTime('');
      setProjectId('');
    } catch (err) {
      console.error('Error adding task:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Create Task</h3>

      <input
        type="text"
        placeholder="Task title *"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="datetime-fields">
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="calendar-input"
        />
        <input
          type="time"
          value={dueTime}
          onChange={(e) => setDueTime(e.target.value)}
          className="time-input"
        />
      </div>

      <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
        <option value="">Standalone task</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>

      <button type="submit">Add Task</button>
    </form>
  );
}

export default AddTaskForm;
