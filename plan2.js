// this is test

'use strict';

var five = require("johnny-five");
var keypress = require('keypress');
var RollingSpider = require("rolling-spider");
keypress(process.stdin);
process.stdin.setRawMode(true);
process.stdin.resume();

var ACTIVE = true;
var STEPS = 1;
var d = new RollingSpider({uuid:"c01229b61cbe"}); //rs drone
//var d = new RollingSpider({uuid:"e01428853dc1"}); // mars drone
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

var board = new five.Board({
	port: "/dev/ttyMFD1"

	});

// var cnt=0; //I would like to use this parameter for moving forward indicators
// Indicate the plan in on
var stflag=0;


//timer
var start= new Date();
var end;
var executionTime;
const interval=33;
const intervals = 1000;

// moving parameter
var state= 0;
var STATE0=0; //hovering
var STATE1=1; //Forward

var gain = 5; //gain for collision avoidance
var initial = 0;
var led1;
var left;
var right;
var front;
var dobs = 0;
var cnt = 0;

//determine the step of drone
var m = 0; // this is move indicator

board.on("ready",function(){
	led1=new five.Led(9);

	this.repl.inject({
		led1: led1
	});
	
	// Activate the photo IC
	//right
	var photo1 = new five.Sensor({
		pin: "A1",
		freq: 10 //10ms sampling
	});
	//front
	var photo2 = new five.Sensor({
		pin: "A2",
		freq: 10 //10 ms sampling
	});
	//left
	var photo3 = new five.Sensor({
		pin: "A3",
		freq: 10 //10 ms sampling
	});
	
	//for photo IC Rightside
	photo1.on('data', function(value){
		// Here we declare the function of the right and the left sensor
		
	});
	
	//for photo IC Leftside
	photo3.on('data', function(value){
		// Here we declare the function of the right and the left sensor
	
	// this for timer of the node.js
	end = new Date();  
	executionTime = end.getTime() - start.getTime();
	while(executionTime < interval) {
		end = new Date();
		executionTime = end.getTime() - start.getTime();
    	}
    	start = new Date();
	
	console.log(photo1.value+ ',', photo2.value + ',', photo3.value);
	});
	
	// for photo IC in the front side 
	photo2.on('data', function(value){	
		m = 0;
//	for (m=0; m<=100; m++){
		if(stflag == 1){
//			(function(m){
//				d.XYZ({speed_X:0,speed_Y:5,speed_Z:0,speed_omega:0});
//				cooldown();
//			})(m); //end of function(m)
//		} // if stflag end
		
		//define right sensor
		if(photo1.value < 850){
			d.tiltLeft({steps: -gain*(initial-STEPS)});
			cooldown();
		} //end of right sensor
		
		//define left sensor
		if(photo3.value < 850){
			d.tiltRight({steps: -gain*(initial-STEPS)});
			cooldown();
		} //end of left sensor
		
		//define front sensor 
		if(photo2.value < 850){
			if(dobs == 0){
				d.XYZ({speed_X:0,speed_Y:0,speed_Z:0,speed_omega:0});	
				cooldown();
				dobs = 1;
			} //end of dobs
			else if(dobs == 1){
				d.XYZ({speed_X:5,speed_Y:0,speed_Z:0,speed_omega:0});
				cooldown();
			} // end of else if
		} // if stflag end
	} //end of front sensor
//	} // for end
		
	// this for timer of the node.js
	end = new Date();  
	executionTime = end.getTime() - start.getTime();
	while(executionTime < intervals) {
		end = new Date();
		executionTime = end.getTime() - start.getTime();
    	}
    	start = new Date();
	
//	console.log(photo1.value+ ',', photo2.value + ',', photo3.value + ',', m);
	});	// end of photo2 value
}); // board end

// listen for the "keypress" event
process.stdin.on('keypress', function (ch, key) {
	if (ACTIVE && key) {
		var param = {tilt:0, forward:0, turn:0, up:0};

		if (key.name === 'l') {
			console.log('land');
			d.land();
      			led1.off();
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
		} else if (key.name === 'w') {
			d.up({ steps: STEPS });
			cooldown();
		} else if (key.name === 's') {
			d.down({ steps: STEPS });
			cooldown();
		}

		if (key.name === 'a') {
			param.turn = 90;
			d.drive(param, STEPS);
			cooldown();
		}
		if (key.name === 'd') {
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
