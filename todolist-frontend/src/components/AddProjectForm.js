import React, { useState } from 'react';

function AddProjectForm({ onProjectAdded }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) return;

    try {
      const response = await fetch('http://localhost:3001/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          dueDate,
          status: 'Planned',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      const data = await response.json();
      onProjectAdded(data.project);
      setName('');
      setDescription('');
      setDueDate('');
    } catch (err) {
      console.error('Error creating project:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Project</h2>
      <input
        type="text"
        placeholder="Project name *"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <br />
      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <br />
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />
      <br />
      <button type="submit">Add Project</button>
    </form>
  );
}

export default AddProjectForm;
