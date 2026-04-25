# Studio Prep

Studio Prep is a local-first content preparation tool for selecting images, preparing channel-specific exports, drafting copy, and running a manual review workflow before publishing.

## MVP Prototype Stack

- Tauri
- React
- TypeScript
- Tailwind CSS

## Current Scope

The current implementation is a dummy-data UI prototype only.

- No SQLite connection yet
- No local folder access yet
- No AI API call yet
- Full UI flow for dashboard, project detail, text editing, and review/export
- Smart Store detail page reserved as a phase-2 placeholder

## Run

```bash
npm install
npm run dev
```

Tauri shell commands are also prepared:

```bash
npm run tauri:dev
npm run tauri:build
```

## Key Folders

- `src/`: React application code
- `src/data/`: dummy data for projects, images, drafts, and presets
- `src/state/`: state structure prepared for future SQLite / filesystem adapters
- `src/screens/`: main MVP screens
- `src/components/`: reusable UI building blocks
- `src-tauri/`: Tauri shell scaffold

Legacy `app/` and `electron/` files remain in the repository as older scaffold artifacts and are not the main entry for this MVP.
