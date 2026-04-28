import { request } from './http.js';

/** @typedef {import('./client.js').ClientConfig} ClientConfig */

/**
 * Geographic location attached to a pushed workout.
 *
 * @typedef {object} Location
 * @property {number} latitude
 * @property {number} longitude
 * @property {string} name - human-readable label, e.g. `"HOME"`
 */

/**
 * Build a `pushWorkout(sessionId, vendorName, location)` function bound to the given client config.
 *
 * @param {ClientConfig} config
 * @returns {(sessionId: string|number, vendorName: string, location: Location) => Promise<void>} pushes a session to a connected third-party vendor (e.g. `"GARMIN"`)
 */
export function pushWorkout(config) {
    return async function pushWorkoutFn(sessionId, vendorName, location) {
        if (!sessionId || !vendorName) {
            throw new Error('pushWorkout requires (sessionId, vendorName, location).');
        }
        if (!location || location.latitude == null || location.longitude == null || !location.name) {
            throw new Error('pushWorkout requires `location: { latitude, longitude, name }`.');
        }
        await request('/athletesvcs/athlete/sessions/pushworkout', {
            method: 'POST',
            token: config.token,
            baseUrl: config.baseUrl,
            fetchImpl: config.fetchImpl,
            body: {
                memberId: config.athleteId,
                sessionId,
                vendorName,
                latitude: location.latitude,
                longitude: location.longitude,
                location: location.name,
            },
        });
    };
}
