<?php
require __DIR__.'/ovhapi/vendor/autoload.php';
require __DIR__.'/ovhapi/config.php';
use \Ovh\Api;

if(isset($_COOKIE['consumerKey']))
{
    $configNames = array(
        'endpoint',
        'applicationKey',
        'applicationSecret',
        'consumerKey',
    );
    
    foreach($configNames as $configName) {
        if(isset($_COOKIE[$configName]) and $_COOKIE[$configName]) {
            $config[$configName] = $_COOKIE[$configName];
        }
    }

    try {
        $conn = new Api($config['applicationKey'],
            $config['applicationSecret'],
            $config['endpoint'],
            $config['consumerKey']);
        $conn->get('/dedicatedCloud');
    } catch (GuzzleHttp\Exception\ClientException $exception) {
        header('Location: /ovhapi/logout');
        exit(0);
    } catch (GuzzleHttp\Exception\ServerException $exception) {
        header('Location: /ovhapi/logout');
        exit(0);
    }
    if($_SERVER['REQUEST_URI'] == '/')
    {
        header('Location: /pcc');
        exit(0);
    }
}
else
{
    if($_SERVER['REQUEST_URI'] != '/')
    {
        header('Location: /');
        exit(0);
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>vScope</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimal-ui" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge">

  <!-- for ios 7 style, multi-resolution icon of 152x152 -->
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-barstyle" content="black-translucent">
  <link rel="apple-touch-icon" href="/assets/images/logo.png">
  <meta name="apple-mobile-web-app-title" content="Flatkit">
  <!-- for Chrome on Android, multi-resolution icon of 196x196 -->
  <meta name="mobile-web-app-capable" content="yes">
  <link rel="shortcut icon" sizes="196x196" href="/assets/images/logo.png">

  <!-- style -->
  <link rel="stylesheet" href="/assets/animate.css/animate.min.css" type="text/css" />
  <link rel="stylesheet" href="/assets/glyphicons/glyphicons.css" type="text/css" />
  <link rel="stylesheet" href="/assets/font-awesome/css/font-awesome.min.css" type="text/css" />
  <link rel="stylesheet" href="/assets/material-design-icons/material-design-icons.css" type="text/css" />

  <link rel="stylesheet" href="/assets/bootstrap/dist/css/bootstrap.min.css" type="text/css" />
  <!-- build:css assets/styles/app.min.css -->
  <link rel="stylesheet" href="/assets/styles/app.css" type="text/css" />
  <!-- endbuild -->
  <link rel="stylesheet" href="/assets/styles/font.css" type="text/css" />
  <base href="/">
</head>
<body ng-app="app" ng-controller="RootCtrl" ng-class="{'ie': isIE,'smart': isSmart}">
  <div class="app" ui-include="'../views/layout.html'"></div>
<!-- build:js scripts/app.angular.js -->
<!-- jQuery -->
  <script src="/libs/jquery/jquery/dist/jquery.js"></script>
<!-- Bootstrap -->
  <script src="/libs/jquery/tether/dist/js/tether.min.js"></script>
  <script src="/libs/jquery/bootstrap/dist/js/bootstrap.js"></script>
  <script src="/libs/jquery/PACE/pace.min.js"></script>
<!-- Angular -->
  <script src="/libs/angular/angular/angular.js"></script>
  <script src="/libs/angular/angular-animate/angular-animate.js"></script>
  <script src="/libs/angular/angular-cookies/angular-cookies.js"></script>
  <script src="/libs/angular/angular-resource/angular-resource.js"></script>
  <script src="/libs/angular/angular-sanitize/angular-sanitize.js"></script>
  <script src="/libs/angular/angular-touch/angular-touch.js"></script>
  <script src="/libs/angular/angular-md5/angular-md5.min.js"></script>

  <!-- router -->
  <script src="/libs/angular/angular-ui-router/release/angular-ui-router.js"></script>
  <!-- storage -->
  <script src="/libs/angular/ngstorage/ngStorage.js"></script>
  <!-- utils -->
  <script src="/libs/angular/angular-ui-utils/ui-utils.js"></script>
  <!-- lazyload -->
  <script src="/libs/angular/oclazyload/dist/ocLazyLoad.js"></script>

<!-- App -->
  <script src="/scripts/app.js"></script>
  <script src="/scripts/config.js"></script>
  <script src="/scripts/config.lazyload.js"></script>
  <script src="/scripts/config.router.js"></script>
  <script src="/scripts/app.ctrl.js"></script>

  <script src="/scripts/directives/ui-jp.js"></script>
  <script src="/scripts/directives/ui-nav.js"></script>
  <script src="/scripts/directives/ui-fullscreen.js"></script>
  <script src="/scripts/directives/ui-scroll-to.js"></script>
  <script src="/scripts/directives/ui-toggle-class.js"></script>
  <script src="/scripts/directives/ui-include.js"></script>

  <script src="/scripts/filters/fromnow.js"></script>
  <script src="/scripts/filters/toarray.js"></script>
  <script src="/scripts/filters/keylength.js"></script>
  <script src="/scripts/filters/round.js"></script>

  <script src="/scripts/services/ngstore.js"></script>
  <script src="/scripts/services/ui-load.js"></script>
  <script src="/scripts/services/palette.js"></script>
<!-- endbuild -->
</body>
</html>
