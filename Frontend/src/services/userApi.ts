const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8080";

export async function fetchProfile(token?: string) {
  const res = await fetch(`${API_BASE}/api/user/profile`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export default {};
