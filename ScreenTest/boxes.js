

var flightListJSON;
var flights = [];

var screenWidth = 1200;   
var screenHeight = screenWidth*.75;




var Simulation = {

    canvas : document.createElement("canvas"),

    load : function(){
    	this.canvas.width = screenWidth;         /////// Screen resolution set here
        this.canvas.height = screenHeight;      ////////////////////////////////
        this.context = this.canvas.getContext("2d");

        $("#screenContainer").append(this.canvas); // placing canvas in html container
    },

    start : function() {
    	this.frame = 0;
        this.interval = setInterval(updateSimulation, 100); // screen refresh time in milliseconds
        $('#playButton').prop("disabled", true);
    },

    click : function() {
        //toggle of altitude/speed displays - affected by framerate
    	this.frame += 1;

    	if (this.frame%30 == 0){
    		flights.forEach(function(flight) {
    		flight.toggleDisp();
            });

    	}
    },
    clear : function() {
    	// erases whole canvas
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop : function() {

    	clearInterval(this.interval);
    	this.clear();

    	// console.log("stop clear fired")
    	$('#playButton').prop("disabled", false); // enable play button
    },

    changeSimSpeed : function() { //sets new interval for framerate
    	clearInterval(this.interval)
    	var multiplier = $("#simSpeedInput").val();
    	this.interval = setInterval(updateSimulation,100/multiplier);
    }
}


function Flight(color, x, y, degrees, speed, ID, altitude) {
	
    this.width = 2;   // dimensions of lines used to draw V shape
    this.height = 6;   ///

    this.ID = ID;
    this.x = x;
    this.y = y; 

    this.toggler = true;

    this.targetDirection = degrees;         // target values
    this.targetSpeed = speed;              /// changed by input from user
    this.targetAltitude = this.altitude;  ///  
    
    
    this.direction = degrees;   // actual values
    this.speed = speed;        // pushed toward targets by seek___ functions
    this.altitude = altitude; ///

    this.toggler = true;


    this.toggleDisp = function(){  // controller for data block toggling
    	this.toggler = !this.toggler;
    }

    this.move = function(){ /// calculates (x,y) position for next frame
        

        // pushing actual values toward target values
        this.seekDirection();
        this.seekSpeed();
    	this.seekAltitude();

    	let bearing = this.direction * (Math.PI/180); // Convert to Radians

    	this.x += this.speed * (Math.sin(bearing)) ;
    	
    	this.y += (this.speed * (Math.cos(bearing)))*-1;

        

        // turns flights to keep them on screen
        // kindof broken

    	// if (this.x > Simulation.canvas.width * .9){
    	// 	if (this.x < Simulation.canvas.width/2){
     //            this.targetDirection = 225;
     //        } else {
     //            this.targetDirection = 315;
     //        }
    	// }
    	// if (this.x < Simulation.canvas.width * .1){
    	// 	if (this.y < Simulation.canvas.height/2){
     //            this.targetDirection = 135;
     //        } else {
     //            this.targetDirection = 45;
     //        }
    	// }

    	// if (this.y > Simulation.canvas.height * .9){
    	// 	if (this.x < Simulation.canvas.width/2){
     //            this.targetDirection = 45;
     //        } else {
     //            this.targetDirection = 315;
     //        }
    	// }
    	// if (this.y < Simulation.canvas.height * .1){
     //        if (this.x < Simulation.canvas.width/2){
     //            this.targetDirection = 135;
     //        } else {
     //            this.targetDirection = 225;
     //        }
    		
    	// }
    	
    }   
    this.seekDirection = function(){
        // turns in dumb ways - doesnt account for 360 = 0

        if (this.direction < this.targetDirection){
            this.direction += 1;
        } else if (this.direction> this.targetDirection) {
            this.direction -= 1;
        }
    }
    this.seekSpeed = function(){
        if (this.speed.toFixed(2) < this.targetSpeed.toFixed(2)){
            this.speed += .01; // amount of change per frame
            this.speed.toFixed(2); // limits display to 2 decimal places
        } else if (this.speed.toFixed(2)> this.targetSpeed.toFixed(2)) {
            this.speed -= .01;
            this.speed.toFixed(2);
        }
    }
    this.seekAltitude = function(){
        if (this.altitude < this.targetAltitude){
            this.altitude += .2;
        } else if (this.altitude > this.targetAltitude){
            this.altitude -= .2;
        }
    }

    this.update = function(){ /// draws flight icon and info onto screen


        ctx = Simulation.context;

        ctx.fillStyle = color;

        ctx.save(); // saves context placement
        
        //////////////////////
        //// drawing flight V icon
        // 
        // this is weird and sloppy

        var iconAngle = 45; // angle of V icon
        
        ctx.translate(this.x+(this.width/2), this.y);       // move anchor point
		ctx.rotate( (this.direction+(iconAngle/2)) * (Math.PI/180) );	// rotates whole canvas - leads to wonky drawing
		ctx.translate(-(this.x+(this.width/2)), -(this.y)); // returns anchor point
		
        ctx.fillRect(this.x, this.y, this.width, this.height);  // draws rectangle

        /// drawing second line of V icon
		ctx.translate(this.x+(this.width/2), this.y);
		ctx.rotate(-(iconAngle) *(Math.PI/180));
		ctx.translate(-(this.x+(this.width/2)), -(this.y));

        ctx.fillRect(this.x, this.y, this.width, this.height);


        ctx.restore(); /// restores context to saved state -- undoes rotation and translate


        ////////////////////
        ///// drawing flight data

        ctx.font = "12px Arial";
		ctx.fillStyle = "Black";
		ctx.textAlign = "left";
		let data;
		if (!this.toggler){
			this.data = this.speed.toFixed(2);
		} else {
			this.data = this.altitude.toFixed(0);
		}
       
        /// drawing bacground block for text
        ctx.fillStyle = "lightblue";
        var bg = '';
        for (var i = 0; i < 8; i++){
            bg = bg + String.fromCharCode('9608');  /// unicode for solid block
        }
        ctx.fillText(bg, this.x + 6 , this.y-21);       //// drawing background block color
        ctx.fillText(bg, this.x + 6 , this.y-9);
        
        ctx.fillStyle = "Black";
		ctx.fillText(this.ID, this.x + 6 , this.y-21); // coordinate offset from marker
		

 		ctx.fillText(this.data, this.x + 6 , this.y-9);

 		


    }

    

    
}

function drawGuides(){
    // draws degrees markers on screen for reference
    var ctx = Simulation.context;
    var padding = 10;
    ctx.font = "13px Times";
    ctx.fillStyle = "lightgray";
    ctx.fillText("0", screenWidth/2 , padding);
    ctx.fillText("90", screenWidth - padding -5 , screenHeight/2);
    ctx.fillText("180", screenWidth/2 , screenHeight - padding);
    ctx.fillText("270", padding , screenHeight/2);
    }

function updateSimulation() {
    // upates canvas by one frame
	
    Simulation.clear(); // delete everything
    Simulation.click();// advancing frame count/ toggle animation

    flights.forEach(function(flight) { 
    	flight.move() // calculate position
    	flight.update() // draw flight to screen
    });

    drawGuides();
     
}


///////////////////
//// functions called by buttons to change flight values
//

function changeDirection(){
	var input = $("#angleInput").val();
	var targetFlight;
	flights.forEach(function(flight) {
    	if(input.substr(0,2) == flight.ID.substr(7,9)){
    		targetFlight = flight;
    		targetFlight.targetDirection = parseFloat(input.substr(2,input.length-1));
    	}
    });
}

function changeSpeed(){
	var input = $("#speedInput").val();
	var targetFlight;
	flights.forEach(function(flight) {
    	if(input.substr(0,2) == flight.ID.substr(7,9)){
    		targetFlight = flight;
    		targetFlight.targetSpeed = parseFloat(input.substr(2,input.length-1));
    	}
    });
}

function changeAlt(){
	
	var input = $("#altitudeInput").val();
	var targetFlight;
	flights.forEach(function(flight) {
    	if(input.substr(0,2) == flight.ID.substr(7,9)){
    		targetFlight = flight;
    		targetFlight.targetAltitude = parseFloat(input.substr(2,input.length-1));
    	}
    });
}



function loadSim(){         
        // loads json file to variable
        // requires App.js to be running to use server 
        //      to comply with https and CORS policy rules.
        //      i do not understand.
        // 
            
            flights = [];
            var query = "http://localhost:3000/load?";
            
            $.ajax({  
                url: query, 
                crossDomain: true, 
                dataType: 'json', 
                type: 'GET'

            })
                
                .done(function (json) { // if connection is made and json loaded
                    flightListJSON = json["flights"];
                    // console.log(flightListJSON);
                    for (flight in flightListJSON){ // loading flight objects from json into array

                        var JSONobj = flightListJSON[flight]; 
                        // -- gotta be cleaner ways of doing this
                        var temp = new Flight(JSONobj.color, parseFloat(JSONobj.x), parseFloat(JSONobj.y), parseFloat(JSONobj.direction), parseFloat(JSONobj.speed), JSONobj.ID, parseFloat(JSONobj.altitude));
                        
                        flights.push(temp);
                    }

                    //hard coded flights
                    flight01 = new Flight("magenta", 800, 800,23, .3,      "N799298LL", 945); 
                    flight02 = new Flight("teal", 120, 120,135, .3,      "SA77383YY", 945);   
                    flights.push(flight01);
                    flights.push(flight02);

                    Simulation.start();

                })

                .fail(function () { // if connection is not made
                    
                    //force hard coded flights in case loading is an issue
                    flight01 = new Flight("red", 800, 800,23, .3,      "N799298LL", 945); 
                    flight02 = new Flight("red", 120, 120,135, .3,      "SA77383YY", 945);   
                    flights.push(flight01);
                    flights.push(flight02);

                    Simulation.start();            
                }); 
        }



