$(function () {
	"use strict";

    var input = $('#input');
	var midiInput;
	var channelCount = -1;
	
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
		// Display options
	}

	var myName = false;

	var masterButton = document.getElementById('master_button');
	masterButton.addEventListener('click', function(){roleSelected(0)}, true);
	
	var servantButton = document.getElementById('servant_button');
	servantButton.addEventListener('click', function(){roleSelected(1)}, true);

	socket.on('note', function(noteInfo) {
		console.log('received');
		if(noteInfo.note >= 0 && noteInfo.note < 128) {
			console.log(myName+" received "+noteInfo.note);
            //output.playNote(noteInfo.note, "all", {time: WebMidi.time + 3000});
            //notes[(noteInfo.note+2)%12].play();
            //setTimeout(function(){output.stopNote(noteInfo.note)}, 3500);
        }	
	})
	
	socket.on('receipt', function(receiptInfo) {
		console.log(receiptInfo.group)
		if(receiptInfo.group == -1) loadAdminInfoInterface();
		else loadServantInfoInterface();
	})
	
	
	function roleSelected(role) {
		console.log(role+' stuf')
		if(role===0) {
			var obj = {
				role: 'admin'
			}
			socket.emit('name', obj);
		} else if(role==1) {
			var obj = {
				role: 'servant'
			}
			socket.emit('name', obj);
		}
	}
	
	function enableMidi(role) {
		WebMidi.enable(function (err) {
  
    		if (err) {
      			console.log("WebMidi could not be enabled.", err);
    		} else {
      			console.log("WebMidi enabled!");
      			console.log(WebMidi.inputs);
      			console.log(WebMidi.outputs);
				if(role=='admin') {
					var midiInputs = document.getElementById('midi_input_list')
					var options = [];
		  			for(var d=0; d<WebMidi.inputs.length; d++) {
		  				options.push(WebMidi.inputs[d].name);
					}
					if(options.length>0) midiInput = WebMidi.getInputByName(options[0])
					for (var i = 0; i < options.length; i++) {
		    			var option = document.createElement('option');
		    			option.value = options[i];
		    			option.innerHTML = options[i];
		    			midiInputs.appendChild(option);
		  			}

					midiInputs.onchange = function() {
						midiInput = WebMidi.getInputByName(this.value);
  					}
					var channels = document.getElementById('channel_list')
					channels.onchange = function() {
						channelCount = this.value;
						console.log(channelCount)
					}
					var submitButton = document.getElementById('admin_submit_button')
					submitButton.addEventListener("click", loadAdminDisplay)
		  		}
				
				if(role=='servant') {
					var midiOutputs = document.getElementById('midi_output_list')
					var options = [];
		  			for(var d=0; d<WebMidi.outputs.length; d++) {
		  				options.push(WebMidi.outputs[d].name);
					}
					for (var i = 0; i < options.length; i++) {
		    			var option = document.createElement('option');
		    			option.value = options[i];
		    			option.innerHTML = options[i];
		    			midiOutputs.appendChild(option);
		  			}

					midiOutputs.onchange = function() {
						midiOutput = WebMidi.getOutputByName(this.value);
  					}
					var submitButton = document.getElementById('servant_submit_button')
					submitButton.addEventListener("click", loadServantDisplay)
				}
				
			}
    	});
	}
	
	function loadAdminInfoInterface() {
		enableMidi('admin');
		document.getElementById("boxes").style.display = "none";
		document.getElementById("admin_information").style.display = "block"
	}
	
	function loadServantInfoInterface() {
		enableMidi('servant');
		document.getElementById("boxes").style.display = "none";
		document.getElementById("servant_information").style.display = "block"
	}
	
	function loadAdminDisplay() {
		var obj = {
			channelCount: channelCount
		}
		socket.emit("adminInfo", obj);
		
		
		document.getElementById("admin_information").style.display = "none"
		var note_sent_display = document.createElement('div');
		note_sent_display.setAttribute('class', 'note_light_up_container')
		var mainContainer = document.getElementById("main_container");
		mainContainer.appendChild(note_sent_display);
		
		//Create visual display boxes for each channel in channelCount
		var boxes = []
		for(var i=0; i<channelCount; i++) {
			var div = document.createElement('div')
			div.setAttribute('class', 'channel_display_box');
			div.style.width = 80/(channelCount%8)+"%";
			div.style.marginRight = 18/(channelCount%8)+"%";
			boxes.push(div)
			note_sent_display.appendChild(div);
		}
		
		//bind display boxes to channel listeners
		for(var g=1; g<=channelCount; g++){
			var myCount = g;
			(function (_myCount) {
				midiInput.addListener('noteon', _myCount, function (e) {
				//console.log("Received 'noteon' message (" + e.note.name + e.note.octave + "1). ");
					boxes[_myCount-1].style.background = "#E066FF";
					var obj = {
						note: e.note,
						channel: _myCount
					}
					socket.emit('noteon',obj);
				});
				midiInput.addListener('noteoff', _myCount, function (e) {
				//console.log("Received 'noteoff' message (" + e.note.name + e.note.octave + "1). ");
					boxes[_myCount-1].style.background = "#FFF";
					var obj = {
						note: e.note,
						channel: _myCount
					}
					socket.emit('noteoff',obj);
				});
			})(myCount);
			
		}
	}
	
	function loadServantDisplay() {
		document.getElementById("servant_information").style.display = "none"
		var note_sent_display = document.createElement('div');
		note_sent_display.setAttribute('class', 'note_light_up_container')
		var mainContainer = document.getElementById("main_container");
		mainContainer.appendChild(note_sent_display);
		
		var div = document.createElement('div')
		div.setAttribute('class', 'channel_display_box');
		div.style.width = "40%"
		note_sent_display.appendChild(div);
		
		midiInput.addListener('noteon', "all", function (e) {
			div.style.background = "#E066FF";
		});
		
		midiOuput.addListener('noteoff', "all", function (e) {
			div.style.background = "#FFF";
		});	
	}

});