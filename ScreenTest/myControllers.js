var app = angular.module("KeyboardApp",[]);


app.controller("KeyboardControl", function($scope) {
	$scope.inputNums = [];
	$scope.inputOps = [];

	$scope.combined = [];
	$scope.input1 = '';
	

	$scope.pushChar = function(item) { 

		$scope.input1 = $scope.input1 + item;
		
		

	};

	$scope.sendCommand = function() {
		console.log($scope.input1);
		


	};


	$scope.clearAll = function(){
		
		$scope.input1 = '';
		$scope.inputNums = [];
		$scope.inputOps = [];
		$scope.combined = [];
	}

	
                // Method to toggle the css class.
    




})


