// this programming code purpose is for take-off, landing, and avoiding the collision
// created by: Muhamad Rausyan Fikri - Tokyo Tech

'use strict';

var SerialPort = require('serialport');
// var five = require("johnny-five");
var keypress = require('keypress');
var RollingSpider = require("rolling-spider");
keypress(process.stdin);
process.stdin.setRawMode(true);
process.stdin.resume();

var ACTIVE = true;
var STEPS = 5;
var d = new RollingSpider({uuid:"c01229b61cbe"}); //rs drone
//var d = new RollingSpider({uuid:"e01428853dc1"}); // mars drone 
//var d = new RollingSpider({uuid:"e014c2d73d80"});

function cooldown() {
	ACTIVE = false;
	setTimeout(function (){
		ACTIVE = true;
	}, STEPS);
}

d.connect(function () {
	
	d.setup(function(){
		console.log('Configured for Rolling Spider! ', d.name);
		d.flatTrim();
		d.startPing();
		d.flatTrim();
		setTimeout(function(){
			console.log(d.name+ ' => SESSION START');
			ACTIVE = true;
		}, 1000);
	});
});

//var board = new five.Board({
//	port: "/dev/ttyMFD1"
//});

var cnt=0; //I would like to use this parameter for moving forward indicators
var stflag=0;

//timer
var start= new Date();
var end;
var executionTime;
const interval=33;

// moving parameter
var state;
var STATE0=0; //hovering
var STATE1=1; //Forward

// state parameter
var d = 0; //parameter to turn on the drone

/*board.on("ready",function(){
	
	// Activate the photo IC
	var photo1 = new five.Sensor({
		pin: "A2",
		freq: 10 //10ms sampling
	});
	var photo2 = new five.Sensor({
		pin: "A1",
		freq: 10 //10 ms sampling
	});
	
	//for photo IC Rightside
	photo1.on('data', function(value){
		// no specific functon here
	});
	
	//for photo IC Leftside
	photo2.on('data', function(value){
		// Here we declare the function of the right and the left sensor
		if(photo2 < 850){
			d.tiltRight({steps: STEPS});
			console.log('turn right');
			cooldown();
		}
		else if(photo1 < 850) {
			d.tiltLeft({steps: STEPS});
			console.log('turn left');
			cooldown();
		}
	
	// this for timer of the node.js
	end = new Date();
	executionTime = end.getTime() - start.getTime();
	while(executionTime < interval) {
		end = new Date();
		executionTime = end.getTime() - start.getTime();
    	}
    	start = new Date();
	
//	console.log(photo1.value+ ',', photo2.value);
	});	
});
*/
var port = new SerialPort('/dev/ttyMFD1',{
  baudRate: 9600,
//  parser: SerialPort.parsers.readline('\n')
});

port.on('open', function () {
  console.log('open');
  port.on('data', function(data) {
	var datum = data.toString('utf8').split(',');
	var frontsensor = datum[0]
	var leftsensor = datum[1]
	var rightsensor = datum[2]
//	console.log(datum);
	if(stflag == 1){
		if (rightsensor <= 850){
			console.log("kanan");
			d.tiltLeft({steps: -gain*(initial-STEPS)})
			cooldown();
		}
		if (leftsensor <= 850){
			console.log("kiri");
			d.tiltRight({steps: -gain*(initial-STEPS)});
			cooldown();
		}
	
		if (frontsensor <= 150){
			state = STATE0;
			cnt = cnt + 1;
			
			switch(state){
				case STATE0:
					d.XYZ({speed_X:0,speed_Y:0,speed_Z:0,speed_omega:0});	
					cooldown();
					stflag = 0; 
					state = STATE2;
					cnt = 0;
				break;
					
				case STATE1:
					d.XYZ({speed_X:10,speed_Y:0,speed_Z:0,speed_omega:0});	
					cooldown();
					state = STATE2;
					cnt = 0;
				break;
					
				case STATE2:
					d.XYZ({speed_X:0,speed_Y:-40,speed_Z:0,speed_omega:0});
					cooldown();
					cnt = 0;
					state = STATE0;
				break;	

			} //end of switch
		} //end of front sensor
		
		else{
			state = STATE0;
			cnt = cnt + 1;
			switch(state){
				case STATE0:
					if(cnt == 30){
						d.XYZ({speed_X:0,speed_Y:30,speed_Z:0,speed_omega:0});	
						cooldown();
						cnt = 0;
						state = STATE1;
					}	
					break;
					
				case STATE1: 
					d.XYZ({speed_X:0,speed_Y:0,speed_Z:0,speed_omega:0});	
					cooldown();
					cnt = 0;
					state = STATE0;
				break;

				} //end of switch
			} //the end of else
	} // end of stflag
	  
	  // this for timer of the node.js
		end = new Date();  
		executionTime = end.getTime() - start.getTime();
		
		while(executionTime < interval) {
			end = new Date();
			executionTime = end.getTime() - start.getTime();
    	}
    	start = new Date();
	console.log(rightsensor, frontsensor, leftsensor);

  });
});

// listen for the "keypress" event
process.stdin.on('keypress', function (ch, key) {
	if (ACTIVE && key) {
		var param = {tilt:0, forward:0, turn:0, up:0};

		if (key.name === 'l') {
			console.log('land');
			d.land();
      			led1.off();
			led2.off();
      			stflag=0;
		} else if (key.name === 't') {
			console.log('takeoff');
			d.takeOff();
		} else if (key.name === 'h') {
			console.log('hover');
			d.hover();
		} else if (key.name === 'x') {
			console.log('disconnect');
			d.disconnect();
			process.stdin.pause();
			process.exit();
		}

		if (key.name === 'up') {
			d.forward({ steps: STEPS });
			cooldown();
		} else if (key.name === 'down') {
			d.backward({ steps: STEPS });
			cooldown();
		} else if (key.name === 'right') {
			d.tiltRight({ steps: STEPS });
			cooldown();
		} else if (key.name === 'left') {
			d.tiltLeft({ steps: STEPS });
			cooldown();
		} else if (key.name === 'u') {
			d.up({ steps: STEPS });
			cooldown();
		} else if (key.name === 'd') {
			d.down({ steps: STEPS });
			cooldown();
		}

		if (key.name === 'm') {
			param.turn = 90;
			d.drive(param, STEPS);
			cooldown();
		}
		if (key.name === 'h') {
			param.turn = -90;
			d.drive(param, STEPS);
			cooldown();
		}
		if (key.name === 'f') {
			d.frontFlip();
			cooldown();
		}
		if (key.name === 'b') {
			d.backFlip();
			cooldown();
		}
		if (key.name === 'g') {
			stflag=1;
		}
   		 if (key.name === 's') {
			state=STATE1;
			cnt = 0;
		}

	}
});
