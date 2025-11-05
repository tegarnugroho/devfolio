# DevFolio — Vue 3 + TypeScript + Tailwind

A minimalist, black-and-white professional portfolio built with Vue 3 (Composition API), TypeScript, Vite, and Tailwind CSS.

## Features

- Vue 3 + Composition API + TypeScript
- Tailwind CSS with dark/light theme (class-based)
- Theme switcher with persisted preference
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

## Customization

- Replace "Your Name" and placeholder links in components.
- Add your own projects in `src/sections/ProjectsSection.vue`.
- Adjust typography or spacing via Tailwind utility classes.

## Notes

- Color scheme is intentionally black and white; effects rely on opacity, borders, and movement.
- Smooth scrolling is enabled via Tailwind’s `scroll-smooth` on `html`.

