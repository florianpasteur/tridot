# @flow-js/tridot

An unofficial JavaScript client for the [Tridot](https://app.tridot.com/) athlete API.

> **Note**
> This is not affiliated with or endorsed by Tridot. The library calls the
> same endpoints used by the Tridot web app and may break at any time.

For a runnable end-to-end example (login, walk two weeks of training, and
export each session as a `.fit` file plus its raw JSON), see
[`examples/example.js`](./examples/example.js).

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

#### `client.exportWorkout(sessionId, options?)`

Downloads an exported workout file for a session (the same export the
Tridot web app produces). Resolves to a `BinaryResponse`:

```js
const workout = await tridot.exportWorkout(session.sessionId, {
  fileType: 'FIT',   // 'FIT' | 'MRC' | 'ZWO' | 'ERG', default 'FIT'
  metric: 'PACE',    // 'POWER' | 'HR' | 'PACE',       default 'PACE'
});

await writeFile('workout.fit', Buffer.from(workout.arrayBuffer));
```

`options` (all optional):

| Field                     | Default  | Description                                      |
| ------------------------- | -------- | ------------------------------------------------ |
| `fileType`                | `'FIT'`  | One of `'FIT'`, `'MRC'`, `'ZWO'`, `'ERG'`        |
| `metric`                  | `'PACE'` | Intensity metric: `'POWER'`, `'HR'`, `'PACE'`    |
| `extraTimeBeforeWarmUp`   | `0`      | Seconds prepended to the warm-up                 |
| `extraTimeBeforeMainSet`  | `0`      | Seconds inserted between warm-up and main set    |
| `extraTimeAfterMainSet`   | `0`      | Seconds appended to the main set                 |
| `exportHrForLowIntensity` | `true`   | Include HR targets for low-intensity intervals   |

The returned object is `{ arrayBuffer, contentType, contentDisposition }`.

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
