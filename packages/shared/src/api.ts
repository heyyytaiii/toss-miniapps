type FetchOptions = RequestInit & {
  baseUrl?: string;
};

export async function fetchApi<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const { baseUrl = '', ...fetchOptions } = options;

  const response = await fetch(`${baseUrl}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
    ...fetchOptions,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
