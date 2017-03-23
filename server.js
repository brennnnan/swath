'use strict';
/**
 * Global variables
 */
// latest 100 messages
var history = [];
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
			userRole = htmlEntities(name.role);
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
				group = (index)%serverChannelCount;
				socket.join(group);
				var obj = {
					group: group
				}
				socket.emit('receipt', obj);
				//return group membership id over socket
			}
	})
	
	socket.on('adminInfo', (adminInfo) => {
		serverChannelCount = adminInfo.channelCount;
	})
	
	// only when admin sends note
	socket.on('note', (noteinfo) => {
		console.log((new Date()) + ' Received Message from ' + userName + ': ' + noteinfo.note);
		// we want to keep history of all sent messages
		var obj = {
			time: (new Date()).getTime(),
			note: noteinfo.note,
			author: userName,
		};
                
        history.push(obj);
		history = history.slice(-100);

		// broadcast message to all connected clients
		socket.broadcast.emit('note', noteinfo);
		/* send to individual channels based on ids
		for(var i=0; i<clients.length; i++) {
			if(clients[i][1]%serverChannelCount==noteinfo.channel-1 && clients[i][2]==0) {
				socket.broadcast.to(clients[i][0].id).emit('note', noteinfo);
			} 
		} */
	})
	
	
	socket.on('noteOn', (noteInfo) => {
		io.in(noteInfo.channel).emit('noteOn', noteInfo)
		//socket.broadcast.emit('noteOn', noteInfo);
		console.log('got noteon from channel '+noteInfo.channel);
	})
	
	socket.on('noteOff', (noteInfo) => {
		socket.broadcast.emit('noteOff', noteInfo);
		console.log('got noteoff');
	})
	
	socket.on('disconnect', () => {
		connectionCount--;
		if(userRole=='admin') adminPresent = 0;
		console.log('Client disconnected')
	});
});

function htmlEntities(str) {
	return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}