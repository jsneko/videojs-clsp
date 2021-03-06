import './styles.scss';

import '@babel/polyfill';
import videojs from 'video.js';
import videojsErrors from 'videojs-errors/dist/videojs-errors.es';

import $ from 'jquery';

import {
  initializeWall,
  initLocalStorage,
} from './shared';

import clspUtils from '~root/src/js/utils';
import clspPlugin from '~root/src/js/plugin';

let wallPlayers = [];

function destroyAllPlayers () {
  for (let i = 0; i < wallPlayers.length; i++) {
    const player = wallPlayers[i];

    player.dispose();
  }

  wallPlayers = [];
}

function createPlayer (index, playerOptions) {
  const videoId = `wall-video-${index}`;

  const $container = $('#videowall')
    .append(document.getElementById('wall-video-template').innerHTML)
    .find('#wall-container-null');

  const $video = $container.find('video');

  $video.attr('id', videoId);

  $container.attr('id', `wall-container-${index}`);
  $container.find('.video-stream .index').text(index);

  const url = playerOptions.sources[0].src;

  $container.find('.video-stream .url').text(url);
  $container.find('.video-stream .url').attr('title', url);

  $container.find('.video-stream .close').on('click', () => {
    $('#wallTotalVideos').text(parseInt($('#wallTotalVideos').text(), 10) - 1);
    player.dispose();
  });

  const $videoMetrics = $container.find('.wall-video-metrics');

  const metricTypes = [];
  // const metricTypes = [
  //   // ClspPlugin().METRIC_TYPES,
  //   // IOV.METRIC_TYPES,
  //   // Conduit.METRIC_TYPES,
  //   // IOVPlayer.METRIC_TYPES,
  //   // MediaSourceWrapper.METRIC_TYPES,
  //   // SourceBufferWrapper.METRIC_TYPES,
  // ];

  for (let i = 0; i < metricTypes.length; i++) {
    const metricType = metricTypes[i];

    for (let j = 0; j < metricType.length; j++) {
      const text = metricType[j];
      const name = text.replace(new RegExp(/\./, 'g'), '-');
      const $metric = $('<div/>', {
        class: `metric ${name}`,
      });

      $metric.append($('<span/>', {
        class: 'value',
      }));
      $metric.append($('<span/>', {
        class: 'type',
        title: text,
        text,
      }));

      $videoMetrics.append($metric);
    }
  }

  const player = videojs(videoId, playerOptions);

  player.on('dispose', () => {
    for (let i = 0; i < wallPlayers.length; i++) {
      if (player === wallPlayers[i]) {
        wallPlayers.splice(i, 1);
      }
    }
  });

  wallPlayers.push(player);

  const tech = player.clsp();

  tech.on('metric', (event, {
    metric,
  }) => {
    $videoMetrics.find(`.${metric.type.replace(new RegExp(/\./, 'g'), '-')} .value`)
      .attr('title', metric.value)
      .html(metric.value);
  });
}

$(() => {
  const localStorageName = 'videojs-clsp-advanced-demo-src';

  document.title = `v${clspUtils.version} ${document.title}`;

  const pageTitle = $('#page-title').html();
  $('#page-title').html(`${pageTitle} <br /> v${clspUtils.version}`);

  $('#videojs-version').html(videojs.VERSION);
  $('#videojs-errors-version').html(videojsErrors.VERSION);

  window.HELP_IMPROVE_VIDEOJS = false;

  // Tours for videojs are not yet implemented
  initLocalStorage(
    localStorageName,
    'tours-enabled',
    'checkbox',
    false,
  );

  initializeWall(
    localStorageName,
    createPlayer,
    destroyAllPlayers,
  );

  clspPlugin().register();
});
