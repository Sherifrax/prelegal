# Prelegal Project

## Overview

This is a SaaS product to allow users to draft legal agreements based on templates in the templates directory.
The user can carry out AI chat in order to establish what document they want and how to fill in the fields.
The available documents are covered in the catalog.json file in the project root, included here:

@catalog.json

The current implementation supports all 11 document types via AI chat, with JWT-based user authentication. Document persistence is planned but not yet built (see Planned section below).

## Development process

When instructed to build a feature:
1. Use your Atlassian tools to read the feature instructions from Jira
2. Develop the feature - do not skip any step from the feature-dev 7 step process
3. Thoroughly test the feature with unit tests and integration tests and fix any issues
4. Submit a PR using your github tools

## AI design

When writing code to make calls to LLMs, use your Cerebras skill to use LiteLLM via OpenRouter to the `openrouter/openai/gpt-oss-120b` model with Cerebras as the inference provider. You should use Structured Outputs so that you can interpret the results and populate fields in the legal document.

There is an OPENROUTER_API_KEY in the .env file in the project root.

## Technical design

The entire project should be packaged into a Docker container.
The backend should be in backend/ and be a uv project, using FastAPI.
The frontend should be in frontend/
The database should use SQLLite and be created from scratch each time the Docker container is brought up, allowing for a users table with sign up and sign in.
Consider statically building the frontend and serving it via FastAPI, if that will work.
There should be scripts in scripts/ for:
```bash
# Mac
scripts/start-mac.sh    # Start
scripts/stop-mac.sh     # Stop

# Linux
scripts/start-linux.sh
scripts/stop-linux.sh

# Windows
scripts/start-windows.ps1
scripts/stop-windows.ps1
```
Backend available at http://localhost:8000

## Color Scheme
- Accent Yellow: `#ecad0a`
- Blue Primary: `#209dd7`
- Purple Secondary: `#753991` (submit buttons)
- Dark Navy: `#032147` (headings)
- Gray Text: `#888888`

## Implementation Status

### Completed (PL-4)
- Docker multi-stage build (Node frontend + Python backend)
- FastAPI backend with SQLite (fresh DB each container start)
- Next.js static export served by FastAPI at localhost:8000
- Auth routes: POST /api/auth/signup, POST /api/auth/signin, POST /api/auth/signout, GET /api/auth/me
- Start/stop scripts for Mac, Linux, Windows
- Mutual NDA form with live preview and PDF download

### Completed (PL-5)
- AI chat interface replaces manual form for NDA creation
- Uses LiteLLM via OpenRouter with Cerebras inference (gpt-oss-120b model)
- Structured outputs for reliable field extraction from conversation
- Live preview updates as AI extracts fields from chat
- AI greets user, asks questions conversationally, and confirms when complete
- Download button appears when all required fields are gathered

### Completed (PL-6)
- Support for all 11 document types from catalog.json, via a declarative per-type field/party registry (`backend/app/document_types.py`, mirrored on the frontend in `frontend/src/lib/document-types.ts`) rather than one-off per-type code
- The AI detects which document type the user wants from the conversation (or asks if it's unclear); if the user asks for something outside the catalog, it explains that and suggests the closest supported type before proceeding
- One generic, data-driven cover-page component (`DocumentCoverPage.tsx`) renders every type's fields and signature block; the Mutual NDA keeps its original bespoke layout for its term-length checkboxes
- One generic Standard Terms renderer (`StandardTerms.tsx`), fed by per-type legal text derived from the actual `templates/*.md` files, with the fields each type tracks rendered as live tooltip tokens
- The AI always asks a specific follow-up question whenever required fields are still missing, rather than trailing off
- Fixed chat input text being invisible while typing in dark mode (missing explicit text/background color)

### Current API Endpoints
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Sign in and receive JWT cookie
- `POST /api/auth/signout` - Clear auth cookie
- `GET /api/auth/me` - Get current user info
- `GET /api/chat/greeting` - Get AI greeting
- `POST /api/chat/message` - Send chat message and get AI response
- `GET /api/health` - Health check

## Planned (not yet implemented)

### PL-7 (planned)
- Document persistence - users can save documents to their account
- My Documents modal to view, load, and delete saved documents
- New Document button to start fresh
- Protected document save/load endpoints (`GET/POST /api/documents`, `GET/PUT/DELETE /api/documents/{id}`)

(User signup/signin/signout, JWT HttpOnly cookie auth, and the sign-out user menu are already implemented — see PL-4 above and `frontend/src/components/AuthBar.tsx`.)
