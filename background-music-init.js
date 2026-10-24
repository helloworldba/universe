import { createBackgroundMusic } from './background-music.js';
import { createCinema } from './cinema.js';
import { createTopicVideoPlayer } from './topic-video-player.js';

const music=createBackgroundMusic({
  audio: document.getElementById('background-music'),
  button: document.getElementById('toggle-music'),
  tracks: [
    './assets/audio/universe-background-first.mp3',
    './assets/audio/universe-background.mp3',
  ],
});

let topicVideos;
const cinema=createCinema({
  dialog: document.getElementById('cinema-dialog'),
  video: document.getElementById('cinema-video'),
  openButton: document.getElementById('open-cinema'),
  closeButton: document.getElementById('close-cinema'),
  unmuteButton: document.getElementById('cinema-unmute'),
  status: document.getElementById('cinema-status'),
  music,
  beforeOpen:()=>topicVideos?.close({focus:false}),
});
topicVideos=createTopicVideoPlayer({music,beforeOpen:()=>cinema.close({focus:false})});
cinema.open({autoplay:true});
