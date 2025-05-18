import React, { useState, useEffect } from 'react';
import '../App.css';

function TaskItem({ task, projects = [], onDelete, onProjectChange, onTaskUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({ ...task });

  useEffect(() => {
    setEditedTask({ ...task });
  }, [task]);

  const handleDelete = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/tasks/${task.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        onDelete(task.id);
      } else {
        console.error('Failed to delete task');
      }
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedTask),
      });

      if (res.ok) {
        const updated = await res.json();
        onTaskUpdate(updated.task);
        setIsEditing(false);
      } else {
        console.error('Failed to save changes');
      }
    } catch (err) {
      console.error('Error saving task:', err);
    }
  };

  const toggleCompleted = async () => {
    const newStatus = editedTask.status === "Completed" ? "Not Started" : "Completed";

    try {
      const res = await fetch(`http://localhost:3001/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editedTask, status: newStatus }),
      });

      if (res.ok) {
        const updated = await res.json();
        onTaskUpdate(updated.task); // Обновляем родительский state немедленно
        setEditedTask(prev => ({ ...prev, status: newStatus }));
      } else {
        console.error('Failed to toggle completed status');
      }
    } catch (err) {
      console.error('Error toggling completed status:', err);
    }
  };

  const handleChangeField = (field, value) => {
    setEditedTask(prev => ({ ...prev, [field]: value }));
  };

  const handleProjectChange = async (e) => {
    const newProjectId = e.target.value === "null" ? null : e.target.value;

    try {
      const res = await fetch(`http://localhost:3001/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editedTask, projectId: newProjectId }),
      });

      if (res.ok) {
        const updated = await res.json();
        onProjectChange(task.id, newProjectId);
        onTaskUpdate(updated.task); // тоже обновляем состояние
        setEditedTask(prev => ({ ...prev, projectId: newProjectId }));
      } else {
        console.error('Failed to update project');
      }
    } catch (err) {
      console.error('Error updating project:', err);
    }
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const isOverdue = () => {
    if (!editedTask.dueDate || editedTask.status === "Completed") return false;
    return new Date(editedTask.dueDate) < new Date();
  };

  return (
    <li className={`task-item ${editedTask.status === "Completed" ? "completed" : ""}`}>
      {isEditing ? (
        <>
          <input
            type="text"
            value={editedTask.title}
            onChange={(e) => handleChangeField("title", e.target.value)}
          />
          <br />
          <textarea
            value={editedTask.description}
            onChange={(e) => handleChangeField("description", e.target.value)}
          />
          <br />
          <input
            type="datetime-local"
            value={editedTask.dueDate}
            onChange={(e) => handleChangeField("dueDate", e.target.value)}
          />
          <br />
          <button onClick={handleSave}>Save</button>
        </>
      ) : (
        <>
          <strong>{editedTask.title}</strong> {editedTask.status === "Completed" && <span>✅</span>}
          <div>Description: {editedTask.description}</div>
          {editedTask.dueDate && (
            <div className={`datetime-badge ${isOverdue() ? 'overdue' : ''}`}>
              {formatDateTime(editedTask.dueDate)}
            </div>
          )}
        </>
      )}

      <div className="select-wrapper">
        <label>Project:</label>
        <select
          value={editedTask.projectId ? String(editedTask.projectId) : "null"}
          onChange={handleProjectChange}
        >
          <option value="null">Unassigned</option>
          {projects.map(project => (
            <option key={project.id} value={String(project.id)}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <div className="task-buttons">
        <button onClick={handleDelete}>Delete</button>
        <button onClick={toggleCompleted}>
          {editedTask.status === "Completed" ? "Mark as Incomplete" : "Completed"}
        </button>
        <button onClick={() => setIsEditing(!isEditing)}>Change</button>
      </div>
    </li>
  );
}

export default TaskItem;
