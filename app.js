'use strict';

const path = require('path');
const express = require('express');
const app = express();
const server = app.listen(8080, () => console.log('server is working at localhost:8080'));
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  console.log('a user connected');
});

app.use(express.static(path.join(__dirname, 'public')));
