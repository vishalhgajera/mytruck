// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
App = angular.module('hitracker', ['ionic','hitracker.controllers'])

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
