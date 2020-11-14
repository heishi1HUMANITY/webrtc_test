'use strict';

const socketIO = require('socket.io-client');
const socket: SocketIOClient.Socket = socketIO.connect();

const video: HTMLVideoElement = document.querySelector('#videoPlayer');
const connect: HTMLButtonElement = document.querySelector('#connect');
const textToReceiveSdp: HTMLTextAreaElement = document.querySelector('#receiveSdp');
const resiveRemoteButton: HTMLButtonElement = document.querySelector('#receiveRemoteSdp');
const textForSendSdp: HTMLTextAreaElement = document.querySelector('#sendSdp');
let localStream = null;
let peerConnection: RTCPeerConnection = null;
let negotiationneededCounter = 0;
let isOffer = false;

const prepareNewConnection = isOffer => {
  // const pc_config = {"iceServers":[ {"urls":"stun:stun.webrtc.ecl.ntt.com:3478"} ]};
  const peer = new RTCPeerConnection();

  peer.ontrack = evt => {
    console.log('-- peer.ontrack()');
    playVideo(video, evt.streams[0]);
  };

  peer.onicecandidate = evt => {
    if (evt.candidate) {
      console.log(evt.candidate);
    } else {
      console.log('empty ice event');
      sendSdp(peer.localDescription);
    }
  };

  peer.onnegotiationneeded = async () => {
    try {
      if (isOffer) {
        let offer = await peer.createOffer();
        console.log('createOffer() success in promise');
        await peer.setLocalDescription(offer);
        console.log('setLocalDescription() success in promise');
        sendSdp(peer.localDescription);
        negotiationneededCounter++;
      }
    } catch (err) {
      console.error(`setLocalDescription(offer) ERROR: ${err}`);
    }
  }

  if (localStream) {
    console.log('Adding local stream...');
    localStream.getTracks().forEach(track => peer.addTrack(track, localStream));
  } else {
    console.warn('no local stream, but continue.');
  }

  console.log(peer);

  return peer;

};

const playVideo = (element: HTMLVideoElement, stream: MediaStream) => {
  element.srcObject = stream;
  element.play()
    .catch(err => console.error(err));
};

const sendSdp = (sessionDescription: RTCSessionDescription) => {
  console.log('---send sdp---');
  textForSendSdp.value = sessionDescription.sdp;
};

const makeAnswer = async () => {
  console.log('sending Answer. Creating remote session description...');
  if (!peerConnection) {
    console.error('peerConnection NOT exist!');
    return;
  }
  try {
    let answer = await peerConnection.createAnswer();
    console.log('createAnswer() success in promise');
    await peerConnection.setLocalDescription(answer);
    console.log('setLocalDescription() success in promise');
    sendSdp(peerConnection.localDescription);
  } catch (err) {
    console.error(err);
  }
};

resiveRemoteButton.addEventListener('click', () => {
  const text = textToReceiveSdp.value.replace(/\n|\r\n|\r/g, '');
  if (peerConnection) {
    console.log('Received answer text...');
    const answer = new RTCSessionDescription({
      type: 'answer',
      sdp: text
    });
    setAnswer(answer);
  } else {
    console.log('Received offer text...');
    const offer = new RTCSessionDescription({
      type: 'offer',
      sdp: text
    });
    setOffer(offer);
  }
  textToReceiveSdp.value = '';
});

const setOffer = async (sessionDescription: RTCSessionDescription) => {
  if (peerConnection) {
    console.error('peerConnection already exist!');
  }
  peerConnection = prepareNewConnection(false);
  try {
    await peerConnection.setRemoteDescription(sessionDescription);
    console.log('setRemoteDescription(answer) success in promise');
    makeAnswer();
  } catch (err) {
    console.error(`setRemoteDescription(offer) ERROR: ${err}`);
  }
};

const setAnswer = async (sessionDescription: RTCSessionDescription) => {
  if (!peerConnection) {
    console.error('peerConnection NOT exist!');
    return;
  }
  try {
    await peerConnection.setRemoteDescription(sessionDescription);
    console.log(`setRemoteDescription(answer) success in promise`);
  } catch (err) {
    console.error(`setRemoteDescription(answer) ERROR: ${err}`);
  }
};

navigator.mediaDevices.getUserMedia(
  {
    video: {
      width: {
        exact: 640
      },
      height: {
        exact: 480
      }
    },
    audio: false
  }
)
  .then(stream => {
    playVideo(video, stream);
  })
  .catch(err => console.error(err));

connect.addEventListener('click', () => {
  if (!peerConnection) {
    console.log('make offer');
    peerConnection = prepareNewConnection(true);
  } else {
    console.warn('peer already exist.');
  }
});