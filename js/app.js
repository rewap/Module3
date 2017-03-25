(function() {
  'use strict';

  angular.module('NarrowItDownApp',[])
  .controller('NarrowItDownController',NarrowItDownController)
  .service('MenuSearchService',MenuSearchService)
  .directive('foundItems',FoundItems);

  function FoundItems() {
    var ddo = {
      restrict : 'E',
      templateUrl : 'menuItems.html',
      scope : {
        items : "<",
        onRemove: '&'
      }
    };
    return ddo;
  }

  NarrowItDownController.$inject=['MenuSearchService']
  function NarrowItDownController(MenuSearchService) {//START NarrowItDownController
    var narrowItDown = this;
    narrowItDown.display = false;
    narrowItDown.found = "";
    narrowItDown.getMatchedMenuItems = function () {
      var promise = MenuSearchService.getMatchedMenuItems(narrowItDown.searchItem);
      promise.then(function (result) {
        narrowItDown.found = result;
        // console.log(narrowItDown.searchItem);
        if(narrowItDown.searchItem === undefined  || narrowItDown.searchItem == "" ||
          narrowItDown.found.length < 1){
          narrowItDown.found = "";
          narrowItDown.display = true;
        }
        else{
          narrowItDown.display = false;
        }
      })
      .catch(function () {
        console.log("Some problem");
      });
    };

    narrowItDown.removeItem = function (index) {
      MenuSearchService.removeItem(index);
    };

    narrowItDown.getItems = MenuSearchService.getItems();

  };//END NarrowItDownController

  MenuSearchService.$inject = ['$http']
  function MenuSearchService($http) {//START MenuSearchService
    var service = this;
    var items = [];
    /*--getMatchedMenuItems--*/
    service.getMatchedMenuItems = function (searchTerm) {
       var result =  service.getMenuItems()
                    .then(function (result) {
                        var found =[];
                        var menu_items = result.data.menu_items;
                        for (var i = 0; i < menu_items.length; i++) {
                          if(service.checkSearchTermInDescription(searchTerm,menu_items[i].description)){
                            found.push(menu_items[i]);
                          }
                        }
                        items = found;
                        return found;
                      })
                      .catch(function () {
                          //  console.log("Some problem");
                      });
      return result;
    };

    /*--getMenuItems--*/
    service.getMenuItems = function () {
      var result =$http({
        method : 'GET',
        url : 'https://davids-restaurant.herokuapp.com/menu_items.json'
      });
      return result;
    }

    /*--checkSearchTermInDescription--*/
    service.checkSearchTermInDescription=function (searchTerm,description) {
      if ( description.toLowerCase().indexOf(searchTerm.toLowerCase())===-1) {
        return false;
      }
      return true;
    };

    /*--removeItem--*/
    service.removeItem = function (index) {
      items.splice(index,1);
    };
    /*--getItems--*/
    service.getItems = function () {
      return items;
    };

  };//END MenuSearchService

  })();
