import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/lib/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { navigate('/admin/login'); return; }
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    const data = await api.adminGetProjects();
    if (data.detail === 'Unauthorized') { navigate('/admin/login'); return; }
    setProjects(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await api.adminDeleteProject(id);
    loadProjects();
  };

  const handleLogout = async () => {
    await api.logout();
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  const togglePublish = async (project) => {
    await api.adminUpdateProject(project.id, { published: !project.published });
    loadProjects();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-black text-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Scotland Yard — Admin</h1>
        <div className="flex gap-4 items-center">
          <Link to="/" className="text-sm text-gray-300 hover:text-white">View Site</Link>
          <button onClick={handleLogout} className="text-sm bg-white text-black px-3 py-1 rounded hover:bg-gray-200">Logout</button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Projects</h2>
          <Link to="/admin/projects/new" className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm">
            + New Project
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No projects yet. Create your first one.</div>
        ) : (
          <div className="grid gap-4">
            {projects.map(p => (
              <div key={p.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
                {/* Cover thumbnail */}
                <div className="w-20 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {p.coverImage ? (
                    <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No cover</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{p.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {p.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{p.location} · {p.date} · {p.category}</p>
                  <p className="text-xs text-gray-400">{p.images?.length || 0} images</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => togglePublish(p)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition ${p.published ? 'border-yellow-400 text-yellow-600 hover:bg-yellow-50' : 'border-green-400 text-green-600 hover:bg-green-50'}`}
                  >
                    {p.published ? 'Unpublish' : 'Publish'}
                  </button>
                  <Link
                    to={`/admin/projects/${p.id}`}
                    className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id, p.title)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-red-300 text-red-500 hover:bg-red-50 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
