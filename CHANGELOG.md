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

## [1.0.15] - 2023-08-29

### Added

- Spritesheet loading.

---

## [1.0.14] - 2023-08-29

### Added

- Inter-component event system.
- Dpad (mobile) and Overlay (desktop) controls.
- Physics-based ship rotation.

---

## [1.0.13] - 2023-08-24

### Added

- Added a bunch of action buttons to the mobile interface.

---

## [1.0.12] - 2023-08-22

### Added

- Created Button component.

### Fixed

- Now using next-pwa skipWaiting plugin.

---

## [1.0.11] - 2023-08-20

### Added

- Installed the Planck physics engine (a port of Box2D to the web).
- Implemented Planck physics components.
- Added DesktopView and MobileView components for only showing content on the given device.
- Installed an event emitter hook, to facilitate cross-component communication outside of React.
- Started building out Experiment 2, which is becoming a demonstration of controls and physics.

### Fixed

- Disabled the browser's context menu on right-click, in preparation for new control interface.

---

## [1.0.10] - 2023-08-14

### Changed

- Cleaned up the parallax demo.

---

## [1.0.9] - 2023-08-12

### Changed

- Replaced the local parallax library with the official one on NPM.

---

## [1.0.8] - 2023-08-10

### Added

- Added a parallax library test to Experiment 1.

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
