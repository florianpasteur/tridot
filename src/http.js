export const DEFAULT_BASE_URL = 'https://api.tridot.com';
export const DEFAULT_REFERRER = 'https://app.tridot.com/';

/**
 * Build the standard set of Tridot request headers.
 *
 * @param {string|null|undefined} token - bearer token, sent as the `Authorization` header
 * @param {Record<string, string>} [extra] - additional headers, merged on top of the defaults
 * @returns {Record<string, string>}
 */
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

/**
 * Error thrown by {@link request} for any non-2xx response.
 */
export class TridotHttpError extends Error {
    /**
     * @param {Response} response - the failed `fetch` response
     * @param {unknown} body - parsed JSON body, or raw text if it wasn't JSON
     */
    constructor(response, body) {
        super(`Tridot request failed: ${response.status} ${response.statusText}`);
        /** @type {'TridotHttpError'} */
        this.name = 'TridotHttpError';
        /** @type {number} */
        this.status = response.status;
        /** @type {string} */
        this.statusText = response.statusText;
        /** @type {string} */
        this.url = response.url;
        /** @type {unknown} */
        this.body = body;
    }
}

/**
 * Options accepted by {@link request}.
 *
 * @typedef {object} RequestOptions
 * @property {string} [method] - HTTP method, default `"GET"`
 * @property {string} [token] - bearer token sent as the `Authorization` header
 * @property {unknown} [body] - request body. Objects are `JSON.stringify`-d; strings are sent as-is
 * @property {Record<string, string>} [headers] - additional headers merged on top of the defaults
 * @property {string} [baseUrl] - override the API base URL (default `https://api.tridot.com`)
 * @property {string} [referrer] - `Referer` header value (default `https://app.tridot.com/`)
 * @property {typeof fetch} [fetchImpl] - custom fetch implementation
 */

/**
 * Thin wrapper around `fetch` that handles the Tridot-specific headers,
 * base URL and JSON parsing. Throws {@link TridotHttpError} for non-2xx
 * responses.
 *
 * @param {string} path - path relative to `baseUrl`, including any query string
 * @param {RequestOptions} [options]
 * @returns {Promise<any>} parsed JSON body, raw text if the body wasn't JSON, or `null` for an empty body
 */
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
