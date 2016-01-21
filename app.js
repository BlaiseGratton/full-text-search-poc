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

app.controller('mainController', function(dataService, $scope, searchService) {
  var vm = this;
  var data = [];
  var flattenedData = [];

  $scope.$watch(function() { return vm.searchInput; }, function(newVal) {
    if (!newVal || newVal.length <= 2) {
      vm.searchResults = [];
    }
    if (!!newVal && newVal.length > 2) {
      vm.searchResults = searchService.runSearch(vm.searchInput);
    }
  });

  dataService.getAllData().then(function(response) {
    data = response.data.results.bindings;
    flattenedData = data.crush();
    searchService.addDocumentsToSearchObjects(flattenedData);
  }, function(error) {
    console.log(error);
  });
});

app.factory('searchService', function() {
  var searchOnValue = new JsSearch.Search('Text_value');
  var searchOnType = new JsSearch.Search('Text_type');
  var searchIndeces = ['KAA_type', 'KAA_value', 'Text_type', 'Text_value'];
  searchIndeces.forEach(function(index) {
    searchOnValue.addIndex(index);
    searchOnType.addIndex(index);
  });

  function combineSearchResults(resultsList) {
    var combinedArray;
    resultsList.forEach(function(resultsSet, index) {
      if (!index) {
        combinedArray = resultsList[index];
      } else {
        resultsList[index].forEach(function(result) {
          if (combinedArray.indexOf(result) === -1) {
            combinedArray.push(result);
          }
        });
      }
    });
    return combinedArray;
  }

  var service = {};

  service.addDocumentsToSearchObjects = function(flattenedData) {
    searchOnValue.addDocuments(flattenedData);
    searchOnType.addDocuments(flattenedData);
  };

  service.runSearch = function(searchString) {
    var searchResultsByValue = searchOnValue.search(searchString);
    var searchResultsByType = searchOnType.search(searchString);
    return combineSearchResults([searchResultsByValue, searchResultsByType]);
  };

  return service;
});

app.factory('dataService', function($http) {
  var service = {};

  var dataUrl = 'http://kenchreai.org/reasoner/kenchreai/query?query=PREFIX%20rdfs%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%0APREFIX%20kaaont%3A%20%3Chttp%3A%2F%2Fkenchreai.org%2Fkaa%2Fontology%2F%3E%0ASELECT%20%3FKAA%20%3FText%20WHERE%20%7B%0A%20%20%7B%20%3FKAA%20kaaont%3Akaa-any-string%20%3FText%20.%20%7D%0A%20%20UNION%0A%20%20%7B%20%3FKAA%20rdfs%3Alabel%20%3FText%20%7D%0A%7D%20%0A';

  service.getAllData = function() {
    return $http.get(dataUrl);
  };

  return service;
});

app.filter('pluralize', function() {
  return function(input, word) {
    if (input === undefined) input = 0;
    return input === 1 ? input + ' ' + word : input + ' ' + word + 's';
  };
});
