# Portfolio Site

A personal portfolio website built with **React**, **TypeScript**, and **Vite**. It showcases projects, certificates, and a downloadable CV, and includes a small interactive **cultivation idle game** hidden inside the experience.

**Live site:** [ranggadk.com](https://ranggadk.com)

![Social preview](public/social-preview.png)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [The Cultivation Game](#the-cultivation-game)
- [SEO and PWA](#seo-and-pwa)
- [Linting and Type Checking](#linting-and-type-checking)
- [Deployment](#deployment)
- [Customizing for Your Own Use](#customizing-for-your-own-use)
- [License](#license)
- [Contact](#contact)

---

## Features

- **Portfolio sections** presenting profile, projects, certificates, and contact information
- **Downloadable CV** and certificates (image and PDF versions) served as static assets
- **Animated loading screen** and decorative hero backdrop
- **Cultivation game** with realm progression and browser-based save/load (see below)
- **Installable PWA metadata**: web manifest, adaptive icons, Apple touch icon
- **SEO basics**: `robots.txt`, `sitemap.xml`, and a social preview image for link sharing
- **Fast tooling**: Vite for instant dev server and optimized production builds, Oxlint for quick linting

## Tech Stack

| Area | Technology |
|---|---|
| UI library | [React](https://react.dev) |
| Language | [TypeScript](https://www.typescriptlang.org) |
| Build tool | [Vite](https://vite.dev) |
| Linting | [Oxlint](https://oxc.rs/docs/guide/usage/linter) |
| Styling | Plain CSS (`App.css`, `game.css`, `loader.css`) |
| Package manager | npm |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) **20.19+** or **22.12+** (required by current Vite versions)
- npm (bundled with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/RKPYI/randk.git
cd randk

# Install dependencies from the lockfile
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173` by default, with hot module replacement enabled.

## Available Scripts

| Command | Description |
|---|---|
| `npm install` | Install the exact dependency tree from `package-lock.json` |
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Type-check with TypeScript and create a production build in `dist/` |
| `npm run lint` | Run Oxlint across the project |
| `npm run preview` | Serve the production build locally for review |

## Project Structure

```text
.
├── public/                  # Static assets served as-is
│   ├── cv.pdf               # Downloadable CV
│   ├── *-certificate.jpg    # Certificate images
│   ├── *-certificate.pdf    # Certificate PDFs
│   ├── profile.png          # Profile image
│   ├── social-preview.png   # Open Graph / social card image
│   ├── site.webmanifest     # PWA manifest
│   ├── robots.txt           # Crawler rules
│   ├── sitemap.xml          # Sitemap
│   └── icon-*.png, favicon.* # App and browser icons
├── src/
│   ├── App.tsx              # Main application component
│   ├── App.css              # Layout and section styling
│   ├── HeroBackdrop.tsx     # Decorative hero background
│   ├── LoadingScreen.tsx    # Loading screen component
│   ├── loader.css           # Loading screen styles
│   ├── index.css            # Global base styles
│   ├── main.tsx             # React entry point
│   ├── assets/              # Bundled images and logos
│   └── game/                # Cultivation game feature
│       ├── CultivationGame.tsx
│       ├── RealmOverlay.tsx
│       ├── useCultivation.ts
│       ├── logic.ts
│       ├── config.ts
│       ├── save.ts
│       └── game.css
├── index.html               # Vite HTML entry
├── vite.config.ts           # Vite configuration
├── tsconfig*.json           # TypeScript configuration
└── .oxlintrc.json           # Oxlint configuration
```

## The Cultivation Game

The `src/game/` directory contains a self-contained cultivation-style progression game. It is structured to keep concerns separate:

| File | Responsibility |
|---|---|
| `config.ts` | Constants such as realms, costs, and progression settings |
| `logic.ts` | Pure functions for progression, calculations, and state transitions |
| `save.ts` | Saving and loading progress through browser storage |
| `useCultivation.ts` | React hook connecting logic and persistence to component state |
| `CultivationGame.tsx` | Main game UI |
| `RealmOverlay.tsx` | Overlay displaying realm and progression information |
| `game.css` | Game-specific styling |

Game progress is stored locally in the browser, so it is private to each visitor and is not sent to any server.

## SEO and PWA

- `public/robots.txt` and `public/sitemap.xml` support search engine crawling. Update the URLs in both files to match your production domain.
- `public/site.webmanifest` defines the app name, theme, and icons (including a maskable icon for Android).
- `public/social-preview.png` is used for link previews. Make sure the matching `<meta property="og:image">` tags in `index.html` point to your deployed URL.

## Linting and Type Checking

The project uses Oxlint for linting and TypeScript for static checks.

```bash
npm run lint    # Lint the codebase
npm run build   # Includes a full TypeScript type-check
```

For stricter checking, you can enable type-aware linting by installing `oxlint-tsgolint` and setting `"options": { "typeAware": true }` in `.oxlintrc.json`. See the [Oxlint docs](https://oxc.rs/docs/guide/usage/linter/rules) for available rules.

## Deployment

`npm run build` outputs a static site to `dist/`, which can be hosted on any static host:

- **Vercel / Netlify / Cloudflare Pages**: connect the repository, set the build command to `npm run build` and the output directory to `dist`
- **GitHub Pages**: build locally or in CI and publish the `dist/` folder (set `base` in `vite.config.ts` if deploying to a sub-path)
- **Any web server**: upload the contents of `dist/`

Preview the production build locally before deploying:

```bash
npm run build
npm run preview
```

## Customizing for Your Own Use

This is a personal portfolio, but you are welcome to use the code as inspiration or a starting point. If you do, please **replace all personal content** first:

- `public/profile.png`, `public/cv.pdf`, and all certificate files
- Text, links, and project descriptions in `src/App.tsx`
- Metadata in `index.html`, `site.webmanifest`, `sitemap.xml`, and `robots.txt`

See [License](#license) for what you may and may not reuse.

## License

The **source code** in this repository is released under the [MIT License](LICENSE).

Personal content, including my name, profile photo, CV, certificates, and project artwork, is **not** covered by the MIT License and is all rights reserved. See [NOTICE.md](NOTICE.md) for details.

## Contact

- **Name:** Rangga Danu Kusuma
- **Website:** [ranggadk.com](https://ranggadk.com)
- **Email:** romagading@gmail.com
- **LinkedIn:** [linkedin.com/in/rangga-danu-kusuma-62b34a310](https://www.linkedin.com/in/rangga-danu-kusuma-62b34a310/)
- **GitHub:** [@RKPYI](https://github.com/RKPYI)