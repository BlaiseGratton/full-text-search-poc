'use strict';

Array.prototype.crush = function() {
  var crushedArray = [];
  this.forEach(function(datum) {
    crushedArray.unshift(flattenKAAObject(datum));
  });
  return crushedArray;
};

function flattenKAAObject(datum) {
  var flattenedObject = {
    KAA_type: datum.KAA.type,
    KAA_value: datum.KAA.value,
    Text_type: datum.Text.type,
    Text_value: datum.Text.value,
  };
  return flattenedObject;
}

var app = angular.module('fullTextApp', []);

app.controller('mainController', function(dataService, $scope) {
  var vm = this;
  var allData = [];
  var flattenedData = [];
  var search = new JsSearch.Search('Text_value');
  search.addIndex('KAA_type');
  search.addIndex('KAA_value');
  search.addIndex('Text_type');
  search.addIndex('Text_value');

  $scope.$watch(function() { return vm.searchInput; }, function(newVal) {
    if (!newVal || newVal.length <= 2) {
      vm.searchResults = [];
    }
    if (!!newVal && newVal.length > 2) {
      vm.searchResults = search.search(vm.searchInput);
    }
  });

  dataService.getAllData().then(function(response) {
    allData = response.data.results.bindings;
    flattenedData = allData.crush();
    search.addDocuments(flattenedData);
  }, function(error) {
    debugger
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
