# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Run `yarn version` to bump the package version number.

**Starter template:**

```md
---

## [1.0.0] - 2023-08-01

### Added

### Fixed

### Changed

### Removed
```

---

## [1.0.7] - 2023-08-10

### Added

- Installed and set up react-spring.

### Changed

- Experiment 1 now has a react-spring demo.

---

## [1.0.6] - 2023-08-09

### Added

- Installed why-did-you-render for debug assistance.
- Scenes/experiments are now imported dynamically.
- Ported the Parallax library from the prototype. Untested! I just fixed type errors.

### Fixed

- Fixed an issue where the Nextjs router wasn't being passed into the Pixi context.

---

## [1.0.5] - 2023-08-07

### Added

- Ported DebugIndicator.

### Fixed

- Fixed a navigation crash on mobile.

---

## [1.0.4] - 2023-08-03

### Added

- Installed sharp for image optimization.
- Basic site styles.

### Fixed

- Stage hydration error.

### Changed

- Migrated from pages to app dir.
- Replace react-pixi-fiber with @pixi/react.

---

## [1.0.3] - 2023-08-03

### Added

- Installed react-pixi-fiber.
- Package version env var passthrough.

---

## [1.0.2] - 2023-08-02

### Added

- Custom service worker.

### Fixed

- Fixed PWA lifecycle logic.

---

## [1.0.1] - 2023-08-02

### Added

- Eslint and Prettier setup.
- Added package version to render on home page.
- Installed lint-staged and husky to automatically run linter (and quick fixes) on staged files.
- Added some boilerplate PWA lifecycle logic.

### Fixed

- Ran Eslint/Prettier to fix codebase issues.

### Changed

### Removed

- Starter icons.

---

## [1.0.0] - 2023-08-01

### Added

- Created PWA.
- Deployed static files to Netlify.
