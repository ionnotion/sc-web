import { API_BASE } from './config.js';

export async function request(path, { method = 'GET', body, form, token } = {}) {
  const headers = {};
  if (token) headers.Authorization = 'Bearer ' + token;
  let payload;
  if (form) payload = form;
  else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(API_BASE + path, { method, headers, body: payload });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error((data && data.message) || res.statusText || 'Request failed');
    err.status = res.status;
    throw err;
  }
  return data;
}

// Protected files can't be used as <img src> directly (no Authorization header), so fetch them as a Blob.
export async function fetchBlob(path, token) {
  const res = await fetch(API_BASE + path, { headers: { Authorization: 'Bearer ' + token } });
  if (!res.ok) throw new Error('Could not load the file');
  return res.blob();
}

export async function downloadFile(path, token, name) {
  const url = URL.createObjectURL(await fetchBlob(path, token));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
