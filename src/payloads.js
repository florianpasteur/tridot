/** @type {readonly ['z1', 'z2', 'z3', 'z4', 'z5', 'z6']} */
export const ZONE_TYPES = ['z1', 'z2', 'z3', 'z4', 'z5', 'z6'];

/**
 * Empty zone object as expected by the schedule-add endpoint.
 *
 * @typedef {object} Zone
 * @property {string} zoneType - one of {@link ZONE_TYPES}
 * @property {string} zoneLabel
 * @property {string} planned
 * @property {string} actual
 * @property {string} percentage
 * @property {string} pace
 * @property {string} rpe
 * @property {string} power
 * @property {string} hr
 */

/**
 * Build an empty zone entry for the given zone type.
 *
 * @param {string} zoneType - one of {@link ZONE_TYPES}
 * @returns {Zone}
 */
export function emptyZone(zoneType) {
    return {
        zoneType,
        zoneLabel: '',
        planned: '',
        actual: '',
        percentage: '',
        pace: '',
        rpe: '',
        power: '',
        hr: '',
    };
}

/**
 * Arguments accepted by {@link buildSessionPayload}.
 *
 * @typedef {object} BuildSessionPayloadArgs
 * @property {string} token - bearer token, sent in the payload header
 * @property {number|string} athleteId - athlete (member) id
 * @property {number|string} phaseId - current training phase id
 * @property {string} name - session display name
 * @property {string} date - session date in `MM/DD/YYYY` format
 * @property {string} time - session start time, e.g. `"6:00 AM"`
 * @property {number} [durationSeconds] - planned duration in seconds (default `3600`)
 * @property {string} [sessionType] - default `"strength"`
 * @property {string} [sessionZoneLabel] - default `"STRENGTH Session"`
 * @property {string} [location] - default `"Home"`
 * @property {string} [image] - default `"images/strength-new.png"`
 * @property {import('./schedule.js').SessionDetail} [sessionDetail] - warm up / main set / cool down text
 * @property {Record<string, unknown>} [overrides] - merged into the body to override any field
 */

/**
 * Build the full payload sent to the schedule-add endpoint.
 *
 * @param {BuildSessionPayloadArgs} args
 * @returns {{ header: { accessToken: string }, body: Record<string, unknown> }}
 */
export function buildSessionPayload({
    token,
    athleteId,
    phaseId,
    name,
    date,
    time,
    durationSeconds = 3600,
    sessionType = 'strength',
    sessionZoneLabel = 'STRENGTH Session',
    location = 'Home',
    image = 'images/strength-new.png',
    sessionDetail = { warmUp: 'Warm up', mainSet: 'Main set', coolDown: 'Cool down' },
    overrides = {},
}) {
    return {
        header: { accessToken: token },
        body: {
            athleteId,
            sessionId: 123,
            sessionType,
            date,
            dayName: null,
            phaseId,
            sessionName: name,
            sessionTime: time,
            sessionZoneLabel,
            plannedTotal: durationSeconds,
            actualTotal: '',
            location,
            image,
            isLinkedFile: false,
            isSystemGenerated: false,
            isCoachCreated: false,
            isCoachAdjusted: '',
            isAthleteCreated: true,
            indoor: null,
            msCompletion: null,
            wuCompletion: null,
            sessionLevel: '',
            isMovedToDifferentWeek: false,
            isFromDifferentWeek: false,
            linkedFiles: [],
            zones: ZONE_TYPES.map(emptyZone),
            achievement: null,
            sessionVideos: null,
            interference: [0],
            sessionDetail,
            myNotes: [],
            sessionNotes: [],
            sessionChats: [],
            warmUpDuration: null,
            addlData: {},
            ...overrides,
        },
    };
}
