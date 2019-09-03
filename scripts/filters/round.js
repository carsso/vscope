(function() {
    'use strict';
    angular
        .module('app')
        .filter('round', function() {
            return function(value, maxDecimals) {
                return (value || 0)
                    .toFixed(maxDecimals)
                    .replace(/(?:\.0+|(\.\d+?)0+)$/, "$1");
            }
        });
})();
