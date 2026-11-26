# BookClub frontend

The React and TypeScript app uses Vite. Use Node 22.12 or later in the Node 22
series to match [CI](../.github/workflows/ci.yml) and the
[locked Vite version](package-lock.json).

## Local development

From `frontend/`, install dependencies and start Vite with the
[local Django API](../bookclub/README.md#setting-up-the-development-environment).

```sh
npm ci
VITE_API_URL=http://localhost:8000/api npm run dev -- --host localhost --port 5173 --strictPort
```

Open `http://localhost:5173`, Django's trusted CSRF origin in development. To use
another API host, set `VITE_API_URL` to its base URL, including `/api`. See the
[authentication flow](../docs/architecture.md#authentication-and-csrf) for
cookie and origin settings.

## Validation

Follow the [frontend check commands in AGENTS.md](../AGENTS.md#development-and-validation-commands).
The [package scripts](package.json) define lint, typecheck, and build.
