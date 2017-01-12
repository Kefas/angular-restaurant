'use strict';

// Declare app level module which depends on views, and components
var myApp = angular.module('myApp', []);


myApp.controller('AppCtrl', function ($scope, $http) {

    $('.carousel').carousel({
        interval: 5000
    });

    var socket = io.connect();
    socket.on('message', function (time) {
        document.getElementById('time').innerHTML = time;
    });

    $http.get('http://localhost:5000/items' ).then(
        function(response) {
            $scope.items=response.data;
        },
        function(errResponse) {
            alert('Can not access data');
            console.log('Something went wrong: ' , errResponse);
        }
    );

    $scope.initMap = function () {
        var uluru = {lat: -25.363, lng: 131.044};
        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 4,
            center: uluru
        });
        var marker = new google.maps.Marker({
            position: uluru,
            map: map
        });
    };

    $scope.initMap();

    $http.get('http://localhost:5000/items' ).then(
        function(response) {
            $scope.items=response.data;
        },
        function(errResponse) {
            alert('Can not access data');
            console.log('Something went wrong: ' , errResponse);
        }
    );

    $scope.toggle = function(itemId) {
        $("#desc-" + itemId).toggleClass('hidden', "easeOutSine");
    };

    $scope.addComment = function(itemId) {
      $http.post('http://localhost:5000/items/' + itemId + '/comments', {author: $('#author-' + itemId)[0].value, text: $('#text-' + itemId)[0].value}).then(
          function (response) {

          }, function (errResponse) {
              console.log('Can`t add comment: ' , errResponse);
          }
      )
    };


});

