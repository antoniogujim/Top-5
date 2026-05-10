async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers as Record<string, string>),
  }
  const res = await fetch(`/api${path}`, { ...init, headers })
  if (res.status === 204) return undefined as T
  const body = await res.json()
  if (!res.ok) throw new Error(body.message ?? `HTTP ${res.status}`)
  return body as T
}

export const api = {
  get:  <T>(path: string)                    => request<T>(path),
  post: <T>(path: string, body: unknown)     => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put:  <T>(path: string, body: unknown)     => request<T>(path, { method: 'PUT',  body: JSON.stringify(body) }),
  del:      (path: string)                   => request<void>(path, { method: 'DELETE' }),
}
