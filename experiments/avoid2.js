'use strict';

// Serial port function
var serialport = require("serialport");
// var SerialPort = serialport.SerialPort;

var serialPort = new serialport("/dev//dev/ttyMFD1",{
	baudrate: 9600,
//	parser: serialport.parsers.readline("\n")
});

// johnny five
var five = require("johnny-five");

// Keypress
var keypress = require('keypress');
keypress(process.stdin);
process.stdin.setRawMode(true);
process.stdin.resume();

// Rolling spider
var RollingSpider = require("rolling-spider");
var d = new RollingSpider({uuid:"c01229b61cbe"}); //rs drone
//var d = new RollingSpider({uuid:"e01428853dc1"}); // mars drone 

var ACTIVE = true;
var STEPS = 1;

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

// johnny-five board 
// this will use if you want to use johnny-five library
var board = new five.Board({
	port: "/dev/ttyMFD1"

});

var stflag=0;

//timer
var start= new Date();
var end;
var executionTime;
const interval=33;

// moving parameter
var state;
const STATE0=0; //hovering
const STATE1=1; //Right
const STATE2=2; //Backward

var gain = 5; //gain for collision avoidance
var initial = 0;
var dobs = 0;
var cnt = 0;
var led1;



// Reading from the port
serialPort.on("open", function(){
	console.log('open');
	//listen to incoming data
	serialPort.on('data', function(data){
		console.log(data);
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
      			stflag=0;
		} else if (key.name === 't') {
			console.log('takeoff');
			d.takeOff();
		} else if (key.name === 'h') {
			console.log('hover');
			d.hover();
			stflag = 0;
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
   		 if (key.name === 'z') {
			//state=STATE1;
			//cnt = 0;
			stflag = 0;
		}

	}
});	
