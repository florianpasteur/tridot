import { dayDetails, createSession, updateSessionTime } from './schedule.js';
import { pushWorkout } from './sessions.js';

/**
 * Shared configuration passed to every endpoint helper.
 *
 * @typedef {object} ClientConfig
 * @property {string} token - bearer token returned by `login()`
 * @property {number|string} athleteId - athlete (member) id
 * @property {string} [baseUrl] - override the API base URL (default `https://api.tridot.com`)
 * @property {typeof fetch} [fetchImpl] - custom fetch implementation (e.g. for tests)
 */

/**
 * Options accepted by {@link createClient}.
 *
 * @typedef {object} CreateClientOptions
 * @property {string} token - bearer token returned by `login()`
 * @property {number|string} athleteId - athlete (member) id
 * @property {string} [baseUrl] - override the API base URL (useful for tests)
 * @property {typeof fetch} [fetchImpl] - custom fetch implementation
 */

/**
 * Athlete-bound Tridot client returned by {@link createClient}.
 *
 * @typedef {object} TridotClient
 * @property {ClientConfig} config - the resolved config used by every method
 * @property {(date: string) => Promise<any>} dayDetails - fetch the schedule for a single day (`MM/DD/YYYY`)
 * @property {(session: import('./schedule.js').Session) => Promise<any>} createSession - create a session on the calendar
 * @property {(sessionId: string|number, time: string) => Promise<void>} updateSessionTime - update the start time of a session
 * @property {(sessionId: string|number, vendorName: string, location: import('./sessions.js').Location) => Promise<void>} pushWorkout - push a session to a connected vendor
 */

/**
 * Create a Tridot API client bound to a specific athlete + auth token.
 *
 * @param {CreateClientOptions} options
 * @returns {TridotClient}
 */
export function createClient({
    token,
    athleteId,
    baseUrl,
    fetchImpl,
} = {}) {
    if (!token) throw new Error('createClient requires a `token`.');
    if (!athleteId) throw new Error('createClient requires an `athleteId`.');

    /** @type {ClientConfig} */
    const config = { token, athleteId, baseUrl, fetchImpl };

    return {
        config,
        dayDetails: dayDetails(config),
        createSession: createSession(config),
        updateSessionTime: updateSessionTime(config),
        pushWorkout: pushWorkout(config),
    };
}
