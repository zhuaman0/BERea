# 451 — Make Reading a Habit 📚

A reading gamification web application that makes exploring books more engaging and interactive.

## About

451 is built around a simple idea: turn reading into an experience that encourages people to keep going. Users choose books, read, and engage with interactive activities along the way.

The name references *Fahrenheit 451*, reflecting the project's focus on books, knowledge, and the value of reading.

## Project Status

🚧 **Under active development.** Features and implementation details may change.

## Core Experience

- **Book selection** — choose a book and begin your reading journey.
- **Gamified reading** — stay engaged through interactive reading activities.
- **Reading quizzes** — test your understanding of what you read.
- **User accounts** — access the platform through a personal profile.

## Technology

| Area | Technology |
| --- | --- |
| Frontend | Next.js, React, TypeScript |
| Database | PostgreSQL |
| Infrastructure | Docker, Docker Compose, Nginx |
| Code quality | ESLint, Husky, lint-staged |

## Repository Structure

```text
frontend/       Web application
backend/        Backend services
packages/       Shared packages
  api/          API integration
  core/         Shared application logic
  eslint-config/ Shared lint configuration
  ui-kit/       Reusable UI components
docker/         Docker-related configuration
nginx/          Nginx configuration
scripts/        Project scripts
```

## Configuration

Use the provided `.env.example` files as references when configuring your local environment.

Depending on the features you enable, configuration may include:

- Database connection settings
- Authentication and token settings
- Allowed frontend origins
- Google OAuth credentials
- Optional external service API keys

Keep real credentials in local environment files. Never commit passwords, secrets, or API keys to the repository.

## Development

The project separates the frontend, backend, and shared packages to support reusable components and organized development.

Installation commands and local development instructions will be documented as the setup is finalized.

## Vision

Make reading a habit people enjoy returning to — one book, one discovery, and one challenge at a time.
