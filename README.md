# Music Player Workshop

This monorepo demonstrates a minimal music player UI in various web development frameworks.

<img src="https://github.com/tessmero/mp-workshop/raw/main/screenshot.png"/>

Features: song select, play, stop (no pause), and volume control

### Frameworks

- [angular](https://angular.dev/)
- [react](https://react.dev/)
- [svelte](https://svelte.dev/)
- [vue](https://vuejs.org/)

For each framework, you will find a self-contained npm package under ```packages```.

Each package contains a copy of ```lofi-player``` to interpret non-standard song data. 

Each package contains a copy of all the song data files.

```lofi-player```, ```lofi-songs```, and ```ogg-songs``` are also copied at the root of this repo for your convenience.

### Song Data

Each song has two versions:

(A) Low-fidelity sequence (like midi but simpler). These are encoded in human-readable ```.js``` [example](https://github.com/tessmero/mp-workshop/blob/main/lofi-songs/avalanche.js)

(B) Higher quality ```.ogg``` audio - standard format supported by web browsers.

### Related Projects

- [tessmero.github.io](https://tessmero.github.io/) - showcase of games that feature these songs

- [rain-catcher](https://tessmero.github.io/rain-catcher) - game with a lot of miscellaneous features including a music sequencer

- [sea-block](https://github.com/tessmero/sea-block) - programmatically convert lofi songs to .midi and .ogg based on [spessasynth](https://spessasus.github.io/SpessaSynth/)


