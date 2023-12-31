# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Run `yarn version` to bump the package version number.

**Starter template:**

```md
---

## [1.0.0] - 2023-09-01

### Added

### Fixed

### Changed

### Removed
```

---

## [1.5.1] - 2023-10-06

### Fixed

- Configured Peerbit to make all database changes to propagate to all peers.

### Changed

- Switched from Yarn to NPM, mostly because Pixi.js v8 is coming, and it currently doesn't support Yarn.

---

## [1.5.0] - 2023-10-05

### Added

- Ported and adapted the Peerbit many-chat-room example for Experiment 4.

---

## [1.4.0] - 2023-10-04

### Added

- Production test for SQLite WASM.
- Added support for TypeScript decorator metadata.
- Displaying peer ID in the control layer.
- Added peerbit to Experiment 3.
- Created two test area components.
- Added avatar origin component.
- Added a stub for Experiment 4.

### Changed

- Changed the prototype ship to support the new data flow.

---

## [1.3.0] - 2023-09-14

### Added

- Production test of Peerbit & web worker for Experiment 3.

---

## [1.2.0] - 2023-09-09

### Added

- Added dust ("travel particles").

---

## [1.1.0] - 2023-09-08

### Added

- `useCollisionCallback` hook.

---

## [1.0.29] - 2023-09-08

### Fixed

- Fix for inverted rotation.

---

## [1.0.28] - 2023-09-08

### Fixed

- Ship control tweaking; cleanup.

---

## [1.0.27] - 2023-09-07

### Fixed

- Camera velocity.
- Ship boosting and control at slow speeds.

---

## [1.0.26] - 2023-09-07

### Fixed

- Ship weapons fixes and cleanup.

---

## [1.0.25] - 2023-09-06

### Added

- Nominal types; basic ship weapons.

---

## [1.0.24] - 2023-09-03

### Changed

- Tweaked asteroid field density.

---

## [1.0.23] - 2023-09-03

### Added

- Gave AsteroidSpawnManager parallax support.

---

## [1.0.22] - 2023-09-01

### Fixed

- Fix for default PlanckBody position bug.

---

## [1.0.21] - 2023-09-01

### Fixed

- Fix for bad TextureCache usage.

---

## [1.0.20] - 2023-09-01

### Fixed

- Fix for Pixi cache clear.

---

## [1.0.19] - 2023-09-01

### Added

- Added Asteroid Spawn Manager.

---

## [1.0.18] - 2023-08-30

### Added

- Collideable asteroids.

---

## [1.0.17] - 2023-08-30

### Fixed

- Polished control styles.
- Adjusted contrast on asteroid spritemap.
- Fine-tuned ship acceleration.

---

## [1.0.16] - 2023-08-30

### Added

- `useFpsMeasurement` hook.

### Changed

- Replaced logos with animating asteroids.

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
