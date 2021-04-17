

var flightListJSON;
var ALL_FLIGHTS = []
var flights = [];
var flightsComing = [];

var screenWidth = 950;   //// shitty -- hard coded in .css .json
                        ///     
var screenHeight = 750; //    changing sucks

var flightIconSize = 6; // radius of flight on screen
var flightDataFontSize = "11.5px Arial";

var CANVAS = document.getElementById("canvas");


var slider = document.getElementById("myRange");
// console.log(slider);
var output = document.getElementById("speedDisplay");
output.innerHTML = slider.value; // Display the default slider value


var selectedFlight = '';

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
    output.innerHTML = slider.value;
    if (Simulation.running){
        Simulation.changeSimSpeed();
    }
    
} 

// console.log($(window).width());
// console.log($(window).height())


var Simulation = {

    running:false,
    

    canvas : CANVAS,

    seconds:0,
    minutes:0,
    hours:0,
    timer: document.getElementById("timer"),
    frameTimer: document.getElementById("frameDisplay"),
    

    load : function(){





        
    	this.canvas.width = screenWidth;         /////// Screen resolution set here
        this.canvas.height = screenHeight;      ////////////////////////////////
        this.context = this.canvas.getContext("2d");
        drawGuides();
        // this.hideMap();

        $("#screenContainer").append(this.canvas); // placing canvas in html container
        $("#stopButton").prop("disabled",true);



        // var maxHeight = $(window).height();
        // $('#mainContainer').css("max-width",maxHeight*(1.5));
    },

    showMap : function(){
        $("#map").css("display","block");
    },
    hideMap : function(){
        setTimeout(function(){
            $("#map").css("display","none");
        }, 1000)
    },

    start : function() {

        $("#mapBlocker").addClass("turnedOn");

    	this.frame = 0;
        var multiplier = $("#myRange").val();
        this.interval = setInterval(updateSimulation, 200/multiplier); // screen refresh time in milliseconds
        $('#playButton').prop("disabled", true);
        $("#stopButton").prop("disabled", false);


        // this.showMap();
        this.running = true;
        // flightsComing = flights;
        ALL_FLIGHTS = flights;
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
        if (this.minutes == 60){
            this.hours +=1;
            this.minutes = 0;
        }


        var milsec = this.frame;
        milsec = milsec.toString();
        while (milsec.length < 2) milsec = "0" + milsec;

        var sec = this.seconds.toString();
        while (sec.length < 2) sec = "0" + sec;

        var min = this.minutes.toString();
        while (min.length < 2) min = "0" + min;

        var hr = this.hours.toString();
        while (hr.length < 2) hr = "0" + hr;

        

        timer.innerHTML = hr +":"+min + ":" + sec + "<span id='frameDisplay'>:"+milsec+"</span>";
        // this.frameTimer.innerHTML = milsec;



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


    	$("#mapBlocker").removeClass("turnedOn");

        this.seconds = 0;
        this.minutes = 0;
        this.frame = 0;
        clearInterval(this.interval);
        this.clear();
        drawGuides();
        // this.hideMap();
        // var sec = this.seconds.toString();
        // while (sec.length < 2) sec = "0" + sec;

        // var min = this.minutes.toString();
        // while (min.length < 2) min = "0" + min;

        timer.innerHTML = "--:--:--"+"<span id='frameDisplay'>:--</span>";
        

    	// console.log("stop clear fired")
    	$('#playButton').prop("disabled", false).removeClass('disabledButton'); // enable play button
        this.running = false;
        $("#stopButton").prop("disabled", true);

        flights = [];
        flightsComing = [];
        angular.element($('body')).scope().populateList();
        angular.element($('body')).scope().$apply();
    },


    changeSimSpeed : function() { //sets new interval for framerate
    	clearInterval(this.interval)
    	var multiplier = $("#myRange").val();
    	this.interval = setInterval(updateSimulation,200/multiplier);
    }
}


