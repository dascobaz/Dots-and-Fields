


		//window.alert("Type up/down keys to randomize!");




//**********************************************************************************************************************
//**********************************************************************************************************************
//			EDITABLE PROPERTIES
//**********************************************************************************************************************
//**********************************************************************************************************************



			var coreColor = "#FFFFFF";

			var coreRadius = 10;
			var coreMass = 100;
			var speed = 1;
			var coreVelX = 0;
			var coreVelY = 0;

			var maxage = 600;
			var ageRate = 1;

			var pause = 1;			// if -1: pauses, if 1 not paused

			var unpauseSpeeds= [speed, coreVelX, coreVelY, ageRate];		// back up initial values to change back after "pausing"

			var count = 0;

			var backgroundColor = "#000000";

			var randomize = false;




//**********************************************************************************************************************
//**********************************************************************************************************************
//			CANVAS
//**********************************************************************************************************************
//**********************************************************************************************************************


			// canvas and temp canvas initialization
			var canvas  = document.getElementById('canvas1');
			var tempCanvas = document.createElement('canvas');

			// setting context
			var ctx  = canvas.getContext('2d');
			var ctxS = tempCanvas.getContext('2d');

			resizeCanvas();

			var circles = [];
			var cores = [];

			ctx.fillStyle = backgroundColor;
			ctx.fillRect(0,	0, canvas.width,canvas.height);
			window.requestAnimationFrame(draw);



			//Returns contents of a canvas as a png based data url, with the specified
			//background color
			function canvasToImage(backgroundColor)
			{
						//cache height and width
						var w = canvas.width;
						var h = canvas.height;

						var data;

						if(backgroundColor)
						{
							//get the current ImageData for the canvas.
							data = context.getImageData(0, 0, w, h);

							//store the current globalCompositeOperation
							var compositeOperation = context.globalCompositeOperation;

							//set to draw behind current content
							context.globalCompositeOperation = "destination-over";

							//set background color
							context.fillStyle = backgroundColor;

							//draw background / rect on entire canvas
							context.fillRect(0,0,w,h);
						}

						//get the image data from the canvas
						var imageData = this.canvas.toDataURL("image/png");

						if(backgroundColor)
						{
							//clear the canvas
							context.clearRect (0,0,w,h);

							//restore it with original / cached ImageData
							context.putImageData(data, 0,0);

							//reset the globalCompositeOperation to what it was
							context.globalCompositeOperation = compositeOperation;
						}

						//return the Base64 encoded data url string
						return imageData;
					}




//**********************************************************************************************************************
//**********************************************************************************************************************
//			EVENTS
//**********************************************************************************************************************
//**********************************************************************************************************************



			window.addEventListener('resize', resizeCanvas, false);



			// using left/right key presses to pause or resume the radius growth - changes speed value to 0 or 1
			// down key toggles randomizer
			// up key - no action yet
			// space bar pauses all but newly spawned cores... (alive property automatically set when clicked)
			// random movement can't be turned off with pause yet
			document.addEventListener('keydown', function(event) {
				if(event.keyCode == 37) {			//	LEFT
					speed = 0;
					coreVelX = 0;
					coreVelY = 0;
					ageRate = 0;

				}
				else if(event.keyCode == 39) {		//	RIGHT
					speed = unpauseSpeeds[0];
					coreVelX = unpauseSpeeds[1];
					coreVelY = unpauseSpeeds[2];
					ageRate = unpauseSpeeds[3];

				}
				else if(event.keyCode == 40){		//	DOWN
					randomize = !randomize;


				}
				else if(event.keyCode == 38){		//	UP
					randomize = !randomize;


				}
				else if(event.keyCode == 32){		//	SPACE
					if (pause > 0) {
						ageRate = unpauseSpeeds[3];
						for (var i = cores.length - 1; i >= 0; --i){
							speed = unpauseSpeeds[0];
							if (cores[i].alive){
							cores[i].vx = unpauseSpeeds[1];
							cores[i].vy = unpauseSpeeds[2];}
						}
						for (var i = circles.length - 1; i >= 0; --i){
							speed = unpauseSpeeds[0];
							if (circles[i].alive){
							circles[i].vx = unpauseSpeeds[1];
							circles[i].vy = unpauseSpeeds[2];
							}
						}
						pause = -1 * pause;
					}
					else if (pause < 0){
						ageRate = 0;
						for (var i = cores.length - 1; i >= 0; --i){
							speed = 0;
							cores[i].vx = 0;
							cores[i].vy = 0;
						}
						for (var i = circles.length - 1; i >= 0; --i){
							speed = 0;
							circles[i].vx = 0;
							circles[i].vy = 0;
						}
						pause = -1 * pause;
					}
				}
			});




			// on click what to do
			canvas.addEventListener('click', function (evt) {
				var mousePos = getMousePos(canvas, evt);
				count++;
				var message = "Mouse position: " + mousePos.x + "," + mousePos.y;


			// color options for randomization... rgba allows for transparency
				var colour = generateColor();
				// "rgba(0,0,0,.25)";
				// generateColor();
				// var colour = 'rgba(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',.25)';
				//   var colour = '#' + Math.floor(Math.random() * 16777215).toString(16); 		//16777215 is the decimal value of #FFFFFF





				var randRad = coreRadius * Math.random();
				var randAge = Math.floor(maxage * Math.random());
				var randMass = coreMass * Math.random();

				if (randomize){
				circles.unshift({
						x: mousePos.x,
						y: mousePos.y,
						radius: 10,
						colour: colour,
						vx: coreVelX,
						vy: coreVelY,
						alive: true});

					cores.unshift({
						x: mousePos.x,
						y: mousePos.y,
						radius: randRad,
						colour: coreColor,
						vx: coreVelX,
						vy: coreVelY,
						lifespan: randAge,
						mass: randMass,
						alive: true});
				}
				else {
					circles.unshift({
						x: mousePos.x,
						y: mousePos.y,
						radius: 10,
						colour: colour,
						vx: coreVelX,
						vy: coreVelY,
						alive: true});

					cores.unshift({
						x: mousePos.x,
						y: mousePos.y,
						radius: coreRadius,
						colour: coreColor,
						vx: coreVelX,
						vy: coreVelY,
						lifespan: maxage,
						mass: coreMass,
						alive: true});
				}

				}, false);





