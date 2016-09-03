/**
 * @ngdoc function
 * @name app.controller:AppCtrl
 * @description
 * # MainCtrl
 * Controller of the app
 */

(function() {
    'use strict';
    angular
      .module('app')
      .controller('DcCtrl', DcCtrl)
      .controller('RootCtrl',RootCtrl )
      .controller('LogoutCtrl', LogoutCtrl);

      RootCtrl.$inject  = ['$scope', '$rootScope'];
      function RootCtrl($scope, $rootScope) {
          $rootScope.me = {};
          $rootScope.pccs = {};
      }

      LogoutCtrl.$inject  = ['$window'];
      function LogoutCtrl($window) {
          $window.location = '/ovhapi/logout';
      }
      
      
      DcCtrl.$inject  = ['$scope', '$localStorage', '$location', '$rootScope', '$stateParams', '$anchorScroll', '$timeout', '$window', '$http'];
      function DcCtrl($scope, $localStorage, $location, $rootScope, $stateParams, $anchorScroll, $timeout, $window, $http) {
        var vm = $scope;
        vm.colors = {
            primary: 'primary',
            accent: 'accent',
            warn: 'warn'
        };
        vm.pccName = $stateParams.pccName;
        vm.datacenterId = $stateParams.datacenterId;
        vm.hosts = [];
        vm.datastores = [];
        vm.virtualmachines = [];
       
        vm.serviceDescription = function(commercialRange) {
            var serviceDescription = 'Private Cloud ???';
            if(/^2016v\dInfrastructure$/.test(commercialRange)) {
                serviceDescription = 'Private Cloud : SDDC';
            } else if(/^2016v\dEnterprise$/.test(commercialRange)) {
                serviceDescription = 'Private Cloud : Dedicated Cloud';
            } else if(/^2014v\dInfrastructure$/.test(commercialRange)) {
                serviceDescription = 'Dedicated Cloud : Infrastructure';
            } else if(/^2014v\dEnterprise$/.test(commercialRange)) {
                serviceDescription = 'Dedicated Cloud : Enterprise';
            } else if(/^2013v\d$/.test(commercialRange)) {
                serviceDescription = 'Dedicated Cloud';
            }

            if(/^2016v2/.test(commercialRange)) {
                serviceDescription += ' (with NSX)';
            } else if(/^2016v3/.test(commercialRange)) {
                serviceDescription += ' (with vROps)';
            } else if(/^2016v4/.test(commercialRange)) {
                serviceDescription += ' (with NSX and vROps)';
            }

            return serviceDescription;
        }

        function loadMe() {
            $http.get('/ovhapi/me').success(function(me) {
                $rootScope.me = me;
            });
        }
        function loadPccs() {
            $http.get('/ovhapi/dedicatedCloud').success(function(pccNames) {
                for (var i = 0; i < pccNames.length; i++) {
                    var pccName = pccNames[i];
                    $rootScope.pccs[pccName] = {};
                    loadPcc(pccName);
                }
            });
        }
        function loadPcc(pccName) {
            $http.get('/ovhapi/dedicatedCloud/'+pccName).success(function(pcc) {
                $rootScope.pccs[pccName] = pcc;
                $rootScope.pccs[pccName]['datacenters'] = {};
                loadDatacenters(pccName);
            });
        }

        function loadDatacenters(pccName) {
            $http.get('/ovhapi/dedicatedCloud/'+pccName+'/datacenter').success(function(datacenterIds) {
                $rootScope.pccs[pccName]['datacenters'] = {};
                for (var i = 0; i < datacenterIds.length; i++) {
                    var datacenterId = datacenterIds[i];
                    $rootScope.pccs[pccName]['datacenters'][datacenterId] = {};
                }
                $http.get('/ovhapi/dedicatedCloud/'+pccName+'/datacenter/'+datacenterIds.join(','), {headers:{'X-OVH-BATCH':','}}).success(function(datacenters) {
                    for (var i = 0; i < datacenters.length; i++) {
                        var datacenter = datacenters[i];
                        $rootScope.pccs[pccName]['datacenters'][datacenter.value.datacenterId] = datacenter.value;
                    }
                });

            });
        }

        function loadHosts(pccName, datacenterId) {
            $http.get('/ovhapi/dedicatedCloud/'+pccName+'/datacenter/'+datacenterId+'/host').success(function(hostIds) {
                $http.get('/ovhapi/dedicatedCloud/'+pccName+'/datacenter/'+datacenterId+'/host/'+hostIds.join(','), {headers:{'X-OVH-BATCH':','}}).success(function(hosts) {
                    for (var i = 0; i < hosts.length; i++) {
                        var host = hosts[i];
                        vm.hosts.push(host.value);
                    }
                });
            });
        }

        function loadDatastores(pccName, datacenterId) {
            $http.get('/ovhapi/dedicatedCloud/'+pccName+'/datacenter/'+datacenterId+'/filer').success(function(datastoreIds) {
                $http.get('/ovhapi/dedicatedCloud/'+pccName+'/datacenter/'+datacenterId+'/filer/'+datastoreIds.join(','), {headers:{'X-OVH-BATCH':','}}).success(function(datastores) {
                    for (var i = 0; i < datastores.length; i++) {
                        var datastore = datastores[i];
                        vm.datastores.push(datastore.value);
                    }
                });
            });
            $http.get('/ovhapi/dedicatedCloud/'+pccName+'/filer').success(function(datastoreIds) {
                $http.get('/ovhapi/dedicatedCloud/'+pccName+'/filer/'+datastoreIds.join(','), {headers:{'X-OVH-BATCH':','}}).success(function(datastores) {
                    for (var i = 0; i < datastores.length; i++) {
                        var datastore = datastores[i];
                        vm.datastores.push(datastore.value);
                    }
                });
            });
        }

        function loadVirtualMachines(pccName, datacenterId) {
            $http.get('/ovhapi/dedicatedCloud/'+pccName+'/datacenter/'+datacenterId+'/vm').success(function(virtualmachineIds) {
                $http.get('/ovhapi/dedicatedCloud/'+pccName+'/datacenter/'+datacenterId+'/vm/'+virtualmachineIds.join(','), {headers:{'X-OVH-BATCH':','}}).success(function(virtualmachines) {
                    for (var i = 0; i < virtualmachines.length; i++) {
                        var virtualmachine = virtualmachines[i];
                        vm.virtualmachines.push(virtualmachine.value);
                    }
                });
            });
        }

        function initialize() {
            loadMe();
            if(vm.pccName) {
                loadPcc(vm.pccName);
                if(vm.datacenterId) {
                    loadHosts(vm.pccName, vm.datacenterId);
                    loadDatastores(vm.pccName, vm.datacenterId);
                    loadVirtualMachines(vm.pccName, vm.datacenterId);
                }
            } else {
                loadPccs();
            }
        }
        initialize();

        vm.getHostStateClass = function(host) {
            var resultClass = 'dker';
            if(host.connectionState) {
                if(host.connectionState == 'connected') {
                    if(host.inMaintenance) {
                        resultClass = 'warn';
                    } else {
                        resultClass = 'success';
                    }
                } else if(host.connectionState == 'disconnected') {
                    resultClass = 'warning';
                } else {
                    resultClass = 'danger';
                }
            }
            return resultClass;
        }

        vm.getVirtualMachineFtClass = function(virtualmachine) {
            var resultClass = 'dker';
            if(virtualmachine.stateFt) {
                if(virtualmachine.stateFt == 'running') {
                    resultClass = 'success';
                } else if(virtualmachine.stateFt == 'enabled') {
                    resultClass = 'primary';
                } else if(virtualmachine.stateFt == 'starting') {
                    resultClass = 'info';
                } else if(virtualmachine.stateFt == 'needSecondary') {
                    resultClass = 'warn';
                } else if(virtualmachine.stateFt == 'disabled') {
                    resultClass = 'dark';
                }
            }
            return resultClass;
        }

        vm.getVirtualMachineStateClass = function(virtualmachine) {
            var resultClass = 'dker';
            if(virtualmachine.powerState) {
                if(virtualmachine.powerState == 'poweredOn') {
                    resultClass = 'success';
                } else if(virtualmachine.powerState == 'suspended') {
                    resultClass = 'warn';
                } else {
                    resultClass = 'danger';
                }
            }
            return resultClass;
        }

      }
})();
