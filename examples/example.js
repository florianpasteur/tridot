import {writeFile, mkdir} from 'node:fs/promises';
import {join} from 'node:path';

import {createClient, login} from '../src/index.js';

/**
 * Logs in, walks two weeks starting from the current Monday, and exports
 * each scheduled session's workout file (`.fit`) plus its raw session
 * JSON into `./{weekNumber}/{sessionId}/`.
 *
 * Reads `TRIDOT_EMAIL` and `TRIDOT_PASSWORD` from the environment.
 *
 * @returns {Promise<void>}
 */
async function main() {
    const profile = await login(process.env.TRIDOT_EMAIL, process.env.TRIDOT_PASSWORD);
    const tridot = createClient({
        token: profile.authToken,
        athleteId: profile.athleteProfile.athleteId,
    });

    for (let i = 0; i < 14; i++) {
        const dayOfTheWeek = weekDay(i);
        const dateStr = yyyyMMdd(dayOfTheWeek);
        const currentWeekNumber = `w${weekNumber(dayOfTheWeek)}`;

        try {
            const trainingDay = await tridot.dayDetails(dateStr);

            for (const session of trainingDay.sessions || []) {
                console.log(session.sessionType, session.sessionZoneLabel)
                const workoutBin = await tridot.exportWorkout(session.sessionId, {
                    fileType: 'FIT',
                    metric: 'PACE',
                });


                const filename = ext => `${dateStr}_${session.sessionType}_${session.sessionId}.${ext}`;
                await mkdir(join(currentWeekNumber, session.sessionId), { recursive: true });
                await writeFile(join(currentWeekNumber, session.sessionId, filename('fit')), Buffer.from(workoutBin.arrayBuffer));
                await writeFile(join(currentWeekNumber, session.sessionId, filename('json')), JSON.stringify(session, null, 4));
            }
        } catch (e) {
            console.error(e);
        }
    }
}

main();

/**
 * ISO 8601 week number (1-based, weeks start Monday, week 1 contains
 * the first Thursday of the year).
 *
 * @param {Date} date
 * @returns {number} 1..53
 */
function weekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1);
    return Math.ceil(((d.getTime() - yearStart) / 86400000 + 1) / 7);
}


/**
 * Get the date `offset` days after the Monday of the current local week.
 * `offset === 0` returns this Monday; `offset === 7` returns next Monday.
 *
 * @param {number} offset - day offset from this week's Monday (can be negative)
 * @returns {Date} a `Date` at local midnight
 */
function weekDay(offset) {
    const today = new Date();
    const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    monday.setDate(monday.getDate() + (monday.getDay() === 0 ? -6 : 1 - monday.getDay()));
    const d = new Date(monday);
    d.setDate(monday.getDate() + offset);
    return d;
}

/**
 * Format a `Date` as `YYYY-MM-DD` using local time.
 *
 * @param {Date} date
 * @returns {string}
 */
function yyyyMMdd(date) {
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
}
