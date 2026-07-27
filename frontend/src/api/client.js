const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed (${res.status})`);
  }
  return res.json();
}

export const extractComplaint = (text) =>
  request("/api/ai/extract", { method: "POST", body: JSON.stringify({ text }) });

export const saveComplaint = (payload) =>
  request("/api/complaints", { method: "POST", body: JSON.stringify(payload) });

export const askCopilot = (message, complaint) =>
  request("/api/ai/chat", {
    method: "POST",
    body: JSON.stringify({ message, complaint }),
  });
