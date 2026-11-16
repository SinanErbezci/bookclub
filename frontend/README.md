# BookClub — React Frontend

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

## Local Development

### Prerequisites

- Node.js 22
- npm
- Django backend running locally

### 1. Install Dependencies

From the `frontend/` directory:

```bash
npm ci
```

### 2. Configure the API URL

Create a `.env.local` file inside `frontend/`:

```dotenv
VITE_API_URL=http://localhost:8000/api
```

This configures the frontend to communicate with the local Django backend.

### 3. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

The Django backend must be running for API-dependent functionality. AI-powered features also require the corresponding backend services.

## Available Commands

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

The API client fetches CSRF tokens for state-changing requests and caches them in memory to avoid unnecessary network calls. Tokens are invalidated after authentication changes.

## Deployment

The frontend is deployed as a static application using **Amazon S3 and CloudFront**.

GitHub Actions validates the frontend, builds the Vite application, uploads the generated assets to S3, and invalidates the CloudFront cache.

Deployment configuration is maintained in the main repository's GitHub Actions workflow.

## Related Documentation

- [Main BookClub README](../README.md) — Features, architecture, and AI implementation
- [Django Backend](../bookclub/README.md) — REST API and local backend setup
- [Infrastructure](../infra/README.md) — AWS infrastructure and Terraform