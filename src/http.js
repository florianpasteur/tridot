export const DEFAULT_BASE_URL = 'https://api.tridot.com';
export const DEFAULT_REFERRER = 'https://app.tridot.com/';

export function buildHeaders(token, extra = {}) {
    return {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Content-Type': 'application/json',
        'X-Desired-Language': 'en',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        'Authorization': `Bearer ${token == null ? 'null' : token}`,
        ...extra,
    };
}

export class TridotHttpError extends Error {
    constructor(response, body) {
        super(`Tridot request failed: ${response.status} ${response.statusText}`);
        this.name = 'TridotHttpError';
        this.status = response.status;
        this.statusText = response.statusText;
        this.url = response.url;
        this.body = body;
    }
}

export async function request(path, {
    method = 'GET',
    token,
    body,
    headers,
    baseUrl = DEFAULT_BASE_URL,
    referrer = DEFAULT_REFERRER,
    fetchImpl,
} = {}) {
    const fetchFn = fetchImpl || (typeof fetch === 'function' ? fetch : null);
    if (!fetchFn) {
        throw new Error(
            'No fetch implementation available. Pass `fetchImpl` or run on a platform with global fetch (Node 18+).'
        );
    }

    const init = {
        method,
        credentials: 'include',
        mode: 'cors',
        referrer,
        headers: buildHeaders(token, headers),
    };

    if (body !== undefined && body !== null) {
        init.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetchFn(`${baseUrl}${path}`, init);
    const text = await response.text();
    const parsed = text ? safeJsonParse(text) : null;

    if (!response.ok) {
        throw new TridotHttpError(response, parsed ?? text);
    }

    return parsed;
}

function safeJsonParse(text) {
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}
