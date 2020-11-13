import * as io from 'socket.io-client';
const socker = io(location.origin);

const video = document.querySelector('#videoPlayer');

navigator.mediaDevices.getUserMedia({ video: true, audio: false })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => console.error(err));