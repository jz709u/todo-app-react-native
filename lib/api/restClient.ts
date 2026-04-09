const API_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${ANON_KEY}`,
  apikey: ANON_KEY!,
};

export async function restSelect<T>(path: string, query: URLSearchParams) {
  const response = await fetch(`${API_URL}/rest/v1/${path}?${query}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}`);
  }

  return (await response.json()) as T;
}

export async function restUpsert<T>(path: string, rows: T[]) {
  const response = await fetch(`${API_URL}/rest/v1/${path}?on_conflict=id`, {
    method: "POST",
    headers,
    body: JSON.stringify(rows),
  });

  if (!response.ok) {
    throw new Error(`Failed to upsert ${path}`);
  }
}
