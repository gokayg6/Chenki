const API_URL = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000";

async function request(endpoint, method = "GET", data = null, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const options = { method, headers };
  if (data) options.body = JSON.stringify(data);

  const res = await fetch(`${API_URL}/api${endpoint}`, options);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error ${res.status}: ${err}`);
  }
  return res.json();
}

export async function registerUser(name, email, password) {
  return request("/auth/register", "POST", { name, email, password });
}

export async function loginUser(email, password) {
  return request("/auth/login", "POST", { email, password });
}

export async function getProducts() {
  return request("/products", "GET");
}
