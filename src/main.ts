'use strict';

import * as io from 'socket.io-client';

const socket: SocketIOClient.Socket = io.connect();
socket.emit('connection');

const video: HTMLVideoElement = document.querySelector('#videoPlayer');

navigator.mediaDevices.getUserMedia({ video: true, audio: false })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => console.error(err));