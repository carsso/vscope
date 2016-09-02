<?php

require __DIR__ . '/vendor/autoload.php';

$endpoint = 'ovh-eu';
$applicationKey = "7pafXqPQ7jiA2Y4u";
$applicationSecret = "HD4S4MHrtkMZMKMRYbzgu7SrI1KK8Gb5";
$redirection = "https://vscope.carsso.ovh";
$rights = array( (object) [
    'method'    => 'GET',
    'path'      => '/*'
]);
