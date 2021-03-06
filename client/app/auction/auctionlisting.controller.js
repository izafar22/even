(function() {
  'use strict';
  angular.module('sreizaoApp').controller('AuctionListingCtrl', AuctionListingCtrl);

  function AuctionListingCtrl($scope, Modal, Auth, AuctionSvc, UtilSvc) {
    var vm = this;
    vm.auctions = [];
    vm.master = false;

    //pagination variables
    var prevPage = 0;
    vm.itemsPerPage = 50;
    vm.currentPage = 1;
    vm.totalItems = 0;
    vm.maxSize = 6;
    var first_id = null;
    var last_id = null;
    vm.searchStr = "";
    vm.auctionListing = [];

    vm.fireCommand = fireCommand;

    $scope.auctionStatuses = auctionStatuses;
    $scope.valuationStatuses = valuationStatuses;
    vm.updateSelection = updateSelection;
    vm.exportExcel = exportExcel;
    vm.updateStatus = updateStatus;
    var selectedIds = [];

    var initFilter = {};

    function init() {
      Auth.isLoggedInAsync(function(loggedIn) {
        if (loggedIn) {
          var filter = {};
          if (!Auth.isAdmin())
            initFilter['userId'] = Auth.getCurrentUser()._id;

           
          angular.copy(initFilter, filter);
            
          getAuctions(filter);
        }
      })
    }

    init();

    function getAuctions(filter) {
      console.log(filter);
      filter.pagination = true;
      filter.prevPage = prevPage;
      filter.currentPage = vm.currentPage;
      filter.first_id = first_id;
      filter.last_id = last_id;
      filter.itemsPerPage = vm.itemsPerPage;

      AuctionSvc.getOnFilter(filter)
        .then(function(result) {
          vm.auctions = result.items;
          vm.totalItems = result.totalItems;
          prevPage = vm.currentPage;
          if (result.items.length > 0) {
            first_id = result.items[0]._id;
            last_id = result.items[result.items.length - 1]._id;
          }
        })

    }

    function fireCommand(reset) {
      if (reset)
        resetPagination();
      var filter = {};
      angular.copy(initFilter, filter);
      if (vm.searchStr)
        filter['searchStr'] = vm.searchStr;
      getAuctions(filter);
    }

    function resetPagination() {
      prevPage = 0;
      vm.currentPage = 1;
      vm.totalItems = 0;
      first_id = null;
      last_id = null;
    }

    function exportExcel() {
      var dataToSend = {};
      if (Auth.getCurrentUser()._id && Auth.getCurrentUser().role != 'admin')
        dataToSend["userid"] = Auth.getCurrentUser()._id;
      if (!vm.master && selectedIds.length == 0) {
        Modal.alert("Please select auction to export.");
        return;
      }
      if (!vm.master)
        dataToSend['ids'] = selectedIds;
      AuctionSvc.export(dataToSend)
        .then(function(buffData) {
          saveAs(new Blob([s2ab(buffData)], {
            type: "application/octet-stream"
          }), "auctions_" + new Date().getTime() + ".xlsx")
        });
    }

    function updateSelection(event, id) {
      if (vm.master)
        vm.master = false;
      var checkbox = event.target;
      var action = checkbox.checked ? 'add' : 'remove';
      if (action == 'add' && selectedIds.indexOf(id) == -1)
        selectedIds.push(id)
      if (action == 'remove' && selectedIds.indexOf(id) != -1)
        selectedIds.splice(selectedIds.indexOf(id), 1);
    }

    function updateStatus(auctionReq, status) {
      if (!status)
        return;
      AuctionSvc.updateStatus(auctionReq, status)
        .then(function(result) {
          AuctionSvc.sendNotification(auctionReq, UtilSvc.getStatusOnCode(auctionStatuses, status).notificationText, 2);
        });
    }
  }

  angular.module('sreizaoApp').controller('AuctionDateCtrl', AuctionDateCtrl);

  function AuctionDateCtrl($scope, Modal, Auth, AuctionSvc, UtilSvc) {
   
    var vm = this;
    //vm.class = "active";

    //pagination variables

    var AuctionState='';
    console.log(vm.action);
    var prevPage = 0;
    vm.itemsPerPage = 5;
    vm.currentPage = 1;
    vm.maxSize = 6;
    var first_id = null;
    var last_id = null;
    var listingCount = {};
    vm.totalItemsInAuction = 0
    vm.totalItemsSold = 0;
    vm.totalSaleValue = 0;

    vm.auctionListing = [];
    $scope.closeAuctionItems = 0;
    $scope.openAuctionItems = 0;
    vm.openMap = openMap;

    vm.fireCommand = fireCommand;


    var initFilter = {};

    function init() {
      vm.AuctionState = 'closedAuctions';
      
          var filter = {};
           console.log(initFilter);
          angular.copy(initFilter, filter);

          console.log(filter);
          filter.auctionType = 'closedAuctions';

          getAuctions(filter);
        }

    init();


    function fireCommand(auctionType) {
      console.log('fire');
      if (!auctionType) {
        var filter = {};
        angular.copy(initFilter, filter);
        filter.auctionType=AuctionState;
        vm.AuctionState = AuctionState;
        return getAuctions(filter);
      } else {
        if (auctionType == 'openAuctions') {
          resetPagination();
          var filter = {};
          AuctionState='openAuctions';
          vm.AuctionState = AuctionState;
          angular.copy(initFilter, filter);
          filter.auctionType = AuctionState;
          return getAuctions(filter);
        }
        if (auctionType == 'closedAuctions') {
          resetPagination();
          var filter = {};
          AuctionState='closedAuctions';
          vm.AuctionState = AuctionState;
          angular.copy(initFilter, filter);
          filter.auctionType = AuctionState;
          return getAuctions(filter);
        }

        if (auctionType == 'ongoingAuctions') {
          resetPagination();
          var filter = {};
          AuctionState='ongoingAuctions';
          vm.AuctionState = AuctionState;
          angular.copy(initFilter, filter);
          filter.auctionType = AuctionState;
          return getAuctions(filter);
        }

      }

    }


    function resetPagination() {
      prevPage = 0;
      vm.currentPage = 1;
      vm.totalItems = 0;
      first_id = null;
      last_id = null;
    }

    function getAuctions(filter) {
      var arr=[];
      filter.prevPage = prevPage;
      filter.currentPage = vm.currentPage;
      filter.first_id = first_id;
      filter.last_id = last_id;
      filter.itemsPerPage = vm.itemsPerPage;

      if (vm.auctionListing.length > 0) {
       if (vm.currentPage > prevPage) {
          filter.first_id = null;
          filter.last_id = vm.auctionListing[vm.auctionListing.length - 1]._id;
          filter.offset = ((vm.currentPage - prevPage) * vm.itemsPerPage) - vm.itemsPerPage;
        }
       else {
        filter.first_id = vm.auctionListing[0]._id;
        filter.last_id = null;
        filter.offset = ((vm.currentPage - prevPage) * vm.itemsPerPage) + vm.itemsPerPage;
        }
      }

      if(prevPage != vm.currentPage){
        AuctionSvc.getTotalItemsCount(filter.auctionType)
        .then(function(result) {
          vm.totalItems = result.data;
          AuctionState='closedAuctions';
          return AuctionSvc.getAuctionData(filter);
        })
        .then(function(auctionDateData) {
          auctionDateData.forEach(function(x) {
            arr.push(x.auctionId);
            /*x.itemCount = listingCount[x.auctionId] && listingCount[x.auctionId].count;
            x.inSaleValue = listingCount[x.auctionId] && listingCount[x.auctionId].totalSaleValue;
            x.inSold=listingCount[x.auctionId] && listingCount[x.auctionId].inSold;*/
          })
          var filter={};
        
          
          //vm.auctionListing = auctionDateData;
          //prevPage = vm.currentPage;
        
          return AuctionSvc.getTotalAuctionItemsCount({'data':arr});
        })
          .then(function(itemCount) {
          itemCount.data.forEach(function(x) {
            listingCount[x._id] = {
              count: x.count,
              totalSaleValue: x.sumOfInsale,
               inSold:x.isSoldCount
            }
          });
          console.log(listingCount);
        
      })
      
     }
   }

    function openMap(city, loc,$scope) {
      /*AuctionSvc.getLatLong(city, loc).then(function(result) */
        Modal.openMap(loc,$scope);
      /*catch(function(err) {
        Modal.alert(err)
      })*/
    }


  }

  angular.module('sreizaoApp').controller('AuctionDetailCtrl', AuctionDetailCtrl);

  function AuctionDetailCtrl($scope, Modal, Auth, AuctionSvc, UtilSvc, $location) {
    var vm = this;

    var query = $location.search();

    //pagination variables

    vm.totalItems = 0;
    vm.auctionDetailListing = [];
    $scope.totalItems = 0;


    var initFilter = {};

    function init() {
    var filter = {};
    angular.copy(initFilter, filter);
    filter.itemsPerPage = vm.itemsPerPage;
    filter.auctionId = query.auctionId;
    getAuctions(filter);
        
      
    }

    init();



    function getAuctions(filter) {

      if ($scope.totalItems) {
        AuctionSvc.getAuctionItemData(filter)
          .then(function(result) {
            vm.auctionDetailListing = result;
            vm.totalItems = $scope.totalItems;
          });
      } else {
        AuctionSvc.getTotalAuctionItemsCount(filter.auctionId)
          .then(function(result) {
            vm.totalItems = result.data;

            $scope.totalItems = vm.totalItems;

            return AuctionSvc.getAuctionItemData(filter);
          })
          .then(function(result) {
            vm.auctionDetailListing = result;
          })
      }
    }



  }



})();