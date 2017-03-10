$(function () {
	"use strict";

	var content = $('#content');
    var input = $('#input');
    var status = $('#status');

    var notes = []
    notes.push(new Audio('audio/2aa.wav'));
    notes.push(new Audio('audio/2b.wav'));
    notes.push(new Audio('audio/2c.wav'));
    notes.push(new Audio('audio/2cc.wav'));
    notes.push(new Audio('audio/2d.wav'));
    notes.push(new Audio('audio/2dd.wav'));
    notes.push(new Audio('audio/2e.wav'));
    notes.push(new Audio('audio/2f.wav'));
    notes.push(new Audio('audio/2ff.wav'));
    notes.push(new Audio('audio/2g.wav'));
    notes.push(new Audio('audio/2gg.wav'));
    notes.push(new Audio('audio/3a.wav'));
	

	var socket = io();
	if(socket) {
		status.text('Choose name:');
		//input.removeAttr('disabled');
	}

	var myName = false;



	socket.on('note', function(noteInfo) {
		console.log('received');
		if(noteInfo.note >= 0 && noteInfo.note < 128) {
			console.log(myName+" received "+noteInfo.note);
            //output.playNote(noteInfo.note, "all", {time: WebMidi.time + 3000});
            notes[(noteInfo.note+2)%12].play();
            setTimeout(function(){output.stopNote(noteInfo.note)}, 3500);
        }	
	})

	input.keydown(function(e) {

        if (e.keyCode === 13) {
            var msg = $(this).val();
            if (!msg) {
                return;
            }
            if (myName === false) {
            	var obj = {
            		chosenName: msg,
            		channels: channelCount
            	}
                socket.emit('name',obj)
                myName = msg;
                if (myName == 'admin') {
                    status.text('hi admin!');
                    $(this).val('');
                } else {
                	status.text('Hi '+myName+'!')
                	$(this).val('');
                	//input.attr('disabled', 'disabled');
                }
                return;
            }

            var info = msg.split(" ");
            var obj = {
            	note: info[0]
            }

            socket.emit('note', obj)
            console.log('Note '+info[0]+' sent.')
            $(this).val('');
            //input.attr('disabled', 'disabled');
        }
		/*		
        if(e.keyCode === 32) {
        	var obj = {
        		note: 46,
        		channel: 1
        	}

        	var obj1 = {
        		note: 54,
        		channel: 2
        	}
        	setInterval(() => socket.emit('note', obj), 500);
        	setInterval(() => socket.emit('note', obj1), 1000);
        }
        */
    });
});