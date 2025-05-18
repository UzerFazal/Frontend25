import React, { useEffect, useState } from 'react';
import AddTaskForm from '../components/AddTaskForm';
import AddProjectForm from '../components/AddProjectForm';
import TaskItem from '../components/TaskItem';
import '../App.css';

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('tasks');
  const [editProjectId, setEditProjectId] = useState(null);
  const [editProjectData, setEditProjectData] = useState({ name: '', description: '', dueDate: '' });
  const [showModal, setShowModal] = useState(false);
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [showCompletedProjects, setShowCompletedProjects] = useState(false);

  useEffect(() => {
    fetchTasks();
    fetchProjects();

    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTasks(prev =>
        prev.map(task => {
          if (
            task.dueDate &&
            task.status !== 'Completed' &&
            !task.notified &&
            new Date(task.dueDate) <= now
          ) {
            if (Notification.permission === 'granted') {
              new Notification(`Reminder`, {
                body: `Task "${task.title}" is due now!`,
              });
            }
            return { ...task, notified: true };
          }
          return task;
        })
      );
    }, 30000);

    return () => clearInterval(interval);
  }, [tasks]);

  const fetchTasks = async () => {
    const res = await fetch('http://localhost:3001/api/tasks');
    const data = await res.json();
    const enriched = data.map(task => ({ ...task, notified: false }));
    setTasks(enriched);
  };

  const fetchProjects = async () => {
    const res = await fetch('http://localhost:3001/api/projects');
    const data = await res.json();
    setProjects(data);
  };

  const handleTaskAdded = (newTask) => {
    setTasks(prev => [...prev, { ...newTask, notified: false }]);
    setShowModal(false);
    fetchProjects();
  };

  const handleTaskDeleted = (id) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    fetchProjects();
  };

  const handleProjectAdded = (newProject) => {
    setProjects(prev => [...prev, newProject]);
    setShowModal(false);
  };

  const handleProjectDeleted = async (projectId) => {
    try {
      const res = await fetch(`http://localhost:3001/api/projects/${projectId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== projectId));
        setTasks(prev => prev.map(t => t.projectId === projectId ? { ...t, projectId: null } : t));
      }
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  const handleProjectChange = (taskId, newProjectId) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, projectId: newProjectId } : t));
    fetchProjects();
  };

  const handleTaskUpdate = (updatedTask) => {
    setTasks(prev =>
      prev.map(t => t.id === updatedTask.id ? { ...updatedTask, notified: t.notified } : t)
    );
    fetchProjects();
  };

  const handleProjectCompletedToggle = async (project) => {
    try {
      const updated = {
        ...project,
        status: project.status === 'Completed' ? 'Planned' : 'Completed',
      };

      const res = await fetch(`http://localhost:3001/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });

      if (res.ok) {
        const updatedData = await res.json();
        setProjects(prev => prev.map(p => p.id === project.id ? updatedData.project : p));
      }
    } catch (err) {
      console.error('Error toggling project status:', err);
    }
  };

  const handleProjectSave = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/projects/${editProjectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProjectData),
      });

      if (res.ok) {
        const updated = await res.json();
        setProjects(prev => prev.map(p => p.id === updated.project.id ? updated.project : p));
        setEditProjectId(null);
        setEditProjectData({ name: '', description: '', dueDate: '' });
      }
    } catch (err) {
      console.error('Error saving project changes:', err);
    }
  };

  const formatDateTime = (isoDate) => {
    if (!isoDate) return '';
    const options = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };
    return new Date(isoDate).toLocaleString('en-US', options);
  };

  const renderTasks = () => {
    const standalone = tasks.filter(t => !t.projectId);
    const active = standalone.filter(t => t.status !== 'Completed');
    const completed = standalone.filter(t => t.status === 'Completed');

    return (
      <div>
        <h2>Task List</h2>
        {active.length === 0 ? <p>No standalone tasks</p> : (
          <ul>
            {active.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                projects={projects}
                onDelete={handleTaskDeleted}
                onProjectChange={handleProjectChange}
                onTaskUpdate={handleTaskUpdate}
              />
            ))}
          </ul>
        )}

        {completed.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <button onClick={() => setShowCompletedTasks(prev => !prev)}>
              {showCompletedTasks ? `Hide Completed` : `Show Completed (${completed.length})`}
            </button>
          </div>
        )}

        {showCompletedTasks && completed.length > 0 && (
          <ul>
            {completed.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                projects={projects}
                onDelete={handleTaskDeleted}
                onProjectChange={handleProjectChange}
                onTaskUpdate={handleTaskUpdate}
              />
            ))}
          </ul>
        )}
      </div>
    );
  };

  const renderProjects = () => {
    const active = projects.filter(p => p.status !== 'Completed');
    const completed = projects.filter(p => p.status === 'Completed');

    return (
      <div>
        <h2>Project List</h2>
        {active.length === 0 ? <p>No projects</p> : active.map(renderProjectCard)}

        {completed.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <button onClick={() => setShowCompletedProjects(prev => !prev)}>
              {showCompletedProjects ? `Hide Completed Projects` : `Show Completed Projects (${completed.length})`}
            </button>
          </div>
        )}

        {showCompletedProjects && completed.length > 0 && (
          <div>
            <h3 style={{ textAlign: 'center', marginTop: '20px' }}>Completed Projects</h3>
            {completed.map(renderProjectCard)}
          </div>
        )}
      </div>
    );
  };

  const renderProjectCard = (project) => {
    const isEditing = editProjectId === project.id;
    const relatedTasks = tasks.filter(t => t.projectId === project.id);

    return (
      <div key={project.id} className={`project-item ${project.status === 'Completed' ? 'completed' : ''}`}>
        {isEditing ? (
          <>
            <input
              value={editProjectData.name}
              onChange={e => setEditProjectData(p => ({ ...p, name: e.target.value }))}
            />
            <textarea
              value={editProjectData.description}
              onChange={e => setEditProjectData(p => ({ ...p, description: e.target.value }))}
            />
            <input
              type="datetime-local"
              value={editProjectData.dueDate}
              onChange={e => setEditProjectData(p => ({ ...p, dueDate: e.target.value }))}
            />
            <button onClick={handleProjectSave}>Save</button>
          </>
        ) : (
          <>
            <h3>{project.name} {project.status === "Completed" && <span>✅</span>}</h3>
            <p>Description: {project.description}</p>
            {project.dueDate && (
              <div className="date-display">{formatDateTime(project.dueDate)}</div>
            )}
            <p>Status: {project.status}</p>
          </>
        )}

        {!isEditing && (
          <div className="task-buttons">
            <button onClick={() => handleProjectDeleted(project.id)} disabled={project.status === "Completed"}>Delete</button>
            <button onClick={() => handleProjectCompletedToggle(project)}>
              {project.status === "Completed" ? "Mark as Incomplete" : "Completed"}
            </button>
            <button onClick={() => {
              setEditProjectId(project.id);
              setEditProjectData({
                name: project.name,
                description: project.description,
                dueDate: project.dueDate,
              });
            }} disabled={project.status === "Completed"}>Change</button>
          </div>
        )}

        {relatedTasks.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {relatedTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                projects={projects}
                onDelete={handleTaskDeleted}
                onProjectChange={handleProjectChange}
                onTaskUpdate={handleTaskUpdate}
              />
            ))}
          </ul>
        ) : <p>No tasks for this project</p>}
      </div>
    );
  };

  return (
    <div className="container">
      <h1>My ToDo List</h1>

      <div className="tab-buttons">
        <button className={activeTab === 'tasks' ? 'active' : ''} onClick={() => setActiveTab('tasks')}>Tasks</button>
        <button className={activeTab === 'projects' ? 'active' : ''} onClick={() => setActiveTab('projects')}>Projects</button>
      </div>

      {activeTab === 'tasks' ? renderTasks() : renderProjects()}

      <button className="floating-button" onClick={() => setShowModal(true)}>+</button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-modal" onClick={() => setShowModal(false)}>×</button>
            {activeTab === 'tasks'
              ? <AddTaskForm onTaskAdded={handleTaskAdded} projects={projects} />
              : <AddProjectForm onProjectAdded={handleProjectAdded} />
            }
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
