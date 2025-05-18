import React from 'react';

function ProjectList({ projects }) {
  return (
    <div>
      <h2>Project List</h2>
      {projects.length === 0 ? (
        <p>No projects yet</p>
      ) : (
        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              <strong>{project.name}</strong>
              <br />
              Description: {project.description || '—'}
              <br />
              Due: {project.dueDate || '—'}
              <br />
              Status: {project.status || 'Planned'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ProjectList;
