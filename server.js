'use strict';

// list of currently connected clients (users)
var clients = [];

//Setup
var http = require('http');
var path = require('path');
var express = require('express')
	, app = module.exports.app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, 'public')));
var server = http.createServer(app);

var adminPresent = -1;

var connectionCount = 0;
var serverChannelCount = 1;

var io = require('socket.io').listen(server); //pass a http.Server instance
server.listen(PORT); //listen on port 
console.log('Server listening on port ' + PORT);


io.on('connection', (socket) => {
	var group = 1;
	var index = clients.push([socket, clients.length, 0]) - 1;
	connectionCount++;
	
	// Notify new connections if admin is present so that only servant option is available
	if (adminPresent == 1) {
		//console.log('admin here')
		socket.emit('adminNotification');
	}
	
	var userRole = false;
	console.log((new Date()) + ' Connection accepted.');
	
  	socket.on('name', (name) => {
			userRole = name.role;
			if (userRole == 'admin') {
				console.log((new Date()) + ' Admin is present with ' + name.channels + ' channels.');
				adminPresent = 1;
				clients[index][2] == 1;
				var obj = {
					group: -1
				}
				socket.emit('receipt', obj);
			}
		
			else {
				console.log((new Date()) + ' User is known as: ' + userRole + '.');
				group = (index-1)%serverChannelCount+1;
				socket.join(group);
				console.log('group '+group+' joined/created')
				var obj = {
					group: group
				}
				//return group membership id over socket
				socket.emit('receipt', obj);
			}
	})
	
	// Sets channelCount when admin sends
	socket.on('adminInfo', (adminInfo) => {
		serverChannelCount = adminInfo.channelCount;
	})

	
	
	socket.on('noteOn', (noteInfo) => {
		// forward noteOn to all connections on channel
		io.in(noteInfo.channel).emit('noteOn', noteInfo)
		
		//socket.broadcast.emit('noteOn', noteInfo);
		console.log('got noteon from channel '+noteInfo.channel);
	})
	
	socket.on('noteOff', (noteInfo) => {
		// forward noteOff to all connections on channel
		io.in(noteInfo.channel).emit('noteOff', noteInfo);
		console.log('got noteoff');
	})
	
	socket.on('disconnect', () => {
		connectionCount--;
		if(userRole=='admin') adminPresent = 0;
		console.log('Client disconnected')
	});
});
