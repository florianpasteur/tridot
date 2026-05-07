import { request } from './http.js';
import { buildSessionPayload } from './payloads.js';

/** @typedef {import('./client.js').ClientConfig} ClientConfig */

/**
 * Free-text fields shown on a session card.
 *
 * @typedef {object} SessionDetail
 * @property {string} [warmUp] - warm up description
 * @property {string} [mainSet] - main set description
 * @property {string} [coolDown] - cool down description
 */

/**
 * A session to schedule on the athlete's calendar.
 *
 * @typedef {object} Session
 * @property {string} name - session display name
 * @property {string} date - session date in `YYYY-MM-DD` format
 * @property {string} time - session start time, e.g. `"6:00 AM"`
 * @property {number|string} phaseId - current training phase id
 * @property {number} [durationSeconds] - planned duration in seconds (default `3600`)
 * @property {string} [sessionType] - default `"strength"`
 * @property {string} [sessionZoneLabel] - default `"STRENGTH Session"`
 * @property {string} [location] - default `"Home"`
 * @property {string} [image] - default `"images/strength-new.png"`
 * @property {SessionDetail} [sessionDetail] - warm up / main set / cool down text
 * @property {Record<string, unknown>} [overrides] - merged into the body to override any field
 */

/**
 * Build a `dayDetails(date)` function bound to the given client config.
 *
 * @param {ClientConfig} config
 * @returns {(date: string) => Promise<any>} fetches the schedule for a single day (`YYYY-MM-DD`)
 */
export function dayDetails(config) {
    return async function getDayDetails(date) {
        if (!date) throw new Error('dayDetails(date) requires a date string.');
        const path =
            `/athletesvcs/athlete/schedule/dayDetails` +
            `?date=${encodeURIComponent(date)}` +
            `&latitude=0&longitude=0`;

        const result = await request(path, {
            token: config.token,
            baseUrl: config.baseUrl,
            fetchImpl: config.fetchImpl,
        });
        return result && result.body ? result.body.response : null;
    };
}

/**
 * Build a `createSession(session)` function bound to the given client config.
 *
 * @param {ClientConfig} config
 * @returns {(session: Session) => Promise<any>} creates a session on the athlete's calendar
 */
export function createSession(config) {
    return async function createSessionFn(session) {
        if (!session || !session.name || !session.date || !session.time) {
            throw new Error('createSession requires `{ name, date, time }`.');
        }
        if (!session.phaseId) {
            throw new Error('createSession requires a `phaseId`.');
        }

        const payload = buildSessionPayload({
            athleteId: config.athleteId,
            phaseId: session.phaseId,
            name: session.name,
            date: session.date,
            time: session.time,
            durationSeconds: session.durationSeconds,
            sessionType: session.sessionType,
            sessionZoneLabel: session.sessionZoneLabel,
            location: session.location,
            image: session.image,
            sessionDetail: session.sessionDetail,
            overrides: session.overrides,
        });

        const result = await request('/athletesvcs/athlete/schedule/add', {
            method: 'POST',
            token: config.token,
            body: payload,
            baseUrl: config.baseUrl,
            fetchImpl: config.fetchImpl,
        });
        return result && result.body ? result.body.response : null;
    };
}

/**
 * Build an `updateSessionTime(sessionId, time)` function bound to the given client config.
 *
 * @param {ClientConfig} config
 * @returns {(sessionId: string|number, time: string) => Promise<void>} updates the start time of a session
 */
export function updateSessionTime(config) {
    return async function updateSessionTimeFn(sessionId, time) {
        if (!sessionId || !time) {
            throw new Error('updateSessionTime requires (sessionId, time).');
        }
        await request('/athletesvcs/athlete/schedule/update-location-and-time', {
            method: 'PATCH',
            token: config.token,
            baseUrl: config.baseUrl,
            fetchImpl: config.fetchImpl,
            body: {
                memberId: config.athleteId,
                sessionId: String(sessionId),
                sessionTime: time,
            },
        });
    };
}
