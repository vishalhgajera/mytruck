// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
App = angular.module('hitracker', ['ionic'])

.run(function ($ionicPlatform, $rootScope, $state) {
    $ionicPlatform.ready(function () {
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }

        Parse.initialize('CuUXRAQT28wzTFaqAhuN3CDZv2MJj2C6pAxZRUsK', 'DpbS9VgxJ4G0gpmzbZudxyCXlBaYH0LKOkEDXY9v');
        var currentUser = Parse.User.current();
        $rootScope.user = null;
        $rootScope.isLoggedIn = false;

        if (currentUser) {
            $rootScope.user = currentUser;
            $rootScope.isLoggedIn = true;
            if (currentUser.attributes.type == "trucker") {
                $state.go('app.truck');
            } else {
                $state.go('app.truck');
            }
        }

    });
})


App.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/auth/walkthrough");

    $stateProvider.state("auth", {
        url: "/auth",
        templateUrl: "views/auth.html",
        "abstract": true,
    }).state("auth.walkthrough", {
        url: "/walkthrough",
        templateUrl: "views/walkthrough.html"
    }).state("auth.login", {
        url: "/login",
        templateUrl: "views/login.html",
        controller: "LoginCtrl"
    }).state("auth.signup", {
        url: "/signup",
        templateUrl: "views/form.html",
        // controller: "SignupCtrl"
    }).state("app", {
        url: "/app",
        "abstract": true,
        cache: false,
        templateUrl: "views/side-menu.html",
        controller: "AppCtrl"
    }).state("app.truck", {
        url: "/page/truck",
        views: {
            menuContent: {
                templateUrl: "views/trucklist.html",
                controller: "truckCtrl"
            }
        }
    }).state("app.truckdetail", {
        url: "/page/truck/:Id",
        views: {
            menuContent: {
                templateUrl: "views/truckdetail.html",
                controller: "truckdetailCtrl"
            }
        }
    }).state("app.trip", {
        url: "/page/trip",
        views: {
            menuContent: {
                templateUrl: "views/triplist.html",
                controller: "tripCtrl"
            }
        }
    }).state("app.tripdetail", {
        url: "/page/trip/:Id",
        views: {
            menuContent: {
                templateUrl: "views/tripdetail.html",
                controller: "tripdetailCtrl"
            }
        }
    })

});


App.controller('AppCtrl', function ($scope, $state, $ionicLoading, $rootScope) {
    $scope.username = $rootScope.user.attributes.username;
    $scope.usertype = $rootScope.user.attributes.type;
    $scope.logout = function () {
        Parse.User.logOut();
        $rootScope.user = null;
        $rootScope.isLoggedIn = false;
        $state.go('auth.login', {
            clear: true
        });
    }

});


App.controller('LoginCtrl', function ($scope, $state, $ionicLoading, $rootScope) {
    scope = $scope
    $scope.error = new Object();
    $scope.user = {
        name: '',
        password: ''
    };
 
    $scope.signIn = function (form) {
        if (form.$valid) {
            $ionicLoading.show()
            Parse.User.logIn(($scope.user.name).toLowerCase(), $scope.user.password, {
                success: function (user) {
                    $ionicLoading.hide();
                    $rootScope.user = user;
                    $rootScope.isLoggedIn = true;
                    $state.go('app.trip', {
                        clear: true
                    });
                },
                error: function (user, err) {
                    $ionicLoading.hide();
                    console.log(err);

                    if (err.code === 101) {
                        $scope.error.message = 'Invalid login credentials';
                    } else {
                        $scope.error.message = 'An unexpected error has ' +
                            'occurred, please try again.';
                    }
                    $scope.$apply();
                }
            });


        }
    };


})


