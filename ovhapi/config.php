<?php

require __DIR__ . '/vendor/autoload.php';

$endpoint = 'ovh-eu';
$applicationKey = "jg8vCO4LsjG2QpKi";
$applicationSecret = "bHSBNISJqNe2Ef7gsSSonYiDnDx3Vj0B";
$redirection = "https://vscope.carsso.ovh";
$rights = array( (object) [
    'method'    => 'GET',
    'path'      => '/*'
]);
