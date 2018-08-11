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
        .controller('LogoutCtrl', LogoutCtrl)
        .controller('LoginCtrl', LoginCtrl)
        .controller('AppCtrl', AppCtrl);

    RootCtrl.$inject  = ['$scope', '$rootScope', '$cookies', '$http'];
    function RootCtrl($scope, $rootScope, $cookies, $http) {
        $rootScope.tokenCookies = {
            'AK': '',
            'AS': '',
            'CK': ''
        };
        $rootScope.me = {};
        $rootScope.application = {};
        $rootScope.pccs = {};
        function loadMe() {
            $http.get('/ovhapi/me').success(function(me) {
                $rootScope.me = me;
            });
        }
        function loadApplication() {
            $http.get('/ovhapi/auth/currentCredential').success(function(credential) {
                $http.get('/ovhapi/me/api/credential/'+credential.credentialId+'/application').success(function(application) {
                    $rootScope.application = application;
                });
            });
        }

        function initialize() {
            loadMe();
            loadApplication();
        }
        initialize();
    }

    LogoutCtrl.$inject  = ['$window'];
    function LogoutCtrl($window) {
        $window.location = '/ovhapi/logout';
    }

    AppCtrl.$inject  = ['$scope', '$window', '$rootScope'];
    function AppCtrl($scope, $window, $rootScope) {
    }

    LoginCtrl.$inject  = ['$scope', '$window', '$rootScope', '$cookies'];
    function LoginCtrl($scope, $window, $rootScope, $cookies) {
        $rootScope.tokenCookies = {
            'AK': $cookies.get('applicationKey'),
            'AS': $cookies.get('applicationSecret'),
            'CK': $cookies.get('consumerKey')
        };

        $scope.registeredTokens = {
            'germain-dev-account' : {
                'name': 'DEV Account',
                'description': 'Dev account with a few private clouds',
                'AK': '',
                'AS': '',
                'CK': '8Cze2r6sPmhs0j0C3laTlpwgQMDJtIhx'
            }
        };

        $scope.loginWithRegisteredTokens = function(name) {
            if(!name) {
                return false;
            }
            if(!$scope.registeredTokens[name]) {
                return false;
            }
            $cookies.put('consumerKey', $scope.registeredTokens[name].CK);
            if($scope.registeredTokens[name].AK) {
                $cookies.put('applicationKey', $scope.registeredTokens[name].AK);
            }
            if($scope.registeredTokens[name].AS) {
                $cookies.put('applicationSecret', $scope.registeredTokens[name].AS);
            }
            $window.location = '/pcc';
        }

        $scope.loginWithCk = function() {
            if(!$scope.tokenLogin.CK || $scope.tokenLogin.CK == '') {
                alert('Missing CK !');
                return false;
            }
            $cookies.put('consumerKey', $scope.tokenLogin.CK);
            if($scope.tokenLogin.AK) {
                $cookies.put('applicationKey', $scope.tokenLogin.AK);
            }
            if($scope.tokenLogin.AS) {
                $cookies.put('applicationSecret', $scope.tokenLogin.AS);
            }
            $window.location = '/pcc';
        }
    }

    DcCtrl.$inject  = ['$scope', '$localStorage', '$location', '$rootScope', '$stateParams', '$anchorScroll', '$timeout', '$window', '$http', '$cookies'];
    function DcCtrl($scope, $localStorage, $location, $rootScope, $stateParams, $anchorScroll, $timeout, $window, $http, $cookies) {
        $rootScope.tokenCookies = {
            'AK': $cookies.get('applicationKey'),
            'AS': $cookies.get('applicationSecret'),
            'CK': $cookies.get('consumerKey')
        };
        $scope.colors = {
            primary: 'primary',
            accent: 'accent',
            warn: 'warn'
        };
        $scope.pccName = $stateParams.pccName;
        $scope.datacenterId = $stateParams.datacenterId;
        $scope.hosts = [];
        $scope.datastores = [];
        $scope.virtualmachines = {};

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
                        var datacenter = datacenters[i].value;
                        $rootScope.pccs[pccName]['datacenters'][datacenter.datacenterId] = datacenter;
                    }
                });

            });
        }

        function loadHosts(pccName, datacenterId) {
            $http.get('/ovhapi/dedicatedCloud/'+pccName+'/datacenter/'+datacenterId+'/host').success(function(hostIds) {
                $http.get('/ovhapi/dedicatedCloud/'+pccName+'/datacenter/'+datacenterId+'/host/'+hostIds.join(','), {headers:{'X-OVH-BATCH':','}}).success(function(hosts) {
                    for (var i = 0; i < hosts.length; i++) {
                        var host = hosts[i].value;
                        $scope.hosts.push(host);
                    }
                });
            });
        }

        function loadDatastores(pccName, datacenterId) {
            $http.get('/ovhapi/dedicatedCloud/'+pccName+'/datacenter/'+datacenterId+'/filer').success(function(datastoreIds) {
                $http.get('/ovhapi/dedicatedCloud/'+pccName+'/datacenter/'+datacenterId+'/filer/'+datastoreIds.join(','), {headers:{'X-OVH-BATCH':','}}).success(function(datastores) {
                    for (var i = 0; i < datastores.length; i++) {
                        var datastore = datastores[i].value;
                        datastore['isGlobal'] = false;
                        $scope.datastores.push(datastore);
                    }
                });
            });
            $http.get('/ovhapi/dedicatedCloud/'+pccName+'/filer').success(function(datastoreIds) {
                $http.get('/ovhapi/dedicatedCloud/'+pccName+'/filer/'+datastoreIds.join(','), {headers:{'X-OVH-BATCH':','}}).success(function(datastores) {
                    for (var i = 0; i < datastores.length; i++) {
                        var datastore = datastores[i].value;
                        datastore['isGlobal'] = true;
                        $scope.datastores.push(datastore);
                    }
                });
            });
        }

        function loadVirtualMachines(pccName, datacenterId) {
            $http.get('/ovhapi/dedicatedCloud/'+pccName+'/datacenter/'+datacenterId+'/vm').success(function(virtualmachineIds) {
                $http.get('/ovhapi/dedicatedCloud/'+pccName+'/datacenter/'+datacenterId+'/vm/'+virtualmachineIds.join(','), {headers:{'X-OVH-BATCH':','}}).success(function(virtualmachines) {
                    for (var i = 0; i < virtualmachines.length; i++) {
                        var virtualmachine = virtualmachines[i].value;
                        var vmId = virtualmachine.vmId;
                        $scope.virtualmachines[vmId] = virtualmachine;
                    }
                });
            });
        }

        function initialize() {
            if($scope.pccName) {
                loadPcc($scope.pccName);
                if($scope.datacenterId) {
                    loadHosts($scope.pccName, $scope.datacenterId);
                    loadDatastores($scope.pccName, $scope.datacenterId);
                    loadVirtualMachines($scope.pccName, $scope.datacenterId);
                }
            } else {
                loadPccs();
            }
        }
        initialize();


        $scope.gaugesValues = function(type) {
            var result = {
                'hosts-cpu': {
                    'max': 0,
                    'used': 0,
                    'value': 0
                },
                'hosts-ram': {
                    'max': 0,
                    'used': 0,
                    'value': 0
                },
                    'datastores-usage': {
                        'max': 0,
                        'used': 0,
                        'value': 0
                    },
                    'datastores-provisionned': {
                        'max': 0,
                        'used': 0,
                        'value': 0
                    }
            };

            for (var i = 0; i < $scope.hosts.length; i++) {
                var host = $scope.hosts[i];
                if(host.billingType != 'freeSpare') {
                    result['hosts-cpu']['max'] = result['hosts-cpu']['max'] + (host.cpuMax/1000);
                    result['hosts-cpu']['used'] = result['hosts-cpu']['used'] + (host.cpuUsed/1000);
                    result['hosts-cpu']['value'] = result['hosts-cpu']['used'] * (100 / result['hosts-cpu']['max']);

                    result['hosts-ram']['max'] = result['hosts-ram']['max'] + host.ram.value;
                    result['hosts-ram']['used'] = result['hosts-ram']['used'] + (host.memoryUsed/1024);
                    result['hosts-ram']['value'] = result['hosts-ram']['used'] * (100 / result['hosts-ram']['max']);
                }
            }
            for (var i = 0; i < $scope.datastores.length; i++) {
                var datastore = $scope.datastores[i];
                if(datastore.billingType != 'freeSpare') {
                    result['datastores-usage']['max'] = result['datastores-usage']['max'] + datastore.spaceUsed + datastore.spaceFree;
                    result['datastores-usage']['used'] = result['datastores-usage']['used'] + datastore.spaceUsed;
                    result['datastores-usage']['value'] = result['datastores-usage']['used'] * (100 / result['datastores-usage']['max']);

                    result['datastores-provisionned']['max'] = result['datastores-provisionned']['max'] + datastore.spaceUsed + datastore.spaceFree;
                    result['datastores-provisionned']['used'] = result['datastores-provisionned']['used'] + datastore.spaceProvisionned;
                    result['datastores-provisionned']['value'] = result['datastores-provisionned']['used'] * (100 / result['datastores-provisionned']['max']);
                }
            }

            if(type == 'hosts') {
                type = 'hosts-cpu';
                if(result['hosts-cpu']['value'] < result['hosts-ram']['value']) {
                    type = 'hosts-ram';
                }
            }
            return result[type]['value'];
        }

        $scope.getDatastoreStateClass = function(datastore) {
            var resultClass = 'text-warn';
            if(datastore.state) {
                if(datastore.state == 'delivered') {
                    resultClass = 'text-success';
                } else if(datastore.state == 'adding') {
                    resultClass = 'text-warn';
                } else if(datastore.state == 'removing') {
                    resultClass = 'text-warn';
                } else if(datastore.state == 'error') {
                    resultClass = 'text-danger';
                } else {
                    resultClass = 'text-danger';
                }
            }
            return resultClass;
        }

        $scope.getHostStateClass = function(host) {
            var resultClass = 'text-warn';
            if(host.connectionState) {
                if(host.connectionState == 'connected') {
                    if(host.inMaintenance) {
                        resultClass = 'text-warn';
                    } else {
                        resultClass = 'text-success';
                    }
                } else if(host.connectionState == 'disconnected') {
                    resultClass = 'text-danger';
                } else if(host.connectionState == 'notResponding') {
                    resultClass = 'text-danger';
                } else {
                    resultClass = 'text-danger';
                }
            } else {
                if(host.state) {
                    if(host.state == 'delivered') {
                        resultClass = 'text-success';
                    } else if(host.state == 'adding') {
                        resultClass = 'text-warn';
                    } else if(host.state == 'removing') {
                        resultClass = 'text-warn';
                    } else if(host.state == 'error') {
                        resultClass = 'text-danger';
                    } else {
                        resultClass = 'text-danger';
                    }
                }
            }
            return resultClass;
        }

        $scope.getVirtualMachineFtClass = function(virtualmachine) {
            var resultClass = 'text-warn';
            if(virtualmachine.stateFt) {
                if(virtualmachine.stateFt == 'running') {
                    resultClass = 'text-success';
                } else if(virtualmachine.stateFt == 'enabled') {
                    resultClass = 'text-primary';
                } else if(virtualmachine.stateFt == 'starting') {
                    resultClass = 'text-info';
                } else if(virtualmachine.stateFt == 'needSecondary') {
                    resultClass = 'text-warn';
                } else if(virtualmachine.stateFt == 'disabled') {
                    resultClass = 'text-black-lt';
                } else if(virtualmachine.stateFt == 'notConfigured') {
                    resultClass = 'text-black-lt';
                }
            }
            return resultClass;
        }

        $scope.getVirtualMachineStateClass = function(virtualmachine) {
            var resultClass = 'text-warn';
            if(virtualmachine.powerState) {
                if(virtualmachine.powerState == 'poweredOn') {
                    resultClass = 'text-success';
                } else if(virtualmachine.powerState == 'suspended') {
                    resultClass = 'text-warn';
                } else if(virtualmachine.powerState == 'deleted') {
                    resultClass = 'text-black-lt';
                } else {
                    resultClass = 'text-danger';
                }
            }
            return resultClass;
        }

        $scope.getVirtualMachineVmwareToolsData = function(type, virtualmachine) {
            var result = {
                'class':'',
                'icon':'fa-question-circle'
            };
            if(virtualmachine.vmwareTools) {
                if(virtualmachine.vmwareTools == 'guestToolsRunning') {
                    if(virtualmachine.vmwareToolsVersion == 'guestToolsCurrent') {
                        result['class'] = 'green';
                        result['icon'] = 'fa-check';
                    } else if(virtualmachine.vmwareToolsVersion == 'guestToolsSupportedNew') {
                        result['class'] = 'green';
                        result['icon'] = 'fa-check';
                    } else if(virtualmachine.vmwareToolsVersion == 'guestToolsUnmanaged') {
                        result['class'] = 'light-blue';
                        result['icon'] = 'fa-check';
                    } else if(virtualmachine.vmwareToolsVersion == 'guestToolsNeedUpgrade') {
                        result['class'] = 'warn';
                        result['icon'] = 'fa-check';
                    } else if(virtualmachine.vmwareToolsVersion == 'guestToolsSupportedOld') {
                        result['class'] = 'warn';
                        result['icon'] = 'fa-check';
                    } else if(virtualmachine.vmwareToolsVersion == 'guestToolsTooNew') {
                        result['class'] = 'warn';
                        result['icon'] = 'fa-exclamation-triangle';
                    } else if(virtualmachine.vmwareToolsVersion == 'guestToolsTooOld') {
                        result['class'] = 'warn';
                        result['icon'] = 'fa-exclamation-triangle';
                    } else if(virtualmachine.vmwareToolsVersion == 'guestToolsNotInstalled') {
                        result['class'] = 'red';
                        result['icon'] = 'fa-times';
                    } else if(virtualmachine.vmwareToolsVersion == 'guestToolsBlacklisted') {
                        result['class'] = 'red';
                        result['icon'] = 'fa-times';
                    }
                } else if(virtualmachine.vmwareTools == 'guestToolsExecutingScripts') {
                    result['class'] = 'warn';
                    result['icon'] = 'fa-check';
                } else if(virtualmachine.vmwareTools == 'guestToolsNotRunning') {
                    result['class'] = 'red';
                    result['icon'] = 'fa-times';
                }
            }
            return result[type];
        }

        $scope.getVirtualMachineBackupClass = function(virtualmachine) {
            var resultClass = '';
            if(virtualmachine.backup) {
                if(virtualmachine.backup.state) {
                    if(virtualmachine.backup.state == 'delivered') {
                        resultClass = 'green';
                    } else if(virtualmachine.backup.state == 'removed') {
                        resultClass = 'warn';
                    } else if(virtualmachine.backup.state == 'disabled') {
                        resultClass = 'red';
                    } else {
                        resultClass = 'red';
                    }
                }
            } else {
                resultClass = 'red';
            }
            return resultClass;
        }

        $scope.getVirtualMachineBackupIcon = function(virtualmachine) {
            var resultClass = 'fa-question-circle';
            if(virtualmachine.backup) {
                if(virtualmachine.backup.state) {
                    if(virtualmachine.backup.state == 'delivered') {
                        resultClass = 'fa-check';
                    } else if(virtualmachine.backup.state == 'removed') {
                        resultClass = 'fa-exclamation-triangle';
                    } else if(virtualmachine.backup.state == 'disabled') {
                        resultClass = 'fa-times';
                    } else {
                        resultClass = 'fa-times';
                    }
                }
            } else {
                resultClass = 'fa-times';
            }
            return resultClass;
        }

    }
})();