.controller('truckCtrl', function ($scope, $state, $ionicLoading, $rootScope, $ionicModal, $ionicPopup, $ionicScrollDelegate) {
    scope = $scope;
    root = $rootScope;
    $rootScope.trucks = [];
    $scope.truckfeild = {
        user: $rootScope.user
    };

    var truck = Parse.Object.extend("truck");
    var query = new Parse.Query(truck);
    $scope.doRefresh = function () {
        $rootScope.trucks = [];
        query.find().then(function (results) {
            angular.forEach(results, function (el, index) {
                var obj = el.attributes;
                console.log(obj);
                obj.id = el.id;
                $rootScope.trucks.push(obj);
            });
            console.log($scope.trucks);
            $scope.$apply();
            $scope.$broadcast('scroll.refreshComplete');
        });
    }

    $scope.doRefresh();
    $ionicModal.fromTemplateUrl('views/truckform.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal;
    });
    $rootScope.openModal = function () {
        $scope.modal.show();
    };
    $scope.closeModal = function () {
        $scope.modal.hide();
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function () {
        // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function () {
        // Execute action
    });



    $scope.addTruck = function (form) {
        $ionicScrollDelegate.resize()
        if (form.$valid) {
            var mytruck = new truck();
            mytruck.setACL(new Parse.ACL(Parse.User.current()));
            mytruck.set($scope.truckfeild)
            mytruck.save(null, {
                success: function (truck) {
                    $ionicPopup.alert({
                        title: 'Truck added',
                        template: 'New truck has been added',
                    });
                    $scope.modal.hide();
                    query.get(truck.id, {
                        success: function (truck) {
                            console.log(truck)
                            var newTruck = truck.attributes;
                            newTruck.id = truck.id;
                            console.log(newTruck)
                            $rootScope.trucks.push(newTruck);
                        },
                        error: function (object, error) {
                            $ionicPopup.alert({
                                title: 'Failer to Display',
                                template: 'please refresh the page :  ' + error.message,
                            });
                        }
                    });
                },
                error: function (gameScore, error) {
                    $ionicPopup.alert({
                        title: 'Truck added failer',
                        template: 'Failed to create new object, with error code:  ' + error.message,
                    });
                }
            });
        }
    }

})

.controller('truckdetailCtrl', function ($scope, $state, $ionicLoading, $rootScope, $ionicModal, $filter) {
    scope = $scope;
    $scope.truckId = $state.params.Id;
    $scope.truck = $filter('filter')($rootScope.trucks, {id: $state.params.Id})[0];

})

.controller('tripCtrl', function ($scope, $state, $ionicLoading, $rootScope, $ionicModal, $filter) {
    scope = $scope;
    
    var trip = Parse.Object.extend("Trip");
    var tripQuery = new Parse.Query(trip);
    tp = trip;
    $scope.doRefresh = function () {
        $rootScope.trips = [];
        
        tripQuery.find().then(function (results) {
            console.log(results)
            angular.forEach(results, function (el, index) {
                $rootScope.trips.push(el);
            });
            console.log($scope.trips);
            $scope.$apply();
            $scope.$broadcast('scroll.refreshComplete');
        });
    }
    
    $scope.doRefresh();
    
})


.controller('tripdetailCtrl', function ($scope, $state, $ionicLoading, $rootScope, $ionicModal, $filter,$ionicPopup) {
    scope = $scope;
    root = $rootScope;
    $scope.tripId = $state.params.Id;
    $scope.bidprice = null;
    $scope.trip = $filter('filter')($rootScope.trips, {id: $state.params.Id})[0];
    bid = Parse.Object.extend("bid");
    bidQuery = new Parse.Query(bid);
    
    
    bidQuery.matchesQuery("tripid",$scope.trip);
    bidQuery.matchesQuery("userid",$rootScope.user);
    
    bidQuery.find({
      success: function(results) {
          $scope.bidprice = results[0].attributes.price;
        //alert("Successfully retrieved " + results.length + " scores.");
      },
      error: function(error) {
          $ionicPopup.alert({
             title: 'Bid retriving failer',
            template: 'Failed to create new object, with error code:  ' + error.message,
        });
        
      }
    });
    
    $scope.bidsubmit = function(){
        newbid = new bid();
        newbid.set({tripid:$scope.trip,userid:$rootScope.user,price:$scope.bidAmount});
        newbid.save(null, {
                success: function (truck) {
                    $ionicPopup.alert({
                        title: 'Bid submited',
                        template: 'Bid has been submited',
                    });
                },
                error: function (gameScore, error) {
                    $ionicPopup.alert({
                         title: 'Bid submited failer',
                        template: 'Failed to create new object, with error code:  ' + error.message,
                    });
                }
        });
        console.log($rootScope.user);
        console.log($scope.trip);   
    }
});
