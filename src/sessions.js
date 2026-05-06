import { request, requestBinary } from './http.js';

/** @typedef {import('./client.js').ClientConfig} ClientConfig */

/**
 * Options for POST `/sessions/:id/workout/export` (mirrors the web app export dialog).
 *
 * @typedef {object} WorkoutExportOptions
 * @property {'FIT'|'MRC'|'ZWO'|'ERG'} [prefExportFileType] - defaults to `"FIT"`
 * @property {number} [defaultPrependWUTime] - seconds prepended to warm-up (default `0`)
 * @property {number} [defaultAppendMSTime] - seconds appended to main set (default `0`)
 * @property {number} [defaultWUMSInsertTime] - seconds inserted between warm-up and main set (default `0`)
 * @property {boolean} [exportHrForLowIntensity] - default `true`
 * @property {'POWER'|'HR'|'PACE'} [prefIntensityMetric] - default `"PACE"`
 */

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

/** @typedef {{ arrayBuffer: ArrayBuffer, contentType: string, contentDisposition: string | null }} BinaryResponse */

/**
 * Build an `exportWorkout(sessionId, options)` function bound to the given client config.
 *
 * @param {ClientConfig} config
 * @returns {(sessionId: string|number, options?: WorkoutExportOptions) => Promise<BinaryResponse>} downloads the exported workout file (e.g. FIT)
 */
export function exportWorkout(config) {
    return async function exportWorkoutFn(sessionId, options = {}) {
        if (sessionId == null || sessionId === '') {
            throw new Error('exportWorkout requires a sessionId.');
        }

        const body = {
            prefExportFileType: options.prefExportFileType ?? 'FIT',
            defaultPrependWUTime: options.defaultPrependWUTime ?? 0,
            defaultAppendMSTime: options.defaultAppendMSTime ?? 0,
            defaultWUMSInsertTime: options.defaultWUMSInsertTime ?? 0,
            exportHrForLowIntensity: options.exportHrForLowIntensity ?? true,
            prefIntensityMetric: options.prefIntensityMetric ?? 'PACE',
        };

        return requestBinary(
            `/athletesvcs/athlete/sessions/${encodeURIComponent(String(sessionId))}/workout/export`,
            {
                method: 'POST',
                token: config.token,
                baseUrl: config.baseUrl,
                fetchImpl: config.fetchImpl,
                body,
            }
        );
    };
}
