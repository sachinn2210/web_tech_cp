# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Campus Forum - A Django-based Q&A and Achievements platform for college students and faculty. The project has a Django REST API backend and a Next.js frontend.

## Commands

### Backend (Django)

```bash
# Install dependencies
pip install -r requirements.txt

# Run development server
python manage.py runserver

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run tests
python manage.py test qa
python manage.py test achievements
```

### Frontend (Next.js)

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev

# Build
npm run build

# Lint
npm run lint
```

## Architecture

### Backend Structure

- **campus_forum/** - Django project configuration (settings, URLs, WSGI/ASGI)
- **qa/** - Questions & Answers app with voting, categories, tags, user profiles, and reputation system
- **achievements/** - Student achievements app (hackathons, competitions, awards)
- **templates/** - Django HTML templates for server-rendered pages
- **api_urls.py** - REST API router configuration using DRF with SimpleJWT

### Frontend Structure

- **frontend/app/** - Next.js 16 app directory with pages (home, login, signup, question detail, profile)
- **frontend/components/** - React components (Navbar, QuestionCard, Filters)
- **frontend/context/** - React context providers (AuthContext for JWT handling)
- **frontend/lib/** - API client utilities (axios-based HTTP client)

### Key Patterns

- **Backend**: Class-based API views (ViewSet pattern), JWT authentication via SimpleJWT, signal-based reputation tracking
- **Frontend**: Next.js 16 with App Router, React hooks, client-side API calls with axios
- **API Communication**: CORS enabled for localhost:3000, Bearer token authentication

### Database

Configured for PostgreSQL (collegehub). Settings located in `campus_forum/settings.py`.

## API Endpoints

Base URL: `/api/`

- `/api/token/` - JWT token acquisition
- `/api/questions/` - Question CRUD + upvote/downvote
- `/api/answers/` - Answer CRUD + upvote/downvote + mark_best
- `/api/categories/`, `/api/tags/` - Read-only lookups
- `/api/achievements/` - Achievement CRUD
- `/api/profiles/` - User profile management
- `/api/auth/me/` - Current user info
- `/api/register/` - User registration

See `API_DOCUMENTATION.md` for complete API reference.

## Important Files

- `campus_forum/settings.py` - Django settings (database, REST framework, CORS, JWT)
- `qa/models.py` - Question, Answer, Tag, Category, UserProfile models
- `achievements/models.py` - Achievement model
- `qa/api_views.py` - REST API viewsets
- `qa/serializers.py`, `achievements/serializers.py` - DRF serializers
