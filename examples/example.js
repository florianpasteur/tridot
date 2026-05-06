import {createClient, login} from '../src/index.js';

async function main() {
    const profile = await login(process.env.TRIDOT_EMAIL, process.env.TRIDOT_PASSWORD);
    const tridot = createClient({
        token: profile.authToken,
        athleteId: profile.athleteProfile.athleteId,
    });

    const today = new Date();
    const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    monday.setDate(monday.getDate() + (monday.getDay() === 0 ? -6 : 1 - monday.getDay()));

    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const yyyy = d.getFullYear();
        // const dateStr = `${mm}/${dd}/${yyyy}`;
        const dateStr = `${yyyy}-${mm}-${dd}`;
        try {
            const day = await tridot.dayDetails(dateStr);

            for (const session of day.sessions || []) {
                const workoutBin = await tridot.exportWorkout(session.sessionId, {
                    fileType: 'FIT',
                    metric: 'PACE',
                });

                console.log(workoutBin);


            }
        } catch (e) {
            console.error(e);
        }
    }
}

main();