function Flight(json){//color, x, y, degrees, speed, ID, altitude,type) {
	
    this.width = 2;   // dimensions of lines used to draw V shape
    this.height = 6;   ///

    this.ID = json.ID;
    // console.log(json.x);
    this.x = parseFloat(json.x);
    this.y = parseFloat(json.y); 
    this.letter = json.unknownLetter;
    this.number = json.unknownNumber;
    console.log(this.letter);

    this.radius = flightIconSize;



    this.toggler = true;

    this.targetDirection = parseFloat(json.direction);         // target values
    this.targetSpeed = parseFloat(json.speed);              /// changed by input from user
    this.targetAltitude = parseFloat(json.altitude);  ///  
    
    this.destination = json.destination;
    this.departure = json.departure;
    this.direction = parseFloat(json.direction);   // actual values
    this.speed = parseFloat(json.speed);        // pushed toward targets by seek___ functions
    this.altitude = parseFloat(json.altitude); ///
    this.aircraftType = json.aircraftType;

    this.spawnTimeSec = parseInt(json.spawnTimeSec);
    this.spawnTimeMin = parseInt(json.spawnTimeMin);
    // console.log(this.spawnTimeMin);

    this.active = false;

    this.toggler = true;

    this.trail = [];


    this.toggleDisp = function(){  // controller for data block toggling
    	this.toggler = !this.toggler;
    }

    this.move = function(){ /// calculates (x,y) position for next frame
        
        if(Simulation.frame%30 ==0){
            this.trail.push([this.x,this.y]);

        }
        if (this.trail.length >10){
            this.trail.shift();
        }

        //WORKING
        ////////////////////////////////////////////////////////////
        // pushing actual values toward target values
        this.seekDirection();
        this.seekSpeed();
    	this.seekAltitude();

    	let bearing = this.direction * (Math.PI/180); // Convert to Radians

    	this.x += this.speed * (Math.sin(bearing)) ;
    	
    	this.y += (this.speed * (Math.cos(bearing)))*-1;


        //////// FLIGHT LANDS WHEN REACHES CENTER OF CANVAS (map centered on PHL airport)
        if (Math.round(this.y) == Simulation.canvas.height/2){
            // console.log(this.x);
            if (Math.round(this.x) == Simulation.canvas.width/2 ){
                console.log("LANDING: " + this.ID);
                /// remove flight from 'flights' list
                this.active = false;
                flights = flights.filter(obj => obj.ID !== this.ID); 

                // flights = flights.filter(obj => obj.ID !== this.ID); //// KILL THE FLIGHT
                angular.element($('body')).scope().populateList();
                angular.element($('body')).scope().$apply();
            }
        }
        ////////////////////////////////////////////////////////////
    	
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
        if (this.active){
            ctx = Simulation.context;


            // ctx.fillStyle = color;

            ctx.save(); // saves context placement

            /// TRAIL DOTS///////////////////////// unneccesary
            var transparency = 1;
            this.trail.reverse();
            for (var i =0; i<this.trail.length; i++){
                // console.log(point);
                                        //  vv radius
                ctx.globalAlpha = transparency;
                ctx.fillStyle = 'white';
                ctx.fillRect(this.trail[i][0], this.trail[i][1], 2, 2);  // draws rectangle
                transparency-=.1;
                
            }
            this.trail.reverse();
            ctx.globalAlpha = 1;



            ctx.beginPath();
                                    //  vv radius
                                    //
            ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = '#B938DD';
            ctx.fill();
            
            ctx.lineWidth = 5;


            var xOffset=10;
            var yOffset =30;
            var yOffsetLow = 18;
            var lineAngle =30;
            if (this.y < 50){
                yOffset =-18;
                yOffsetLow = -30;
                xOffset = 15;
                lineAngle = 120;
            }

            if (this.x > Simulation.canvas.width-90){
                xOffset = -70;
                lineAngle = 300;
            }
           

            ctx.translate(this.x+(this.width/2), this.y);       // move anchor point
            ctx.rotate( lineAngle * (Math.PI/180) );    // rotates whole canvas - leads to wonky drawing
            ctx.translate(-(this.x+(this.width/2)), -(this.y)); // returns anchor point
            
            ctx.fillStyle = 'white';
            ctx.fillRect(this.x, this.y-16, this.width, this.height);  // draws rectangle
            ctx.restore();

            ctx.font = "10px Arial";
            ctx.fillStyle = "Black";
            ctx.textAlign = "center";
            ctx.fillText("V", this.x , this.y+5);


            
           
            ////////////////////
            ///// drawing flight data

            ctx.font = flightDataFontSize;
    		ctx.fillStyle = "Black";
    		ctx.textAlign = "left";
    		let data;
    		if (!this.toggler){
    			this.data = this.speed.toFixed(2) +" " + this.direction;
    		} else {
    			this.data = this.altitude.toFixed(0) + "  " + this.aircraftType;
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
    		
            ctx.fillText(this.ID, this.x + xOffset , this.y-yOffset); // coordinate offset from marker
    		

     		ctx.fillText(this.data, this.x + xOffset , this.y-yOffsetLow);


            

        }

    }

    



    this.spawnFlight = function(){
        this.active = true;
        // flights.shift(0);
        flightsComing = flightsComing.filter(obj => obj.ID !== this.ID); 
        // flightsComing.reverse();
        angular.element($('body')).scope().populateList();
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

    var r = 100;
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(164, 246, 70,.3)";

    for (var i =0; i<4; i++){
        ctx.beginPath() ;  
        ctx.arc(screenWidth/2, screenHeight/2, r*i, 0, 2 * Math.PI, false);
        ctx.stroke();

    }
    
    }

function updateSimulation() {
    // upates canvas by one frame
	
    Simulation.clear(); // delete everything
    Simulation.click();// advancing frame count/ toggle animation
    drawGuides();
    flights.forEach(function(flight) {


     
        if (flight.active){

    	   flight.move() // calculate position

    	   flight.update() // draw flight to screen
        }
        else{

            // if (flight.minutes == Simulation.minutes){
                // console.log("thisfar");
                
                if((flight.spawnTimeSec == Simulation.seconds)&&(flight.spawnTimeMin == Simulation.minutes)){
                    // console.log("thisfar");
                    
                    flight.spawnFlight();
                }
            
        }


    });

    
     
}






document.getElementById("shadowOverlay").addEventListener('mouseup', function(e) {
    var mouse = getMouse(Simulation.canvas,e);
    var x1 = mouse.x;
    var y1 = mouse.y;
    // console.log(x1,y1)

    flights.forEach(function(flight) {
        var x2 = flight.x;
        var y2 = flight.y;
        if (getDistance(x1,y1,x2,y2) < flight.radius*1.5){
            console.log('hit' + flight.ID);
            selectClickedFlight(flight);
        }else{console.log('miss')}
    });
    
});

function selectClickedFlight(flight){
    angular.element($('body')).scope().selectedFlight = flight;
    angular.element($('body')).scope().$apply();
}

function getMouse(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}
function getDistance(xA, yA, xB, yB) { 
    var xDiff = xA - xB; 
    var yDiff = yA - yB;

    return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
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




window.onkeydown = function(e) {
       var key = e.keyCode ? e.keyCode : e.which;
       // console.log(e.keyCode);
       
       
       if (key == 39) { // right arrow
            var v = Number.parseInt(slider.value) + 1;

            // slider.value +=1;
            if (Simulation.running){
                Simulation.changeSimSpeed();
            }

            angular.element($('body')).scope().$apply()
            output.innerHTML = v;
            slider.value = v;
            flights[0].spawnFlight();

       }else if (key == 37) { // left arrow
           var v = Number.parseInt(slider.value) - 1;

            // slider.value +=1;
            if (Simulation.running){
                Simulation.changeSimSpeed();
            }

            angular.element($('body')).scope().$apply()
            output.innerHTML = v;
            slider.value = v;

       }

    else if (key == 32){  //spacebar
        if (Simulation.running){
            Simulation.stop();
        } else{
            loadSim();
            
        }

   }
}


function restartSim(){
    Simulation.stop();
    loadSim(); 
}
function loadSim(){         
        // loads json file to variable
        // requires App.js to be running to use server 
        //      to comply with https and CORS policy rules.
        //      i do not understand.
        // 
            
            // console.log($("#turningOnAnimation"))
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
                        var temp = new Flight(JSONobj);//.color, parseFloat(JSONobj.x), parseFloat(JSONobj.y), parseFloat(JSONobj.direction), parseFloat(JSONobj.speed), JSONobj.ID, parseFloat(JSONobj.altitude));
                        
                        flights.push(temp);
                        flightsComing.push(temp);
                    }


                    console.log("pause");
                    // Sorts Flights Loaded display in order of appearance

                    flightsComing.sort((a, b) => {
                        

                        if (a.spawnTimeMin < b.spawnTimeMin) {
                            return -1;
                        } 
                        if (a.spawnTimeMin === b.spawnTimeMin){
                            if (a.spawnTimeSec < b.spawnTimeSec){
                                return -1;
                            }
                            if (a.spawnTimeSec > b.spawnTimeSec){
                                return 1;
                            }
                        }
                        if (a.spawnTimeMin > b.spawnTimeMin) {
                            return 1;
                        }
                        return 0;
                    });
                    console.log("pause");
                    //hard coded flights
                    // flight01 = new Flight("magenta", 800, 800,23, .3,      "N799298LL", 945); 
                    // flight02 = new Flight("teal", 120, 120,135, .3,      "SA77383YY", 945);   
                    // flights.push(flight01);
                    // flights.push(flight02);

                    // flights[0].spawnFlight();

                    angular.element($('body')).scope().populateList(); ///// FILLING ANGULAR FLIGHT LIST

                    Simulation.start();

                })

                .fail(function () { // if connection is not made
                    
                    //force hard coded flights in case loading is an issue
                    flight01 = new Flight("red", 800, 800,23, .3,      "N799298AA", 945); 
                    flight02 = new Flight("red", 120, 120,135, .3,      "SA77383BB", 945);   
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

function changeMap(){
    map.setCenter({lat: -34, lng: 151});
}

var app = angular.module("SimFast",[]);


app.controller("SimFastController", function($scope) {

  
    $scope.flightList = flightsComing;

    $scope.inputNums = [];
    $scope.inputOps = [];

    $scope.combined = [];
    $scope.input1 = '';

    $scope.selectedFlight = selectedFlight;

    $scope.populateList = function(){
        console.log(flightsComing);
        // flightsComing.sort((a, b) => (a.spawnTimeMinutes > b.spawnTimeMinutes) ? 1 : (a.spawnTimeMinutes === b.spawnTimeMinutes) ? ((a.spawnTimeSeconds > b.spawnTimeSeconds) ? 1 : -1) : -1 );
        console.log(flightsComing);



        $scope.flightList = flightsComing;
        // console.log($scope.flightList);
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

    $scope.selectFlight = function(){

        var input = $("#input1").val();
        var targetFlight;
        flights.forEach(function(flight) {
            if(input.substr(0,2) == flight.ID.substr(7,9)){
                $scope.selectedFlight = flight;
                selectedFlight = flight;
            }
            
        });




    }
    $scope.selectFlightFromList = function($event){

        var input = $event.currentTarget.children[2].innerHTML;
        // console.log($event.currentTarget.children[2].innerHTML);
        var targetFlight;
        // $event.currentTarget.prop("background-color","red");
        flights.forEach(function(flight) {
            // console.log(input);
            // $scope.input1 = input;
            if(input.substr(7,9) == flight.ID.substr(7,9)){
                // console.log(input);
                $scope.selectedFlight = flight;
                selectedFlight = flight;

            }
            
        });
    }

});



