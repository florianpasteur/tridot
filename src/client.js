import { dayDetails, createSession, updateSessionTime } from './schedule.js';
import { pushWorkout } from './sessions.js';

/**
 * Create a Tridot API client bound to a specific athlete + auth token.
 *
 * @param {object} options
 * @param {string} options.token - the bearer token returned by `login()`
 * @param {number|string} options.athleteId - the athlete (member) id
 * @param {string} [options.baseUrl] - override the API base url (useful for tests)
 * @param {Function} [options.fetchImpl] - custom fetch implementation
 * @returns {{
 *   config: object,
 *   dayDetails: (date: string) => Promise<any>,
 *   createSession: (session: object) => Promise<any>,
 *   updateSessionTime: (sessionId: string|number, time: string) => Promise<void>,
 *   pushWorkout: (sessionId: string|number, vendorName: string, location: object) => Promise<void>,
 * }}
 */
export function createClient({
    token,
    athleteId,
    baseUrl,
    fetchImpl,
} = {}) {
    if (!token) throw new Error('createClient requires a `token`.');
    if (!athleteId) throw new Error('createClient requires an `athleteId`.');

    const config = { token, athleteId, baseUrl, fetchImpl };

    return {
        config,
        dayDetails: dayDetails(config),
        createSession: createSession(config),
        updateSessionTime: updateSessionTime(config),
        pushWorkout: pushWorkout(config),
    };
}
