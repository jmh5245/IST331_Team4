

var flightListJSON;
var flights = ["FUCKOFF"];

var screenWidth = 1200;   
var screenHeight = screenWidth*.75;


var slider = document.getElementById("myRange");
console.log(slider);
var output = document.getElementById("speedDisplay");
output.innerHTML = slider.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
    output.innerHTML = slider.value;
    if (Simulation.running){
        Simulation.changeSimSpeed();
    }
    
} 


var Simulation = {

    running:false,
    

    canvas : document.createElement("canvas"),

    seconds:0,
    minutes:0,
    timer: document.getElementById("timer"),
    

    load : function(){

        
    	this.canvas.width = screenWidth;         /////// Screen resolution set here
        this.canvas.height = screenHeight;      ////////////////////////////////
        this.context = this.canvas.getContext("2d");

        $("#screenContainer").append(this.canvas); // placing canvas in html container
        $("#stopButton").prop("disabled",true);



        // var maxHeight = $(window).height();
        // $('#mainContainer').css("max-width",maxHeight*(1.5));
    },

    start : function() {
    	this.frame = 0;
        var multiplier = $("#myRange").val();
        this.interval = setInterval(updateSimulation, 200/multiplier); // screen refresh time in milliseconds
        $('#playButton').prop("disabled", true);
        $("#stopButton").prop("disabled", false);

        this.running = true;
    },

    click : function() {
        //toggle of altitude/speed displays - affected by framerate


    	this.frame += 1;
        if (this.frame%10 ==0){
            this.seconds += 1;
        }
        if (this.seconds == 60){
            this.minutes +=1;
            this.seconds = 0;
        }

        var sec = this.seconds.toString();
        while (sec.length < 2) sec = "0" + sec;

        var min = this.minutes.toString();
        while (min.length < 2) min = "0" + min;

        timer.innerHTML = min + ":" + sec+":"+this.frame;


    	if (this.frame%30 == 0){
            this.frame = 0;
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

        this.seconds = 0;
        this.minutes = 0;
        this.frame = 0;
        var sec = this.seconds.toString();
        while (sec.length < 2) sec = "0" + sec;

        var min = this.minutes.toString();
        while (min.length < 2) min = "0" + min;

        timer.innerHTML = min + ":" + sec+":"+this.frame;

    	// console.log("stop clear fired")
    	$('#playButton').prop("disabled", false).removeClass('disabledButton'); // enable play button
        this.running = false;
        $("#stopButton").prop("disabled", true);

        flights = [];
        angular.element($('body')).scope().populateList();
        angular.element($('body')).scope().$apply();
    },


    changeSimSpeed : function() { //sets new interval for framerate
    	clearInterval(this.interval)
    	var multiplier = $("#myRange").val();
    	this.interval = setInterval(updateSimulation,200/multiplier);
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
        //WORKING
        ////////////////////////////////////////////////////////////
        // pushing actual values toward target values
        this.seekDirection();
        this.seekSpeed();
    	this.seekAltitude();

    	let bearing = this.direction * (Math.PI/180); // Convert to Radians

    	this.x += this.speed * (Math.sin(bearing)) ;
    	
    	this.y += (this.speed * (Math.cos(bearing)))*-1;
        ////////////////////////////////////////////////////////////
        


        ////////////////////////////////////////////////////////////
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

        if (true){
            ctx = Simulation.context;

            ctx.fillStyle = color;

            ctx.save(); // saves context placement



            ctx.beginPath();
                                    //  vv radius
                                    //
            ctx.arc(this.x, this.y, 8, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'purple';
            ctx.fill();
            ctx.lineWidth = 5;
           

            ctx.translate(this.x+(this.width/2), this.y);       // move anchor point
            ctx.rotate( 30 * (Math.PI/180) );    // rotates whole canvas - leads to wonky drawing
            ctx.translate(-(this.x+(this.width/2)), -(this.y)); // returns anchor point
            
            ctx.fillStyle = 'yellow';
            ctx.fillRect(this.x, this.y-16, this.width, this.height);  // draws rectangle
            ctx.restore();

            ctx.font = "12px Arial";
            ctx.fillStyle = "Black";
            ctx.textAlign = "center";
            ctx.fillText("V", this.x , this.y+5);


            
            //////////////////////
            //// drawing flight V icon
            // 
            // this is weird and sloppy

      //       var iconAngle = 45; // angle of V icon
            
      //       ctx.translate(this.x+(this.width/2), this.y);       // move anchor point
    		// ctx.rotate( (this.direction+(iconAngle/2)) * (Math.PI/180) );	// rotates whole canvas - leads to wonky drawing
    		// ctx.translate(-(this.x+(this.width/2)), -(this.y)); // returns anchor point
    		
      //       ctx.fillRect(this.x, this.y, this.width, this.height);  // draws rectangle

      //       /// drawing second line of V icon
    		// ctx.translate(this.x+(this.width/2), this.y);
    		// ctx.rotate(-(iconAngle) *(Math.PI/180));
    		// ctx.translate(-(this.x+(this.width/2)), -(this.y));

      //       ctx.fillRect(this.x, this.y, this.width, this.height);


      //       ctx.restore(); /// restores context to saved state -- undoes rotation and translate


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
      //       ctx.fillStyle = "lightblue";
      //       var bg = '';
      //       for (var i = 0; i < 8; i++){
      //           bg = bg + String.fromCharCode('9608');  /// unicode for solid block
      //       }
      //       ctx.fillText(bg, this.x + 6 , this.y-21);       //// drawing background block color
      //       ctx.fillText(bg, this.x + 6 , this.y-9);
            
            ctx.fillStyle = "white";
    		
            ctx.fillText(this.ID, this.x + 10 , this.y-30); // coordinate offset from marker
    		

     		ctx.fillText(this.data, this.x + 10 , this.y-18);
        }

 		


    }

    this.spawnFlight = function(){
        this.active = true;
        flights.shift(0);
        angular.element($('body')).scope().$apply();

    }

    

    
}

function drawGuides(){
    // draws degrees markers on screen for reference
    var ctx = Simulation.context;
    var padding = 10;
    ctx.font = "13px Times";
    ctx.fillStyle = "gray";
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
	var input = $("#input1").val();
	var targetFlight;
	flights.forEach(function(flight) {
    	if(input.substr(0,2) == flight.ID.substr(7,9)){
    		targetFlight = flight;
    		targetFlight.targetDirection = parseFloat(input.substr(2,input.length-1));
    	}
    });
}

function changeSpeed(){
	var input = $("#input1").val();
	var targetFlight;
	flights.forEach(function(flight) {
    	if(input.substr(0,2) == flight.ID.substr(7,9)){
    		targetFlight = flight;
    		targetFlight.targetSpeed = parseFloat(input.substr(2,input.length-1));
    	}
    });
}

function changeAlt(){
	
	var input = $("#input1").val();
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

                    // flights[0].spawnFlight();

                    angular.element($('body')).scope().populateList(); ///// FILLING ANGULAR FLIGHT LIST

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



// 39.8729° N, 75.2437° W
let map;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 39.8729, lng: -75.2437 },
    zoom: 9,
    gestureHandling: "none",
    zoomControl: false,
    disableDefaultUI:true,
    styles:[
  {
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#37ff00"
      },
      {
        "visibility": "on"
      },
      {
        "weight": 1
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.neighborhood",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "landscape",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#000000"
      }
    ]
  },
  {
    "featureType": "landscape",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#ff0000"
      }
    ]
  },
  {
    "featureType": "poi",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "transit",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#5f5858"
      },
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#37ff00"
      },
      {
        "visibility": "on"
      }
    ]
  }
]
  });
  // map.setOptions({disableDefaultUI:true});
}

var app = angular.module("SimFast",[]);


app.controller("SimFastController", function($scope) {

  
    $scope.flightList = flights;

    $scope.inputNums = [];
    $scope.inputOps = [];

    $scope.combined = [];
    $scope.input1 = '';

    $scope.populateList = function(){
        $scope.flightList = flights;
        console.log($scope.flightList);
        $scope.$apply();
    };
    
    

    $scope.pushChar = function(item) { 

        $scope.input1 = $scope.input1 + item;

        
        

    };

    $scope.sendCommand = function() {
        console.log($scope.input1);

        var input = $scope.input1

        /// parse string into sections
            /// call changeX() accordingly
        // A = alt
        // V = speed
        // H = direction
        changeDirection($scope.input1);
        


    };


    $scope.clearAll = function(){
        
        $scope.input1 = '';
        $scope.inputNums = [];
        $scope.inputOps = [];
        $scope.combined = [];
    }

});

