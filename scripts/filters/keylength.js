(function() {
    'use strict';
    angular
		.module('app')
		.filter('keylength', keylength);

		function keylength() {
            return function(input){
                if(!angular.isObject(input)){
                    throw Error("Usage of non-objects with keylength filter!!")
                }
                return Object.keys(input).length;
            }
		}
})();
