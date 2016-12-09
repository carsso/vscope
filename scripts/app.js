/**
 * @ngdoc overview
 * @name app
 * @description
 * # app
 *
 * Main module of the application.
 */
(function() {
    'use strict';
    angular
      .module('app', [
        'ngAnimate',
        'ngResource',
        'ngSanitize',
        'ngTouch',
        'ngStorage',
        'ngStore',
        'ngCookies',
        'ui.router',
        'ui.utils',
        'ui.load',
        'ui.jp',
        'angular-md5',
        'oc.lazyLoad'
      ]);
})();
