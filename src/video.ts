'use strict';

export default async () => {
  let stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  return stream;
};