//**********************************************************************************************************************
//**********************************************************************************************************************
//			DRAWING FUNCTIONS
//**********************************************************************************************************************
//**********************************************************************************************************************


			// draws a line from point to point
			function line(x1, y1, x2, y2){
				ctxS.beginPath();
				ctxS.moveTo(x1, y1);
				ctxS.lineTo(x2, y2);
				ctxS.stroke();
			}

			function drawLine(index1, index2){
					var x1 = circles[index1].x;
					var y1 = circles[index1].y;
					var x2 = circles[index2].x;
					var y2 = circles[index2].y;

					line(x1, y1, x2, y2);

			}



			// draws the circle
			function circ(x, y, rad, c) {
				ctxS.fillStyle = c;
				ctxS.beginPath();
				ctxS.arc(x, y, rad, 0, 2 * Math.PI, false);
				ctxS.closePath();
				ctxS.fill();
			}

			// draws the core of a circle
			function core(x, y, rad, c) {
				ctxS.fillStyle = c;
				ctxS.beginPath();
				ctxS.arc(x, y, rad, 0, 2 * Math.PI, false);
				ctxS.closePath();
				ctxS.fill();
			}


	function draw() {

				// range calculations tbd
				//	if (cores.length > 2 && circles.length > 2){
				//		if (rangeToRange(0,1)){		window.alert("intersect");}
				//		if (insideRange(0,1)){		window.alert("inside");}
				//	}




				// draw the circles and their cores wherever mouse is clicked
				for (var i = circles.length - 1; i >= 0; --i) {

					circ(circles[i].x, circles[i].y, circles[i].radius, circles[i].colour);
					core(cores[i].x, cores[i].y, cores[i].radius, cores[i].colour);

					// grow each circle
					circles[i].radius += speed;







					// ******************************************************************************************************
					// ******************************************************************************************************
					//
					// for all particles, check if they are in range of each other - set speeds to move towards each other
					//
					// ******************************************************************************************************



					for (var j = 0; j < i; j++){

						if (cores[i].alive==true && cores[j].alive==true){


						//	if (rangeToRange(i,j)){
							if (insideRange(i,j)){
								grav = gravity(i,j);

								newspeed = speed / grav;				// dividing makes them move together slowly
							//	newspeed = speed * grav; 				// original line
							//	alert(grav + "  " + speed);
								moveTowards(i,j,newspeed);
								drawLine(i,j);

								}
							}

					}



					if (randomize){

						//
						var plusOrMinusX = Math.random() < 0.5 ? -1 : 1;
						var plusOrMinusY = Math.random() < 0.5 ? -1 : 1;
						var newvx = Math.random()*10*plusOrMinusX;
						var newvy = Math.random()*10*plusOrMinusY;


						//randomize movement
						if (cores[i].alive && circles[i].alive){
							circles[i].x += newvx;
							circles[i].y += newvy;
							cores[i].x += newvx;
							cores[i].y += newvy;
						}

					}

					else{
					// move each circle by set speed
						circles[i].x += circles[i].vx;
						circles[i].y += circles[i].vy;


					// move each core by set speed
						cores[i].x += cores[i].vx;
						cores[i].y += cores[i].vy;
					}









					// age each core by the Age Rate
					cores[i].lifespan = cores[i].lifespan - ageRate;






				// if lifespan = 0, get rid of the core and empty the field shell (start at 0 for corresponding circle)
					if (cores[i].lifespan == 0){
						cores[i].alive = false;
						cores[i].radius = 0;
						cores[i].vx=0;
						cores[i].vy=0;

						circles[i].alive = false;
						circles[i].radius = 0;
						circles[i].vx = 0;
						circles[i].vy = 0;
						//  circles[i].colour = "rgba(255,255,255,.15)";		// white empty
							circles[i].colour = "rgba(0,0,0,.15)";				// black empty



					}

				// remove the "dead" particles from the canvas
					if(cores[i].alive == false && circles[i].radius > canvas.width / 3 || cores[i].x > canvas.width || cores[i].y > canvas.height){
						cores.splice(i,1);
						circles.splice(i,1);
						}


				}		// end main draw for loop


			ctx.drawImage(tempCanvas, 0, 0);
			window.requestAnimationFrame(draw);

			}			// end main draw function








