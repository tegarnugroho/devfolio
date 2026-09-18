# DevFolio — Vue 3 + TypeScript + Tailwind

A minimalist, black-and-white professional portfolio built with Vue 3 (Composition API), TypeScript, Vite, and Tailwind CSS.

## Features

- Vue 3 + Composition API + TypeScript
- Tailwind CSS with dark/light theme (class-based)
- Theme switcher with persisted preference
- English and Indonesian localization with language-based URLs
- Responsive layout for mobile, tablet, and desktop
- Smooth scrolling navigation and micro-interactions
- SEO-friendly `index.html` with meta tags

## Getting Started

### Prerequisites

- Node.js 18+ and npm or pnpm or yarn

### Install

```bash
npm install
```

### Develop

```bash
npm run dev
```

Open the printed local URL in your browser. Edit files under `src/` to iterate.

### Type Check

```bash
npm run type-check
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

- `index.html` — App entry + SEO meta
- `vite.config.ts` — Vite config with Vue plugin
- `tailwind.config.ts` — Tailwind config (dark mode via class)
- `postcss.config.js` — PostCSS config
- `src/main.ts` — App bootstrap + theme initialization
- `src/App.vue` — App shell composing all sections
- `src/components/Navbar.vue` — Navigation + theme toggle
- `src/sections/*` — Hero, About, Skills, Projects, Contact sections
- `src/composables/useTheme.ts` — Theme logic with persistence
- `src/types/index.ts` — TypeScript interfaces (Project, Skill)
- `src/styles/tailwind.css` — Tailwind entry and base styles
- `src/locales/en.ts`, `src/locales/id.ts` — Centralized English and Indonesian dictionaries
- `src/composables/useTranslation.ts` — URL-based locale, section routing, switcher, and metadata

## Customization

- Edit English copy and project data in `src/locales/en.ts`.
- Add the corresponding Indonesian copy in `src/locales/id.ts`. Project descriptions are keyed by the unchanged project title.
- Files under `src/content/*Content.ts` re-export English source data for compatibility.
- Adjust typography or spacing via Tailwind utility classes.

## Notes

- Color scheme is intentionally black and white; effects rely on opacity, borders, and movement.
- Section navigation uses one cancellable scroll animation and respects reduced motion.


## Localization

The URL determines the language. `/` redirects to `/en`. `/en` and `/id` show the same portfolio components in English and Indonesian. Section links use paths such as `/en/projects` and `/id/about`; these are sections of the same page, not separate page layouts.

Use `useTranslation()` for the reactive dictionary, readonly locale, and `setLocale()`. Use `sectionHref()` to build section links. The language switcher preserves the current section and its viewport position. Refresh and browser history restore the locale and section from the URL. No localStorage language preference overrides an explicit URL.

The page updates its title, description, HTML language, and alternate language links. Firebase serves direct section paths through the existing SPA rewrite and redirects root requests to `/en`.

Keep names, technology names, URLs, and project identities unchanged. Live Codeary article text comes from the external API; local interface text and article dates follow the selected language.
