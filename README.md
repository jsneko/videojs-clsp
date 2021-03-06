# Skyline CLSP VideoJS Plugin <!-- omit in toc -->

A `videojs` plugin that adds support for video served over the `clsp` protocol, which is a proprietary near-real-time video streaming protocol only available via Skyline's SFS solutions.

`clsp` protocol support is provided by [https://github.com/skylineos/clsp-player](https://github.com/skylineos/clsp-player).

Note that if you do not specifically need `video.js`, we recommend you use [`clsp-player`](https://github.com/skylineos/clsp-player) as it is more performant and has better memory management.


## Table of Contents <!-- omit in toc -->

- [Supported Browsers](#supported-browsers)
- [URL Structure](#url-structure)
- [Installation](#installation)
  - [Via Yarn](#via-yarn)
  - [Via NPM](#via-npm)
- [Using with `dist` assets](#using-with-dist-assets)
  - [`<head>` Tag](#head-tag)
  - [`<script>` Tag](#script-tag)
  - [`<video>` tag](#video-tag)
- [Using with `src` assets](#using-with-src-assets)
  - [JS](#js)
  - [Styles (SASS)](#styles-sass)
  - [Babel](#babel)
  - [Webpack](#webpack)
- [Dependencies](#dependencies)


## Supported Browsers

This plugin can only support browsers that are supported by the `clsp-player`.  See [https://github.com/skylineos/clsp-player](https://github.com/skylineos/clsp-player) for the list of supported browsers.


## URL Structure

See [https://github.com/skylineos/clsp-player](https://github.com/skylineos/clsp-player) for the URL structure for `clsp` stream URLs.


## Installation


### Via Yarn

```
yarn add @babel/polyfill @skylineos/videojs-clsp
```

### Via NPM

```
npm i @babel/polyfill @skylineos/videojs-clsp
```


## Using with `dist` assets

NOTE: See `demos/simple-dist/` and `demos/advanced-dist/` for full examples.

NOTE: `@babel/polyfill`, `video.js`, `videojs-errors` MUST be sourced/included prior to the plugin.

### `<head>` Tag

```html
<head>
  <!-- CLSP VideoJS Plugin Styles -->
  <link
    rel="stylesheet"
    href="/path/to/dist/videojs-clsp.css"
  >
  <!-- Babel Polyfill -->
  <script
    type="text/javascript"
    src="//cdn.jsdelivr.net/npm/@babel/polyfill@7.8.7/dist/polyfill.min.js"
  ></script>
  <!-- VideoJS -->
  <script
    type="text/javascript"
    src="//vjs.zencdn.net/7.7.5/video.min.js"
  ></script>
  <!-- VideoJS Errors -->
  <script
    type="text/javascript"
    src="//cdn.jsdelivr.net/npm/videojs-errors@4.3.2/dist/videojs-errors.min.js"
  ></script>
<head>
```

### `<script>` Tag

```html
<!-- CLSP VideoJS Plugin -->
<script src="/path/to/dist/videojs-clsp.min.js"></script>

<script>
  // construct the player
  var player = window.videojs('my-video');

  // Only use CLSP if in a supported browser
  if (window.clspUtils.supported()) {
    // Note - This must be executed prior to playing the video for CLSP streams
    window.player.clsp();

    // If you are using a Skyline SFS that uses a default CLSP stream port that
    // isn't `80` (e.g. SFS < v5.2.0), you may set the window-level default port
    // for `clsp` streams:
    window.clspUtils.setDefaultStreamPort('clsp', 9001);
  }

  // When the player is ready, start playing the stream
  window.player.on('ready', function () {
    // Even though the "ready" event has fired, it's not actually ready
    // until the "next tick"...
    setTimeout(function () {
      window.player.play();
    });
  });
</script>
```

### `<video>` tag

NOTE: with `clsp-player`, it is recommended that you have an "extra" container element wrapping your video element.  When using `video.js`, a wrapper element will be created for you, so the extra one is not needed.

Note that for `clsp` streams, the `src` tag must have a `type` attribute with a value of `video/mp4; codecs='avc1.42E01E'`.

```html
<div class="video-container">
  <video
    id="my-video"
    class="video-js vjs-default-skin"
    controls
  >
    <!-- CLSP Stream -->
    <source
      src="clsp://172.28.12.57:9001/FairfaxVideo0510"
      type="video/mp4; codecs='avc1.42E01E'"
    />
    <!-- HLS Stream -->
    <source
      src="http://172.28.12.57:1935/rtplive/FairfaxVideo0510/playlist.m3u8"
      type="application/x-mpegURL"
    />
  </video>
</div>
```


## Using with `src` assets

NOTE: See `demos/simple-src/` and `demos/advanced-src/` for full examples.

NOTE: `@babel/polyfill`, `video.js`, `videojs-errors` MUST be sourced/included prior to the plugin.

### JS

```js
import '@babel/polyfill';
import videojs from 'video.js';
import videojsErrors from 'videojs-errors/dist/videojs-errors.es';

import clspUtils from '@skylineos/videojs-clsp/src/js/utils';
import clspPlugin from '@skylineos/videojs-clsp/src/js/plugin';

// If you are using a Skyline SFS that uses a default CLSP stream port that
// isn't `80` (e.g. SFS < v5.2.0), you may set the window-level default port
// for `clsp` streams:
clspUtils.setDefaultStreamPort('clsp', 9001);

clspPlugin().register();

const player = videojs('my-video', {
  autoplay: true,
  muted: true,
  preload: 'auto',
  controls: false,
  sources: [
    {
      src: 'clsp://172.28.12.57:9001/FairfaxVideo0510',
      type: "video/mp4; codecs='avc1.42E01E'",
    },
    {
      src: 'http://172.28.12.57:1935/rtplive/FairfaxVideo0510/playlist.m3u8',
      type: 'application/x-mpegURL',
    },
  ],
});

if (clspUtils.supported()) {
  player.clsp();
}
```

### Styles (SASS)

```scss
@import '/path/to/node_modules/@skylineos/videojs-clsp/src/styles/videojs-clsp.scss';
```

### Babel

The babel config that is needed to properly build the src assets is located in the file `babel.config.js` at the root of the project.  You will need to use this babel config as part of your build process, e.g. in your webpack configuration.  You can either copy and paste the configuration into your project or import the babel config file.


### Webpack

Note that you will need to apply the appropriate babel config options to the `@skylineos/videojs-clsp` src assets.  See the `Babel` section above.  Note that by default, webpack will ignore files in the `node_modules` directory, which means that the `videojs-clsp` src assets will not be parsed by babel.  In order to get webpack to properly handle the files, you will need to add the following rule to your webpack config file:

```js
{
  module: {
    rules: [
      {
        // Add the `include` rule to the rule that will end up processing the `videojs-clsp` js, e.g.:
        // test: /\.js$/,
        // loader: 'babel-loader?cacheDirectory=true',
        // options: babelConfig,
        include: [
          path.resolve(
            __dirname,
            'node_modules',
            '@skylineos',
            'videojs-clsp',
            'src',
          ),
          path.resolve(
            __dirname,
            'node_modules',
            '@skylineos',
            'clsp-player',
            'src',
          ),
        ],
      },
    ],
  },
},
```


## Dependencies

`@babel/polyfill` `7.8.7` is required.

`video.js` `7.7.5` is the recommended version.  Version `6.x` is not recommended due to it being less performant over time.

We recommend using `videojs-errors`.  Version `4.3.2` is recommended, because as of version `4.2.0`, it allows us to re-register successive errors to respond to successfive failures as necessary to support stream recovery.

