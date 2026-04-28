# @flow-js/tridot

An unofficial JavaScript client for the [Tridot](https://app.tridot.com/) athlete API.

> **Note**
> This is not affiliated with or endorsed by Tridot. The library calls the
> same endpoints used by the Tridot web app and may break at any time.

## Install

```bash
npm install @flow-js/tridot
```

Requires Node.js 18+ (uses the global `fetch`).

## Quick start

```js
import { createClient, login } from '@flow-js/tridot';

const profile = await login('me@example.com', 'my-password');

const tridot = createClient({
  token: profile.authToken,
  athleteId: profile.athleteId,
});

const day = await tridot.dayDetails('04/28/2026');
console.log(day);
```

## API

### `login(email, password, options?)`

Authenticates against Tridot and returns the response body, including
`authToken` and the athlete profile.

```js
const profile = await login('me@example.com', 'pw');
profile.authToken; // string
profile.athleteId; // number
```

`options` is forwarded to the underlying request (e.g. `fetchImpl`, `baseUrl`).

### `createClient({ token, athleteId, baseUrl?, fetchImpl? })`

Creates a client bound to one athlete + auth token.

| Option       | Required | Description                                                          |
| ------------ | -------- | -------------------------------------------------------------------- |
| `token`      | yes      | Bearer token returned by `login()`                                   |
| `athleteId`  | yes      | Athlete (member) id                                                  |
| `baseUrl`    | no       | Override the API base URL (default `https://api.tridot.com`)         |
| `fetchImpl`  | no       | Custom fetch implementation (e.g. for tests or older Node versions)  |

The returned client exposes:

#### `client.dayDetails(date)`

Fetches the schedule for a single day. `date` is `MM/DD/YYYY`.

```js
const day = await tridot.dayDetails('04/28/2026');
```

#### `client.createSession(session)`

Creates a strength/custom session on the athlete's calendar.

```js
const created = await tridot.createSession({
  name: 'Push day',
  date: '04/28/2026',
  time: '6:00 AM',
  phaseId: 1234567,         // required
  durationSeconds: 3600,    // optional, default 3600
  sessionType: 'strength',  // optional, default 'strength'
  location: 'Home',         // optional
  sessionDetail: {
    warmUp: '10 min easy bike',
    mainSet: '5x5 squats @ 80%',
    coolDown: 'Stretching',
  },
});
```

Required fields: `name`, `date`, `time`, `phaseId`. All other fields fall
back to sensible defaults (see [`src/payloads.js`](./src/payloads.js)).

#### `client.updateSessionTime(sessionId, time)`

Updates the start time of an existing session.

```js
await tridot.updateSessionTime(created.sessionId, '7:00 AM');
```

#### `client.pushWorkout(sessionId, vendorName, location)`

Pushes a session to a connected third-party vendor (e.g. Garmin Connect).

```js
await tridot.pushWorkout(created.sessionId, 'GARMIN', {
  latitude: 51.90891345474881,
  longitude: 4.487193278384377,
  name: 'HOME',
});
```

`location` is required and must be `{ latitude, longitude, name }`.

## Lower-level building blocks

The library also exports a handful of primitives in case you need to call
endpoints directly:

```js
import { request, TridotHttpError, buildSessionPayload } from '@flow-js/tridot';
```

- `request(path, options)` — thin wrapper around `fetch` that handles the
  Tridot-specific headers, base URL, and JSON parsing.
- `TridotHttpError` — thrown for any non-2xx response. Has `status`,
  `statusText`, `url`, and parsed `body`.
- `buildSessionPayload(args)` — constructs the full session-creation
  payload (with all six empty zones, etc.) without sending it.

## License

ISC
