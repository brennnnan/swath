function preload() {
   WebMidi.enable(function (err) {
  
    if (err) {
      console.log("WebMidi could not be enabled.", err);
    } else {
      console.log("WebMidi enabled!");
      console.log(WebMidi.inputs);
      console.log(WebMidi.outputs);
      channelCount = 1;
      if(WebMidi.outputs.length > 0) output = WebMidi.getOutputByName(WebMidi.outputs[0].name);
      createP('  1. Select correct midi output from below.');

		  dropdown = createElement('select');
		  var options = [];
		  for(var d=0; d<WebMidi.outputs.length; d++) {
		  	options.push(WebMidi.outputs[d].name);
		  } 

		  console.log(options)
		  for (var i = 0; i < options.length; i++) {
		    var option = createElement('option');
		    option.attribute('value',options[i]);
		    option.html(options[i]);
		    option.parent(dropdown);
		  }

		dropdown.elt.onchange = function() {
			output = WebMidi.getOutputByName(this.value);
  		}


		createP('  2. Select number of channels used.');
  		channelDropdown = createElement('select');
  		var channelOptions = []
  		for(var i=1; i<17; i++) {
  			channelOptions.push(i);
  		}

  		for (var i = 0; i < channelOptions.length; i++) {
		    var option = createElement('option');
		    option.attribute('value',channelOptions[i]);
		    option.html(channelOptions[i]);
		    option.parent(channelDropdown);
		}

		channelDropdown.elt.onchange = function() {
			channelCount = this.value;
  		}




    }
  
  });
}



function setup() {
	canvas = createCanvas(10,10);
}
