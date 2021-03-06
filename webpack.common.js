'use strict';

const path = require('path');
const chalk = require('chalk');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');

const babelConfig = require('./babel.config');
const utils = require('./src/js/utils');

const devMode = process.env.NODE_ENV !== 'production';

function generateProgressBarPlugin (name) {
  const building = chalk.bold(`Building ${name} page...`);
  const bar = chalk.bgBlue.white.bold('[:bar]');
  const percent = chalk.bold.green(':percent');
  const elapsed = chalk.bold('(:elapsed seconds)');

  return new ProgressBarPlugin({
    format: `   ${building} ${bar} ${percent} ${elapsed}`,
    clear: false,
  });
}

const outputPath = path.resolve(
  __dirname,
  'dist',
);
const demoOutputPath = path.resolve(
  outputPath,
  'demos',
);

function generateConfig (name, entry) {
  return {
    name,
    entry: {
      // @see - https://github.com/webpack-contrib/webpack-serve/issues/27
      [name]: [
        entry,
      ],
    },
    output: {
      path: outputPath,
      filename: '[name].js',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader?cacheDirectory=true',
          options: babelConfig,
          // @see - https://github.com/webpack/webpack/issues/2031
          include: [
            path.resolve(
              __dirname,
              'src',
            ),
            path.resolve(
              __dirname,
              'demos',
            ),
            // @see - https://github.com/visionmedia/debug/issues/668
            path.resolve(
              __dirname,
              'node_modules',
              'debug',
            ),
          ],
        },
        {
          test: /.*clsp-player\/(src|demos).*\.js$/,
          loader: 'babel-loader?cacheDirectory=true',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  // Prevents "ReferenceError: _typeof is not defined" error
                  exclude: [
                    '@babel/plugin-transform-typeof-symbol',
                  ],
                },
              ],
            ],
            plugins: [
              '@babel/plugin-syntax-dynamic-import',
              '@babel/plugin-proposal-object-rest-spread',
              '@babel/plugin-proposal-class-properties',
            ],
          },
        },
        // @see - https://github.com/bensmithett/webpack-css-example/blob/master/webpack.config.js
        {
          test: /\.(eot|svg|ttf|woff|woff2)$/,
          loader: 'url-loader',
        },
        {
          // @see - https://github.com/webpack-contrib/mini-css-extract-plugin
          // @see - https://github.com/webpack-contrib/sass-loader
          test: /\.(sa|sc|c)ss$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                hmr: devMode,
              },
            },
            'css-loader',
            // @todo
            // 'postcss-loader',
            'sass-loader',
          ],
        },
      ],
      // noParse: /video.js/
    },
    resolve: {
      alias: {
        '~root': __dirname,
      },
    },
    plugins: [
      generateProgressBarPlugin(name),
      new MiniCssExtractPlugin({
        filename: devMode
          ? '[name].css'
          : '[name].[hash].css',
        chunkFilename: devMode
          ? '[id].css'
          : '[id].[hash].css',
      }),
      new WriteFilePlugin(),
    ],
  };
}

const advancedDemoDistConfig = generateConfig(
  'advanced-dist',
  path.resolve(
    __dirname,
    'demos',
    'advanced-dist',
    'index.js',
  ),
);

advancedDemoDistConfig.output.path = demoOutputPath;

const advancedDemoSrcConfig = generateConfig(
  'advanced-src',
  path.resolve(
    __dirname,
    'demos',
    'advanced-src',
    'index.js',
  ),
);

advancedDemoSrcConfig.output.path = demoOutputPath;

const simpleDemoSrcConfig = generateConfig(
  'simple-src',
  path.resolve(
    __dirname,
    'demos',
    'simple-src',
    'index.js',
  ),
);

simpleDemoSrcConfig.output.path = demoOutputPath;

const videojsClspPluginConfig = generateConfig(
  utils.name,
  path.resolve(
    __dirname,
    'src',
    'js',
    'index.js',
  ),
);

videojsClspPluginConfig.externals = {
  'video.js': 'videojs',
};

module.exports = function () {
  return [
    advancedDemoDistConfig,
    advancedDemoSrcConfig,
    simpleDemoSrcConfig,
    videojsClspPluginConfig,
  ];
};
