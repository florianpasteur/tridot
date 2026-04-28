import { request } from './http.js';
import { buildSessionPayload } from './payloads.js';

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

export function createSession(config) {
    return async function createSessionFn(session) {
        if (!session || !session.name || !session.date || !session.time) {
            throw new Error('createSession requires `{ name, date, time }`.');
        }
        if (!session.phaseId) {
            throw new Error('createSession requires a `phaseId`.');
        }

        const payload = buildSessionPayload({
            token: config.token,
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
