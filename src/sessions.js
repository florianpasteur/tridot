import { request } from './http.js';

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
