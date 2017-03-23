$(function () {
	"use strict";

    var input = $('#input');
	var midiInput;
	var midiOutput;
	var channelCount = -1;
	var webMidiEnabled = 0;
	var indicatorLight = -1;
	var displayEnabled = -1;

	
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
	var rEvent = function(){roleSelected(0)}
	masterButton.addEventListener('click', rEvent, true);
	
	var servantButton = document.getElementById('servant_button');
	servantButton.addEventListener('click', function(){roleSelected(1)}, true);

	socket.on('note', function(noteInfo) {
		if(noteInfo.note >= 0 && noteInfo.note < 128) {
			console.log(myName+" received "+noteInfo.note);
            //output.playNote(noteInfo.note, "all", {time: WebMidi.time + 3000});
            //notes[(noteInfo.note+2)%12].play();
        }	
	})
	
	socket.on('noteOn', function(noteInfo) {
		if(displayEnabled && myName!='admin') {
			if(noteInfo.note >= 0 && noteInfo.note < 128) {
				indicatorLight.style.background = "#E066FF";
				notes[(noteInfo.note+2)%12].play();
				//else midiOutput.playNote(noteInfo.note);
			}
		}
	})
	
	socket.on('noteOff', function(noteInfo) {
		if(displayEnabled && myName!='admin') {
			if(noteInfo.note >= 0 && noteInfo.note < 128) {
				indicatorLight.style.background = "#FFF";
				if(!webMidiEnabled) midiOutput.stopNote(noteInfo.note)
			}
		}
	})
	
	socket.on('receipt', function(receiptInfo) {
		console.log(receiptInfo.group)
		if(receiptInfo.group == -1) loadAdminInfoInterface();
		else loadServantInfoInterface();
	})
	
	socket.on('adminNotification', function() {
		masterButton.removeEventListener('click', rEvent, true);
	})
	
	// Confirms landing page selection with server
	// sends role as 'name' msg
	function roleSelected(role) {
		if(role===0) {
			myName = 'admin'
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
	
	// Attempts to activate webMidi and sets up
	function enableMidi(role) {
		WebMidi.enable(function (err) {
  
    		if (err) {
      			console.log("WebMidi could not be enabled.", err);
    		} else {
				webMidiEnabled = 1;
      			console.log("WebMidi enabled!");
      			console.log(WebMidi.inputs);
      			console.log(WebMidi.outputs);
				
				
				if(role=='admin') {
					// Sets up select dropdown for midi inputs and channels
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
		  		}
				
				if(role=='servant') {
					// sets up select dropdown for midi outputs 
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
					if(options.length>0) midiOutput = WebMidi.getOutputByName(options[0])
					midiOutputs.onchange = function() {
						midiOutput = WebMidi.getOutputByName(this.value);
  					}
				}
				
			}
    	});
	}
	
	
	// Hides landing page and gets admin settings
	function loadAdminInfoInterface() {
		enableMidi('admin');
		var submitButton = document.getElementById('admin_submit_button')
		submitButton.addEventListener("click", loadAdminDisplay)
		document.getElementById("boxes").style.display = "none";
		document.getElementById("admin_information").style.display = "block"
	}
	
	// Hides landing page and gets servant settings
	function loadServantInfoInterface() {
		enableMidi('servant');
		var submitButton = document.getElementById('servant_submit_button')
		submitButton.addEventListener("click", loadServantDisplay)
		document.getElementById("boxes").style.display = "none";
		document.getElementById("servant_information").style.display = "block";
	}
	
	//Hides settings pages and sets up note indicator pages
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
		
		// bind display boxes to channel listeners
		// SENDING NOTES TAKES PLACE HERE
		for(var g=1; g<=channelCount; g++){
			var myCount = g;
			(function (_myCount) {
				midiInput.addListener('noteon', _myCount, function (e) {
					//console.log("Received 'noteon' message (" + e.note.name + e.note.octave + " from channel"+_myCount+"). ");
					boxes[_myCount-1].style.background = "#E066FF";
					
					var obj = {
						note: e.note.number,
						channel: _myCount
					}
					
					socket.emit('noteOn',obj);
				});
				midiInput.addListener('noteoff', _myCount, function (e) {
					//console.log("Received 'noteoff' message (" + e.note.name + e.note.octave + "1). ");
					boxes[_myCount-1].style.background = "#FFF";
					
					var obj = {
						note: e.note.number,
						channel: _myCount
					}
					socket.emit('noteOff',obj);
				});
			})(myCount);
			
		}
	}
	
	function makeIndicator(_callback){
		indicatorLight = document.createElement('div')
		indicatorLight.setAttribute('id', 'note_indicator');
		indicatorLight.setAttribute('class', 'channel_display_box');
		indicatorLight.style.width = "40%";
		note_sent_display.appendChild(indicatorLight);
		_callback()
	}
	
	function loadServantDisplay() {
		document.getElementById("servant_information").style.display = "none"
		var note_sent_display = document.createElement('div');
		note_sent_display.setAttribute('class', 'note_light_up_container')
		var mainContainer = document.getElementById("main_container");
		mainContainer.appendChild(note_sent_display);
		
		makeIndicator(function() {
        	displayEnabled = 1;
    	});    
		
		
	}

});