//**********************************************************************************************************************
//**********************************************************************************************************************
//			PHYSICS FUNCTIONS
//**********************************************************************************************************************
//**********************************************************************************************************************


			// computes the distance between two cores
			function distance(x1,y1,x2,y2){
				var dx = x2 - x1;
				var dy = y2 - y1;
				return Math.sqrt(dx*dx + dy*dy);
			}


			// calculates gravitational force of two cores
			function gravity(ind1, ind2){
				var G = 1;
				var m1 = cores[ind1].mass;
				var m2 = cores[ind2].mass;
				var r = distance(cores[ind1].x, cores[ind1].y, cores[ind2].x, cores[ind2].y)
				return G * m1 * m2 / (r * r);
			}



			// checks if core radius can touch another core
			function insideRange(coreIndex1, coreIndex2){
				var dCore = distance(cores[coreIndex1].x, cores[coreIndex1].y, cores[coreIndex2].x, cores[coreIndex2].y);
				var value = false;
				if (dCore <= circles[coreIndex1].radius){ // core1 has a radius field that reaches core2
					value = true;
					}
				return value;
			}


			// checks if core radius can touch another core radius
			function rangeToRange(coreIndex1, coreIndex2){
				var dRad = circles[coreIndex1].radius + circles[coreIndex2].radius;
				var dCores = distance(cores[coreIndex1].x, cores[coreIndex1].y, cores[coreIndex2].x, cores[coreIndex2].y);
				var value = false;
				if (dCores <= dRad){ // core1 and core2 have radius fields that touch or intersect
					value = true;
					}
				return value;
			}


			// move cores towards each other
			function moveTowards(coreIndex1, coreIndex2, speed){
					var x1 = circles[coreIndex1].x;
					var y1 = circles[coreIndex1].y;
					var x2 = circles[coreIndex2].x;
					var y2 = circles[coreIndex2].y;

					var dis = distance(x1,y1,x2,y2);
					var dx = Math.abs(x2 - x1);
					var dy = Math.abs(y2 - y1);


					var speedCofX;
					var speedCofY;



					if (dx != 0){
						//speedCofX = (2*dx)/(dx+dy);
						speedCofX = (1-1/dx);
					}
					else{
						speedCofX = 0;
					}


					if (dy !=0){
						//speedCofY = (2*dy)/(dx+dy);
						speedCofY = (1-1/dy);
					}
					else{
						speedCofY = 0;
						}







					var speedx = speed * speedCofX;
					var speedy = speed * speedCofY;



					if (x1 > x2){
						// set speed to move the circles
							circles[coreIndex1].vx = -speedx;
							circles[coreIndex2].vx = speedx;


						// set speed to move the cores
							cores[coreIndex1].vx = -speedx;
							cores[coreIndex2].vx = speedx;



							if (y2 > y1){
								// set speed to move the circles
									circles[coreIndex1].vy = speedy;
									circles[coreIndex2].vy = -speedy;

								// set speed to move the cores
									cores[coreIndex1].vy = speedy;
									cores[coreIndex2].vy = -speedy;

							}
							else if (y2 < y1){
								// set speed to move the circles
									circles[coreIndex1].vy = -speedy;
									circles[coreIndex2].vy = speedy;

								// set speed to move the cores
									cores[coreIndex1].vy = -speedy;
									cores[coreIndex2].vy = speedy;


							}
							else if (y2 = y1){
								// set speed to move the circles
									circles[coreIndex1].vy = 0;
									circles[coreIndex2].vy = 0;

								// set speed to move the cores
									cores[coreIndex1].vy = 0;
									cores[coreIndex2].vy = 0;


							}
					}


					else if (x1 < x2){
						// set speed to move the circles
							circles[coreIndex1].vx = speedx;
							circles[coreIndex2].vx = -speedx;


						// set speed to move the cores
							cores[coreIndex1].vx = speedx;
							cores[coreIndex2].vx = -speedx;

							if (y2 > y1){
								// set speed to move the circles
									circles[coreIndex1].vy = speedy;
									circles[coreIndex2].vy = -speedy;

								// set speed to move the cores
									cores[coreIndex1].vy = speedy;
									cores[coreIndex2].vy = -speedy;

							}

							else if (y2 < y1){
								// set speed to move the circles
									circles[coreIndex1].vy = -speedy;
									circles[coreIndex2].vy = speedy;

								// set speed to move the cores
									cores[coreIndex1].vy = -speedy;
									cores[coreIndex2].vy = speedy;

							}

							else if (y2 = y1){
								// set speed to move the circles
									circles[coreIndex1].vy = 0;
									circles[coreIndex2].vy = 0;

								// set speed to move the cores
									cores[coreIndex1].vy = 0;
									cores[coreIndex2].vy = 0;

							}
						}

					else if (x2 = x1){
						// set speed to move the circles
							circles[coreIndex1].vx = 0;
							circles[coreIndex2].vx = 0;


						// set speed to move the cores
							cores[coreIndex1].vx = 0;
							cores[coreIndex2].vx = 0;

							if (y2 > y1){
								// set speed to move the circles
									circles[coreIndex1].vy = speed;
									circles[coreIndex2].vy = -speed;

								// set speed to move the cores
									cores[coreIndex1].vy = speed;
									cores[coreIndex2].vy = -speed;

							}
							else if (y2 < y1){
								// set speed to move the circles
									circles[coreIndex1].vy = -speed;
									circles[coreIndex2].vy = speed;

								// set speed to move the cores
									cores[coreIndex1].vy = -speed;
									cores[coreIndex2].vy = speed;

							}

							else if (y2 = y1){
								// set speed to move the circles
									circles[coreIndex1].vy = 0;
									circles[coreIndex2].vy = 0;

								// set speed to move the cores
									cores[coreIndex1].vy = 0;
									cores[coreIndex2].vy = 0;

							}


					}




								}



