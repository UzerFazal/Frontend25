// src/components/ModalForm.js
import React, { useState } from 'react';
import './ModalForm.css';

function ModalForm({ type, onAdd, onClose, projects }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    projectId: ''
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title) return;

    onAdd(form);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Create {type === 'task' ? 'Task' : 'Project'}</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={`${type === 'task' ? 'Task' : 'Project'} title *`}
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            required
          />
          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => handleChange('dueDate', e.target.value)}
          />
          {type === 'task' && (
            <select value={form.projectId} onChange={(e) => handleChange('projectId', e.target.value)}>
              <option value="">Standalone task</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
          <button type="submit">Add</button>
          <button type="button" onClick={onClose} className="cancel">Cancel</button>
        </form>
      </div>
    </div>
  );
}

export default ModalForm;
