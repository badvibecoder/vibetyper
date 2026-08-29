/*
 * HTTP helpers: URL construction, headers, auth, retries, and small
 * response utilities for the API client layer.
 */

export function buildQueryString(params) {
  const parts = [];
  for (const key of Object.keys(params)) {
    const value = params[key];
    if (Array.isArray(value)) {
      for (const item of value) {
        parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(item));
      }
    } else if (value !== undefined && value !== null) {
      parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
    }
  }
  return parts.join('&');
}

export function parseUrl(url) {
  const parsed = new URL(url);
  return {
    protocol: parsed.protocol,
    hostname: parsed.hostname,
    port: parsed.port,
    pathname: parsed.pathname,
    search: parsed.search,
    hash: parsed.hash,
  };
}

export function basicAuth(username, password) {
  const token = Buffer.from(username + ':' + password).toString('base64');
  return 'Basic ' + token;
}

export function bearerAuth(token) {
  return 'Bearer ' + token;
}

export function joinUrl(base, path) {
  return base.replace(/\/+$/, '') + '/' + String(path).replace(/^\/+/, '');
}

export function statusText(code) {
  const phrases = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    301: 'Moved Permanently',
    304: 'Not Modified',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    503: 'Service Unavailable',
  };
  return phrases[code] || 'Unknown';
}

export function isSuccess(code) {
  return code >= 200 && code < 300;
}

export function isRedirect(code) {
  return code >= 300 && code < 400;
}

export function redactUrl(url, sensitiveKeys) {
  const parsed = new URL(url);
  for (const key of sensitiveKeys) {
    if (parsed.searchParams.has(key)) {
      parsed.searchParams.set(key, '***');
    }
  }
  return parsed.toString();
}

export function parseHeaders(rawText) {
  const headers = {};
  for (const line of rawText.split('\n')) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const name = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();
    headers[name] = value;
  }
  return headers;
}

export function cacheMaxAge(headers) {
  const directive = headers['cache-control'] || '';
  for (const part of directive.split(',')) {
    const [key, value] = part.trim().split('=');
    if (key === 'max-age') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
}

export function hostnameOf(url) {
  return new URL(url).hostname;
}

export function resolveRedirect(headers, baseUrl) {
  const location = headers.location;
  if (!location) return null;
  return new URL(location, baseUrl).toString();
}

export function buildRangeHeader(size, chunkIndex, totalChunks) {
  const start = chunkIndex * size;
  const end = Math.min(start + size - 1, totalChunks * size - 1);
  return 'bytes=' + start + '-' + end;
}

export function backoffDelay(attempt, baseMs = 500, factor = 2) {
  return baseMs * Math.pow(factor, attempt - 1);
}

export function parseQueryString(query) {
  const params = {};
  for (const [key, value] of new URLSearchParams(query)) {
    params[key] = value;
  }
  return params;
}

export function contentTypeFor(filename) {
  const extension = filename.split('.').pop().toLowerCase();
  const types = {
    json: 'application/json',
    html: 'text/html',
    css: 'text/css',
    js: 'text/javascript',
    png: 'image/png',
    jpg: 'image/jpeg',
    svg: 'image/svg+xml',
    txt: 'text/plain',
    csv: 'text/csv',
    pdf: 'application/pdf',
    zip: 'application/zip',
  };
  return types[extension] || 'application/octet-stream';
}

export async function fetchWithRetry(url, options = {}, attempts = 3) {
  let lastError = null;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      if (response.status < 500) return response;
      lastError = new Error('HTTP ' + response.status);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, backoffDelay(attempt)));
  }
  throw lastError;
}

export function statusClass(code) {
  if (code < 200) return 'informational';
  if (code < 300) return 'success';
  if (code < 400) return 'redirect';
  if (code < 500) return 'client-error';
  return 'server-error';
}

export function prettyPrintJson(value) {
  return JSON.stringify(value, null, 2);
}

export function requestDigest(method, url, body) {
  const payload = typeof body === 'string' ? body : JSON.stringify(body || {});
  return method.toUpperCase() + ' ' + url + ' ' + payload.length + ' bytes';
}

export function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('request timed out after ' + ms + 'ms')), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
