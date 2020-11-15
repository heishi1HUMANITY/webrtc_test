'use strict';

import startVideo from './video';

export const prepareNewConnection = (isOffer: boolean, remoteVideo: HTMLVideoElement, localStream: MediaStream, textForSendSdp: HTMLTextAreaElement) => {
  const peer = new RTCPeerConnection();

  peer.ontrack = async (evt) => {
    console.log('--peer.ontrack()');
    let stream = await startVideo();
    remoteVideo.srcObject = stream;
    remoteVideo.play();
  };

  peer.onicecandidate = evt => {
    if (evt.candidate) {
      console.log(evt.candidate);
    } else {
      console.log('empty ice event');
      sendSdp(peer.localDescription, textForSendSdp);
    }
  };

  peer.onnegotiationneeded = async () => {
    try {
      if (isOffer) {
        let offer = await peer.createOffer();
        console.log('createOffer() success in promise');
        await peer.setLocalDescription(offer);
        console.log('setLocalDescription() success in promise');
        sendSdp(peer.localDescription, textForSendSdp);
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

  return peer;
}

export const sendSdp = (description: RTCSessionDescription, textForSendSdp: HTMLTextAreaElement) => {
  console.log('---sending sdp---');
  textForSendSdp.value = description.sdp;
  textForSendSdp.focus();
  textForSendSdp.select();
};

export const connect = (peerConnection: RTCPeerConnection, remoteVideo: HTMLVideoElement, localStream: MediaStream, textForSendSdp: HTMLTextAreaElement) => {
  if (!peerConnection) {
    console.log('make Offer');
    peerConnection = prepareNewConnection(true, remoteVideo, localStream, textForSendSdp);
  } else {
    console.warn('peer already exist.');
  }
};

const makeAnswer = async (peerConnection: RTCPeerConnection, textForSendSdp: HTMLTextAreaElement) => {
  console.log('sending Answer. Creating remote session description...');
  if (!peerConnection) {
    console.error('peerConnection NOT exist.');
    return;
  }
  try {
    let answer = await peerConnection.createAnswer();
    console.log('createAnswer() success in promise');
    await peerConnection.setLocalDescription(answer);
    console.log('setLocalDescription() success in promise');
    sendSdp(peerConnection.localDescription, textForSendSdp);
  } catch (err) {
    console.error(err);
  }
};

export const onSdpText = (peerConnection: RTCPeerConnection, textToReceiveSdp: HTMLTextAreaElement, remoteVideo: HTMLVideoElement, localStream: MediaStream, textForSendSdp: HTMLTextAreaElement) => {
  const text = textToReceiveSdp.value;
  if (peerConnection) {
    console.log('Received answer text...');
    const answer = new RTCSessionDescription({
      type: 'answer',
      sdp: text
    });
    setAnswer(peerConnection, answer);
  } else {
    console.log('received offer text...');
    const offer = new RTCSessionDescription({
      type: 'offer',
      sdp: text
    });
    setOffer(peerConnection, offer, remoteVideo, localStream, textForSendSdp);
  };
  textToReceiveSdp.value = '';
}

const setOffer = async (peerConnection: RTCPeerConnection, sessionDescription: RTCSessionDescription, remoteVideo: HTMLVideoElement, localStream: MediaStream, textForSendSdp: HTMLTextAreaElement) => {
  if (peerConnection) {
    console.error('peerConnection already exist!');
  }
  peerConnection = prepareNewConnection(false, remoteVideo, localStream, textForSendSdp);
  try {
    await peerConnection.setRemoteDescription(sessionDescription);
    console.log('setRemoteDescription(answer) success in promise');
    makeAnswer(peerConnection, textForSendSdp);
  } catch (err) {
    console.error(`setRemoteDescription(offer) ERROR: ${err}`);
  }
};

const setAnswer = async (peerConnection: RTCPeerConnection, sessionDescription: RTCSessionDescription) => {
  if (!peerConnection) {
    console.error('peerConnection NOT exist!');
    return;
  }
  try {
    await peerConnection.setRemoteDescription(sessionDescription);
    console.log('setRemoteDescription(answer) success in promise');
  } catch (err) {
    console.error(`setRemoteDescription(answer) ERROR: ${err}`);
  }
};
