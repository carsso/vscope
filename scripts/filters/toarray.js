(function() {
    'use strict';
    angular
		.module('app')
		.filter('toArray', toArray);

		function toArray() {
            return function(obj) {
                const result = [];
                angular.forEach(obj, function(val) {
                    result.push(val);
                });
                return result;
            }
		}
})();
