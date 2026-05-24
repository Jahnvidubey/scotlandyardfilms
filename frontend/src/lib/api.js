const BASE = "http://127.0.0.1:8000";

function authHeaders() {
  const token = localStorage.getItem("admin_token");
  return { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

function authHeadersNoJson() {
  const token = localStorage.getItem("admin_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // Public
  getProjects: () => fetch(`${BASE}/projects`).then(r => r.json()),
  getProject: (id) => fetch(`${BASE}/projects/${id}`).then(r => r.json()),

  // Auth
  login: (username, password) =>
    fetch(`${BASE}/admin/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) }).then(r => r.json()),
  logout: () =>
    fetch(`${BASE}/admin/logout`, { method: "POST", headers: authHeaders() }),
  me: () =>
    fetch(`${BASE}/admin/me`, { headers: authHeaders() }).then(r => r.json()),

  // Admin projects
  adminGetProjects: () =>
    fetch(`${BASE}/admin/projects`, { headers: authHeaders() }).then(r => r.json()),
  adminCreateProject: (data) =>
    fetch(`${BASE}/admin/projects`, { method: "POST", headers: authHeaders(), body: JSON.stringify(data) }).then(r => r.json()),
  adminUpdateProject: (id, data) =>
    fetch(`${BASE}/admin/projects/${id}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(data) }).then(r => r.json()),
  adminDeleteProject: (id) =>
    fetch(`${BASE}/admin/projects/${id}`, { method: "DELETE", headers: authHeaders() }).then(r => r.json()),

  // Images
  uploadImages: (projectId, files, eventGroup) => {
    const form = new FormData();
    files.forEach(f => form.append("files", f));
    form.append("event_group", eventGroup);
    return fetch(`${BASE}/admin/projects/${projectId}/images`, { method: "POST", headers: authHeadersNoJson(), body: form }).then(r => r.json());
  },
  deleteImage: (imageId) =>
    fetch(`${BASE}/admin/images/${imageId}`, { method: "DELETE", headers: authHeaders() }).then(r => r.json()),
};
