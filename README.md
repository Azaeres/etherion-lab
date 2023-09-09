# Etherion Laboratory

[Check it out here!](https://lab.etherion.app/)

This is a software development playground, a place to run experiments, where knowledge is built alongside software. It's also a rapid deployment target, a place to demonstrate proofs of concept.

Experiment 1 is a demo of the parallax library we're using. It's called `pixi-react-parallax` on NPM, and it's tiny (30 kB unpacked).

Experiment 2 is a simple spaceship shooting game, like Asteroids. It proves that React can indeed be used to build high-performance web apps like games, even on mobile. The game state is all React hooks in the client. It's also responsive, presenting a different control interface for users on mobile.

Desktop controls: 
- Left click: Move
- Right click: Fire weapons
- Spacebar: Brake

The stack: Next.js PWA (Static Site Generation), React, Pixi.js, TypeScript, Planck.js (Box2d ported to JS/TS).
