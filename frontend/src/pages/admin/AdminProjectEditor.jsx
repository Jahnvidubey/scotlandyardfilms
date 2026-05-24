import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '@/lib/api';

const CATEGORIES = ['Traditional Wedding', 'Destination Wedding', 'Pre-Wedding', 'Engagement', 'Reception', 'Birthday', 'Corporate', 'Other'];

export default function AdminProjectEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new' || !id;

  const [form, setForm] = useState({
    title: '', location: '', date: '', description: '',
    cover_image: '', category: 'Traditional Wedding',
    testimonial: '', published: false,
  });
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);

  // Upload state
  const [uploadFiles, setUploadFiles] = useState([]);
  const [eventGroup, setEventGroup] = useState('general');
  const [uploading, setUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverUploading(true);
    const result = await api.uploadImages(parseInt(id), [file], 'cover');
    if (result.uploaded?.[0]) {
      const src = result.uploaded[0];
      setForm(p => ({ ...p, cover_image: src }));
      await api.adminUpdateProject(parseInt(id), { cover_image: src });
    }
    setCoverUploading(false);
    loadProject();
  };

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { navigate('/admin/login'); return; }
    if (!isNew) loadProject();
  }, [id]);

  const loadProject = async () => {
    setLoading(true);
    const projects = await api.adminGetProjects();
    const p = projects.find(x => x.id === parseInt(id));
    if (!p) { navigate('/admin'); return; }
    setForm({
      title: p.title, location: p.location, date: p.date,
      description: p.description || '', cover_image: p.coverImage || '',
      category: p.category, testimonial: p.testimonial || '',
      published: p.published,
    });
    setImages(p.images || []);
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (isNew) {
      const created = await api.adminCreateProject(form);
      setSaving(false);
      if (created.id) navigate(`/admin/projects/${created.id}`);
    } else {
      await api.adminUpdateProject(parseInt(id), form);
      setSaving(false);
      loadProject();
    }
  };

  const handleUpload = async () => {
    if (!uploadFiles.length) return;
    setUploading(true);
    await api.uploadImages(parseInt(id), uploadFiles, eventGroup);
    setUploadFiles([]);
    setUploading(false);
    loadProject();
  };

  const handleDeleteImage = async (imageId) => {
    if (!confirm('Delete this image?')) return;
    await api.deleteImage(imageId);
    loadProject();
  };

  const setCover = (src) => {
    setForm(p => ({ ...p, cover_image: src }));
  };

  // Group images by event_group
  const grouped = images.reduce((acc, img) => {
    const g = img.event_group || 'general';
    if (!acc[g]) acc[g] = [];
    acc[g].push(img);
    return acc;
  }, {});

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-black text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="text-gray-400 hover:text-white text-sm">← Dashboard</Link>
          <span className="text-gray-600">/</span>
          <h1 className="text-lg font-semibold">{isNew ? 'New Project' : 'Edit Project'}</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setForm(p => ({ ...p, published: !p.published }))}
            className={`text-sm px-3 py-1 rounded border transition ${form.published ? 'border-yellow-400 text-yellow-400' : 'border-green-400 text-green-400'}`}
          >
            {form.published ? 'Set as Draft' : 'Set as Published'}
          </button>
          <button
            form="project-form"
            type="submit"
            disabled={saving}
            className="bg-white text-black text-sm px-4 py-1 rounded hover:bg-gray-200 transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Project Details Form */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Project Details</h2>
          <form id="project-form" onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Title *</label>
              <input required className="input-field" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Avani & Divya Wedding" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Location *</label>
              <input required className="input-field" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="Indore, M.P. India" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Date *</label>
              <input required className="input-field" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} placeholder="March 2026" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Category *</label>
              <select required className="input-field" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea rows={3} className="input-field resize-none" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="About this project..." />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Client Testimonial</label>
              <textarea rows={2} className="input-field resize-none" value={form.testimonial} onChange={e => setForm(p => ({ ...p, testimonial: e.target.value }))} placeholder="What the client said..." />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Cover Image</label>
              <div className="flex items-center gap-3">
                {form.cover_image && (
                  <img src={form.cover_image} alt="cover" className="w-20 h-14 object-cover rounded-lg border" />
                )}
                <label className="cursor-pointer flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition">
                  {coverUploading ? 'Uploading...' : 'Upload Cover Photo'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isNew || coverUploading}
                    onChange={handleCoverUpload}
                  />
                </label>
                {isNew && <p className="text-xs text-gray-400">Save project first, then upload cover.</p>}
                {!isNew && <p className="text-xs text-gray-400">Or hover any image below → "Set as Cover"</p>}
              </div>
            </div>
          </form>
        </div>

        {/* Image Upload — only available after project is created */}
        {!isNew && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Upload Images</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                className="input-field flex-1"
                placeholder="Event group (e.g. haldi, wedding, reception)"
                value={eventGroup}
                onChange={e => setEventGroup(e.target.value)}
              />
              <label className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg px-4 py-2 cursor-pointer hover:border-gray-400 transition text-sm text-gray-500">
                {uploadFiles.length ? `${uploadFiles.length} file(s) selected` : 'Choose images'}
                <input type="file" multiple accept="image/*" className="hidden" onChange={e => setUploadFiles(Array.from(e.target.files))} />
              </label>
              <button
                onClick={handleUpload}
                disabled={uploading || !uploadFiles.length}
                className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition disabled:opacity-40"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        )}

        {/* Image Gallery grouped by event */}
        {!isNew && Object.keys(grouped).length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Images ({images.length})</h2>
            {Object.entries(grouped).map(([group, imgs]) => (
              <div key={group} className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 capitalize">{group}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {imgs.map(img => (
                    <div key={img.id} className="relative group rounded-lg overflow-hidden bg-gray-100 aspect-square">
                      <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                      {form.cover_image === img.src && (
                        <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded">Cover</div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2">
                        <button
                          onClick={() => setCover(img.src)}
                          className="text-xs bg-white text-black px-2 py-1 rounded hover:bg-gray-100"
                        >
                          Set as Cover
                        </button>
                        <button
                          onClick={() => handleDeleteImage(img.id)}
                          className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {isNew && (
          <p className="text-center text-sm text-gray-400">Save the project first, then you can upload images.</p>
        )}
      </div>

      <style>{`
        .input-field {
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s;
        }
        .input-field:focus {
          border-color: #111;
          box-shadow: 0 0 0 2px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}
