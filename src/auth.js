import { request } from './http.js';

/**
 * Logs in against the Tridot API and returns the response body
 * (containing at least `authToken`, plus the athlete profile).
 *
 * @param {string} email - the account email
 * @param {string} password - the account password
 * @param {object} [options] - forwarded to `request` (e.g. `fetchImpl`, `baseUrl`)
 * @returns {Promise<object>} the `body.response` payload from the login endpoint
 */
export async function login(email, password, options = {}) {
    if (!email || !password) {
        throw new Error('login(email, password) requires both email and password.');
    }

    const result = await request('/athletesvcs/athlete/user/login', {
        ...options,
        method: 'POST',
        body: {
            header: { latitude: '', longitude: '' },
            body: {
                userName: email,
                email,
                password,
            },
        },
    });

    const response = result && result.body && result.body.response;
    if (!response || !response.authToken) {
        throw new Error('Tridot login did not return an authToken.');
    }
    return response;
}
