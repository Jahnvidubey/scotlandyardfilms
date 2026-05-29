import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, imgUrl } from '@/lib/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { navigate('/admin/login'); return; }
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    const [projectData, contactData] = await Promise.all([
      api.adminGetProjects(),
      api.getContacts(),
    ]);
    if (projectData.detail === 'Unauthorized') { navigate('/admin/login'); return; }
    setProjects(Array.isArray(projectData) ? projectData : []);
    setContacts(Array.isArray(contactData) ? contactData : []);
    setLoading(false);
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await api.adminDeleteProject(id);
    loadAll();
  };

  const handleLogout = async () => {
    await api.logout();
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  const togglePublish = async (project) => {
    await api.adminUpdateProject(project.id, { published: !project.published });
    loadAll();
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
        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-200">
          <button
            onClick={() => setTab('projects')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition -mb-px ${tab === 'projects' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black'}`}
          >
            Projects
          </button>
          <button
            onClick={() => setTab('inquiries')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition -mb-px ${tab === 'inquiries' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black'}`}
          >
            Inquiries {contacts.length > 0 && <span className="ml-1 bg-black text-white text-xs px-1.5 py-0.5 rounded-full">{contacts.length}</span>}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : tab === 'projects' ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{projects.length} Projects</h2>
              <Link to="/admin/projects/new" className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm">
                + New Project
              </Link>
            </div>
            {projects.length === 0 ? (
              <div className="text-center py-20 text-gray-400">No projects yet.</div>
            ) : (
              <div className="grid gap-4">
                {projects.map(p => (
                  <div key={p.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
                    <div className="w-20 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {p.coverImage ? (
                        <img src={imgUrl(p.coverImage)} alt={p.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No cover</div>
                      )}
                    </div>
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
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => togglePublish(p)} className={`text-xs px-3 py-1.5 rounded-lg border transition ${p.published ? 'border-yellow-400 text-yellow-600 hover:bg-yellow-50' : 'border-green-400 text-green-600 hover:bg-green-50'}`}>
                        {p.published ? 'Unpublish' : 'Publish'}
                      </button>
                      <Link to={`/admin/projects/${p.id}`} className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition">Edit</Link>
                      <button onClick={() => handleDelete(p.id, p.title)} className="text-xs px-3 py-1.5 rounded-lg border border-red-300 text-red-500 hover:bg-red-50 transition">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold mb-4">{contacts.length} Inquiries</h2>
            {contacts.length === 0 ? (
              <div className="text-center py-20 text-gray-400">No inquiries yet.</div>
            ) : (
              <div className="grid gap-4">
                {[...contacts].reverse().map(c => (
                  <div key={c.id} className="bg-white rounded-xl shadow-sm p-5">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="font-semibold text-base">{c.name}</h3>
                        <p className="text-sm text-gray-500">{c.email} · {c.phone}</p>
                      </div>
                      <div className="text-right text-xs text-gray-400">
                        <p>{c.eventType} {c.eventDate ? `· ${c.eventDate}` : ''}</p>
                        <p>{c.venueLocation}</p>
                        {c.created_at && <p className="mt-1">{new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{c.message}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
