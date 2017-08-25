
	
	//for photo IC Leftside
	photo2.on('data', function(value){
		// Here we declare the function of the right and the left sensor
		if(photo1 < 850){
			d.tiltRight({steps: STEPS});
			console.log('turn right');
			cooldown();
		}
		else if(photo2 < 850) {
			d.tiltLeft({steps: STEPS});
			console.log('turn left');
			cooldown();
		}
	}
	
	// this for timer of the node.js
	end = new Date();
	executionTime = end.getTime() - start.getTime();
	while(executionTime < interval) {
		end = new Date();
		executionTime = end.getTime() - start.getTime();
    }
    start = new Date();
	
	console.log(photo1.value+ ',', photo2.value);
	
	
}

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
