angular.module('hitracker.controllers', [])


.controller('AppCtrl', function ($scope, $state, $ionicLoading, $rootScope) {
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

})

.controller('LoginCtrl', function ($scope, $state, $ionicLoading, $rootScope) {
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
    $scope.truck = $filter('filter')($rootScope.trucks, {
        id: $state.params.Id
    })[0];

})

.controller('tripCtrl', function ($scope, $state, $ionicLoading, $rootScope, $ionicModal, $filter) {
    scope = $scope;

    var trip = Parse.Object.extend("Trip");
    var tripQuery = new Parse.Query(trip);
    $scope.tripField = {}
    
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

    $scope.states = States;
    $scope.cities = Cities;

    $scope.sstate = $scope.estate = $scope.scity = $scope.ecity = "";
    


    $ionicModal.fromTemplateUrl('views/tripform.html', {
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




})


.controller('tripdetailCtrl', function ($scope, $state, $ionicLoading, $rootScope, $ionicModal, $filter, $ionicPopup) {
    scope = $scope;
    root = $rootScope;
    $scope.tripId = $state.params.Id;
    $scope.bidprice = null;
    $scope.biddata = false;
    $scope.trip = $filter('filter')($rootScope.trips, {
        id: $state.params.Id
    })[0];
    bid = Parse.Object.extend("bid");
    bidQuery = new Parse.Query(bid);


    console.log($scope.trip);
    bidQuery.equalTo("tripid", $scope.trip);

    bidQuery.find({
        success: function (results) {
            $scope.biddata = true;
            console.log(results);
            if (results.length > 0) {
                $scope.bidprice = results[0].attributes.price
            }
        },
        error: function (error) {
            $scope.biddata = true;
            $ionicPopup.alert({
                title: 'Bid retriving failer',
                template: 'Failed to create new object, with error code:  ' + error.message,
            });
        }
    });

    $scope.bidsubmit = function () {
        newbid = new bid();
        newbid.setACL(new Parse.ACL(Parse.User.current()));
        newbid.set({
            tripid: $scope.trip,
            userid: $rootScope.user,
            price: $scope.bidAmount
        });
        
        newbid.save(null, {
            success: function (truck) {
                $ionicPopup.alert({
                    title: 'Bid submited',
                    template: 'Bid has been submited',
                });
                $scope.bidprice = $scope.bidAmount;
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


States = ["Gujarat ", "Goa", "Delhi"]
Cities = [
        ["Ahmedabad", "Ahwa", "Amod", "Amreli", "Anand", "Anjar", "Ankaleshwar", "Babra", "Balasinor", "Banaskantha", "Bansada", "Bardoli", "Bareja", "Baroda", "Barwal", "Bayad", "Bhachav", "Bhanvad", "Bharuch", "Bhavnagar", "Bhiloda", "Bhuj", "Billimora", "Borsad", "Botad", "Chanasma", "Chhota Udaipur", "Chotila", "Dabhoi", "Dahod", "Damnagar", "Dang", "Danta", "Dasada", "Dediapada", "Deesa", "Dehgam", "Deodar", "Devgadhbaria", "Dhandhuka", "Dhanera", "Dharampur", "Dhari", "Dholka", "Dhoraji", "Dhrangadhra", "Dhrol", "Dwarka", "Fortsongadh", "Gadhada", "Gandhi Nagar", "Gariadhar", "Godhra", "Gogodar", "Gondal", "Halol", "Halvad", "Harij", "Himatnagar", "Idar", "Jambusar", "Jamjodhpur", "Jamkalyanpur", "Jamnagar", "Jasdan", "Jetpur", "Jhagadia", "Jhalod", "Jodia", "Junagadh", "Junagarh", "Kalawad", "Kalol", "Kapad Wanj", "Keshod", "Khambat", "Khambhalia", "Khavda", "Kheda", "Khedbrahma", "Kheralu", "Kodinar", "Kotdasanghani", "Kunkawav", "Kutch", "Kutchmandvi", "Kutiyana", "Lakhpat", "Lakhtar", "Lalpur", "Limbdi", "Limkheda", "Lunavada", "M.M.Mangrol", "Mahuva", "Malia-Hatina", "Maliya", "Malpur", "Manavadar", "ndvi", "Mangrol", "Mehmedabad", "Mehsana", "Miyagam", "Modasa", "Morvi", "Muli", "Mundra", "Nadiad", "Nakhatrana", "Nalia", "Narmada", "Naswadi", "Navasari", "Nizar", "Okha", "Paddhari", "Padra", "Palanpur", "Palitana", "Panchmahals", "Patan", "Pavijetpur", "Porbandar", "Prantij", "Radhanpur", "Rahpar", "Rajaula", "Rajkot", "Rajpipla", "Ranavav", "Sabarkantha", "Sanand", "Sankheda", "Santalpur", "Santrampur", "Savarkundla", "Savli", "Sayan", "Sayla", "Shehra", "Sidhpur", "Sihor", "Sojitra", "Sumrasar", "Surat", "Surendranagar", "Talaja", "Thara", "Tharad", "Thasra", "Una-Diu", "Upleta", "Vadgam", "Vadodara", "Valia", "Vallabhipur", "Valod", "Valsad", "Vanthali", "Vapi", "Vav", "Veraval", "Vijapur", "Viramgam", "Visavadar", "Visnagar", "Vyara", "Waghodia", "Wankaner"],
["anacona", "Candolim", "Chinchinim", "Cortalim", "Goa", "Jua", "Madgaon", "Mahem", "Mapuca", "Marmagao", "Panji", "Ponda", "Sanvordem", "Terekhol"],
    ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "South Delhi", "South West Delhi", "West Delhi"]
    ]