//**********************************************************************************************************************
//**********************************************************************************************************************
//			OPERATIONAL FUNCTIONS
//**********************************************************************************************************************
//**********************************************************************************************************************


			function resizeCanvas() {
				tempCanvas.width = canvas.width = window.innerWidth;
				tempCanvas.height = canvas.height = window.innerHeight;
			}



			// getting the mouse position on the canvas
			function getMousePos(canvas, evt) {
				var rect = canvas.getBoundingClientRect(),
				root = document.documentElement;

				// return relative mouse position
				var mouseX = evt.clientX - rect.left - root.scrollLeft;
				var mouseY = evt.clientY - rect.top - root.scrollTop;

				return {
					x: mouseX,
					y: mouseY	};
			}


			// random color generator
			// from Ollie Edwards's comment on http://stackoverflow.com/questions/1484506/random-color-generator-in-javascript
			function generateColor(ranges) {
            if (!ranges) {
                ranges = [
                    [150,256],
                    [0, 190],
                    [0, 30]
                ];
            }
            var g = function() {
                //select random range and remove
                var range = ranges.splice(Math.floor(Math.random()*ranges.length), 1)[0];
                //pick a random number from within the range
                return Math.floor(Math.random() * (range[1] - range[0])) + range[0];
            }
            return "rgba(" + g() + "," + g() + "," + g() +", .1" + ")";
        };
