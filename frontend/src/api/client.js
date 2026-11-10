/**
 * Base HTTP client for Smart Roster API
 */
export async function apiRequest(endpoint, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(endpoint, config);
  const data = await response.json().catch(() => ({
    success: false,
    error: `HTTP ${response.status}: Failed to parse JSON response`,
  }));

  if (!response.ok && data.success !== false) {
    data.success = false;
    data.error = data.error || `HTTP ${response.status}: ${response.statusText}`;
  }

  return data;
}

