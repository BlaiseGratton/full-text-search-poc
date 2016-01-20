'use strict';

var app = angular.module('fullTextApp', []);

app.controller('mainController', function(dataService) {
  var vm = this;
  var allData = [];

  vm.viewResults = [];

  dataService.getAllData().then(function(response) {
    allData = response.data.results.bindings;
  }, function(error) {
    console.log(error);
  });
});

app.factory('dataService', function($http) {
  var service = {};

  var allDataUrl = 'http://kenchreai.org/reasoner/kenchreai/query?query=PREFIX%20rdfs%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%0APREFIX%20kaaont%3A%20%3Chttp%3A%2F%2Fkenchreai.org%2Fkaa%2Fontology%2F%3E%0ASELECT%20%3FKAA%20%3FText%20WHERE%20%7B%0A%20%20%7B%20%3FKAA%20kaaont%3Akaa-any-string%20%3FText%20.%20%7D%0A%20%20UNION%0A%20%20%7B%20%3FKAA%20rdfs%3Alabel%20%3FText%20%7D%0A%7D%20%0A';

  service.getAllData = function() {
    return $http.get(allDataUrl);
  };

  return service;
});