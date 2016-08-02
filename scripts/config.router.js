/**
 * @ngdoc function
 * @name app.config:uiRouter
 * @description
 * # Config
 * Config for the router
 */
(function() {
    'use strict';
    angular
        .module('app')
        .run(runBlock)
        .config(config);

    runBlock.$inject = ['$rootScope', '$state', '$stateParams'];
    function runBlock($rootScope,   $state,   $stateParams) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;        
    }

    config.$inject =  ['$stateProvider', '$urlRouterProvider', '$locationProvider', 'MODULE_CONFIG'];
    function config( $stateProvider, $urlRouterProvider, $locationProvider, MODULE_CONFIG ) {
        $locationProvider.html5Mode(true)
        $urlRouterProvider.otherwise('/');
        $stateProvider.state('homepage', {
            url: '/',
            templateUrl: 'views/login.html',
        })
        .state('pcc', {
            url: '/pcc',
            templateUrl: 'views/dashboard.html',
            controller: 'DcCtrl' 
        })
        .state('pccDc', {
            url: '/pcc/{pccName:string}/datacenter/{datacenterId:int}',
            templateUrl: 'views/dashboard.html',
            controller: 'DcCtrl' 
        })
        .state('logout', {
            url: '/logout',
            templateUrl: 'views/dashboard.html',
            controller: 'LogoutCtrl' 
        });

        function load(srcs, callback) {
            return {
                deps: ['$ocLazyLoad', '$q',
                function( $ocLazyLoad, $q ){
                    var deferred = $q.defer();
                    var promise  = false;
                    srcs = angular.isArray(srcs) ? srcs : srcs.split(/\s+/);
                    if(!promise){
                        promise = deferred.promise;
                    }
                    angular.forEach(srcs, function(src) {
                        promise = promise.then( function(){
                            angular.forEach(MODULE_CONFIG, function(module) {
                                if( module.name == src){
                                    src = module.module ? module.name : module.files;
                                }
                            });
                            return $ocLazyLoad.load(src);
                        } );
                    });
                    deferred.resolve();
                    return callback ? promise.then(function(){ return callback(); }) : promise;
                }]
            }
        }

        function getParams(name) {
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
            return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        }
    }
})();
