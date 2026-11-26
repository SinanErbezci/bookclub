# BookClub frontend

The BookClub frontend is a single-page application built with **React 19, TypeScript, and Vite**. It provides the interface for discovering books, searching, managing personal lists, writing reviews, and exploring AI-powered recommendations.

The application communicates with the Django REST API and uses React Router for client-side navigation, CSS Modules for component styling, and Bootstrap for shared UI styling.

For the complete project architecture and features, see the [main BookClub README](../README.md).

## Project Structure

| Directory | Responsibility |
|---|---|
| `src/api/` | API client and endpoint-specific request functions |
| `src/components/` | Reusable UI components, including book cards, navigation, search, and recommendations |
| `src/context/` | Authentication and toast notification contexts |
| `src/features/` | Feature-specific components, including reviews |
| `src/pages/` | Route-level pages for browsing, books, authors, genres, search, and user profiles |
| `src/styles/` | Global styles |
| `src/types/` | TypeScript interfaces and types |
| `src/assets/` | Images, icons, and other application assets |

## Local development

Use Node 22.12 or later in the Node 22 series to match
[CI](../.github/workflows/ci.yml) and the [locked Vite version](package-lock.json).
From `frontend/`, install dependencies and start Vite with the
[local Django API](../bookclub/README.md#setting-up-the-development-environment).

```sh
npm ci
VITE_API_URL=http://localhost:8000/api npm run dev -- --host localhost --port 5173 --strictPort
```

Open `http://localhost:5173`, Django's trusted CSRF origin in development. To use
another API host, set `VITE_API_URL` to its base URL, including `/api`. You can
also put `VITE_API_URL=http://localhost:8000/api` in `frontend/.env.local`
and omit the inline variable. AI features require the corresponding backend
services.

## Commands and validation

See [AGENTS.md](../AGENTS.md#development-and-validation-commands) for the
frontend checks and [package.json](package.json) for the scripts.

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build the production application into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |

## API Integration & Authentication

API requests are handled through a shared client in `src/api/client.ts`, with endpoint-specific functions organized under `src/api/`.

BookClub uses Django session-based authentication with credentialed requests and CSRF protection.

The API client fetches and caches a CSRF token for state-changing requests.
It clears the token after successful login, signup, and logout, and after a
`403`. The next write fetches a fresh token. See the
[authentication flow](../docs/architecture.md#authentication-and-csrf) for
cookie and origin settings.

## Deployment

The frontend is deployed as a static application using **Amazon S3 and CloudFront**.

GitHub Actions validates the frontend, builds the Vite application, uploads the generated assets to S3, and invalidates the CloudFront cache.

See the [GitHub Actions workflow](../.github/workflows/ci.yml) for deployment configuration.

## Related Documentation

- [Main BookClub README](../README.md) — Features, architecture, and AI implementation
- [Django Backend](../bookclub/README.md) — REST API and local backend setup
- [Infrastructure](../infra/README.md) — AWS infrastructure and Terraform
