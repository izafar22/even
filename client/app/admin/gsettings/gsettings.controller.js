(function(){
  'use strict';

angular.module('admin').controller('GSettingCtrl', GSettingCtrl);

//Controller function
function GSettingCtrl($scope,LocationSvc,SubCategorySvc, Modal, InvitationMasterSvc) {
    var vm = this;
    vm.tabValue = 'sc';
   
    vm.subCategory = {};
    vm.subCatEdit = false;
    vm.saveSubCategory = saveSubCategory;
    vm.updateSubCategory = updateSubCategory;
    vm.subCategoryEditClick = subCategoryEditClick;
    vm.deleteSubCategory = deleteSubCategory;

    vm.state = {};
    vm.stateEdit = false;
    vm.saveState = saveState;
    vm.updateState = updateState;
    vm.stateEditClick = stateEditClick;
    vm.deleteState = deleteState;

    vm.location = {};
    vm.locationEdit = false;
    vm.saveLocation = saveLocation;
    vm.updateLocation = updateLocation;
    vm.locationEditClick = locationEditClick;
    vm.deleteLocation = deleteLocation;

    vm.invSetting = {};
    vm.saveInvitationSetting = saveInvitationSetting;
    vm.getInvitationMasterData = getInvitationMasterData;

    function loadAllState(){
    	LocationSvc.getAllState()
    	.then(function(result){
    		vm.stateList = result;
    	})
    }

    function loadAllLocation(){
    	LocationSvc.getAllLocation()
    	.then(function(result){
    		vm.locationList = result;
    	})
    }
    function loadAllSubcategory(){
    	SubCategorySvc.getAllSubCategory()
    	.then(function(result){
    		vm.subCategoryList = result;
    	})
    }

    loadAllState();
    loadAllLocation();
    loadAllSubcategory();

    //subcategory functions
    function saveSubCategory(form){
		if(form.$invalid){
			$scope.submitted = true;
			return;
		}
		SubCategorySvc.saveSubCategory(vm.subCategory)
		.then(function(result){
			 vm.subCategory = {};
			 loadAllSubcategory();
		})
    }
 	
 	function updateSubCategory(form){
		if(form.$invalid){
			$scope.submitted = true;
			return;
		}
		SubCategorySvc.updateSubCategory(vm.subCategory)
		.then(function(result){
			 vm.subCategory = {};
			 vm.subCatEdit = false;
			 loadAllSubcategory();
		})
    }

    function subCategoryEditClick(idx){
		vm.subCategory = vm.subCategoryList[idx];
    	vm.subCatEdit = true;
    }
 	
 	function deleteSubCategory(idx){
 		Modal.confirm("Are you sure want to delete?",function(ret){
 			if(ret == "yes")
 				submitDeleteSubCategory(idx);
	 	});
		
    }

    function submitDeleteSubCategory(idx){
    	SubCategorySvc.deleteSubCategory(vm.subCategoryList[idx])
		.then(function(result){
			 loadAllSubcategory();
		})
    }

    //state functions
	function saveState(form){
		if(form.$invalid){
			$scope.submitted = true;
			return;
		}
		LocationSvc.saveState(vm.state)
		.then(function(result){
			 vm.state = {};
			 loadAllState();
		})
    }
 	
 	function updateState(form){
		if(form.$invalid){
			$scope.submitted = true;
			return;
		}
		LocationSvc.updateState(vm.state)
		.then(function(result){
			 vm.state = {};
			 vm.stateEdit = false;
			 loadAllState();
		})
    }

    function stateEditClick(idx){
		vm.state = vm.stateList[idx];
    	vm.stateEdit = true;
    }
 	
 	function deleteState(idx){
 		Modal.confirm("Are you sure want to delete?",function(ret){
 			if(ret == "yes")
 				submitDeleteState(idx);
 		});
 	}

 	function submitDeleteState(idx){
		LocationSvc.deleteState(vm.stateList[idx])
		.then(function(result){
			if(!result.errorCode)
			 	loadAllState();
			 else
			 	Modal.alert(result.message,true);
		})
		.catch(function(res){
			//error handling
		})
    }


    //location functions
	function saveLocation(form){
		if(form.$invalid){
			$scope.submitted = true;
			return;
		}
		LocationSvc.saveLocation(vm.location)
		.then(function(result){
			 vm.location = {};
			 loadAllLocation();
		})
    }
 	
 	function updateLocation(form){
		if(form.$invalid){
			$scope.submitted = true;
			return;
		}
		LocationSvc.updateLocation(vm.location)
		.then(function(result){
			 vm.location = {};
			 vm.locationEdit = false;
			 loadAllLocation();
		})
    }

    function locationEditClick(idx){
		vm.location = vm.locationList[idx];
    	vm.locationEdit = true;
    }
 	
 	function deleteLocation(idx){
 		Modal.confirm("Are you sure want to delete?",function(ret){
 			if(ret == "yes")
 				submitDeleteLocation(idx);
 		});
 	}

 	function submitDeleteLocation(idx){
		LocationSvc.deleteLocation(vm.locationList[idx])
		.then(function(result){
			 loadAllLocation();
		})
    }

// Invitation Setting
	function saveInvitationSetting(form){
		if(form.$invalid){
			$scope.submitted = true;
			return;
		}
		vm.invSetting.key = UPDATE_INVITATION_MASTER;
		InvitationMasterSvc.upsert(vm.invSetting)
		.then(function(result){
			Modal.alert("Update Master",true);
		})
    }

    function getInvitationMasterData(){
    InvitationMasterSvc.getInvitationData(UPDATE_INVITATION_MASTER)
    .then(function(res){
         vm.invSetting = res;
         vm.invSetting.sDate = moment(vm.invSetting.sDate).toDate();
         vm.invSetting.eDate = moment(vm.invSetting.eDate).toDate();
      })
      .catch(function(stRes){
      })
  	}

  getInvitationMasterData();
//date picker
	$scope.today = function() {
	vm.sDate = new Date();
	};
	$scope.today();

	$scope.clear = function() {
	vm.sDate = null;
	};

	$scope.toggleMin = function() {
	$scope.minDate = $scope.minDate ? null : new Date();
	};

	$scope.toggleMin();
	/*$scope.maxDate = new Date(2020, 5, 22);
	$scope.minDate = new Date();*/

	/*$scope.setDate = function(year, month, day) {
	vm.sDate = new Date(year, month, day);
	};*/

	$scope.dateOptions = {
	formatYear: 'yy',
	startingDay: 1
	};

	$scope.formats = ['dd/MM/yyyy', 'dd.MM.yyyy', 'shortDate'];
	$scope.format = $scope.formats[0];

	$scope.open1 = function() {
	$scope.popup1.opened = true;
	};

	$scope.popup1 = {
	opened: false
	};

  	$scope.open2 = function() {
    $scope.popup2.opened = true;
    };

    $scope.popup2 = {
    opened: false
    };
}
    
})();



  
