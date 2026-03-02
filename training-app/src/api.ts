export const API_URL = import.meta.env.VITE_API_URL;

export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetcher = async (url: string, options: RequestInit = {}) => {
  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...(options.headers as Record<string, string>),
    } as Record<string, string>,  // <-- cast here
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'An error occurred' }));
    throw new Error(error.error || res.statusText);
  }

  return res.json();
};
