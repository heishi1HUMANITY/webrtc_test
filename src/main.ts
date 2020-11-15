'use strict';

const myVideo: HTMLVideoElement = document.querySelector('#myVideo');
const receivedVideo: HTMLVideoElement = document.querySelector('#receivedVideo');
const connect: HTMLButtonElement = document.querySelector('#connect');
const textForSendSdp: HTMLTextAreaElement = document.querySelector('#textForSendSdp');
const receiveSdp: HTMLButtonElement = document.querySelector('#receiveSdp');
const textForSetSdp: HTMLTextAreaElement = document.querySelector('#textForSetSdp');

let peerConnection: RTCPeerConnection;
let localStream: MediaStream;

import startVideo from './video';

startVideo()
.then(stream => {
  localStream = stream;
  myVideo.srcObject = stream;
  myVideo.play();
});

import * as rtc from './webrtc';
connect.addEventListener('click', () => rtc.connect(peerConnection, receivedVideo, localStream, textForSendSdp));

receiveSdp.addEventListener('click', () => rtc.onSdpText(peerConnection, textForSetSdp, receivedVideo, localStream, textForSendSdp));
