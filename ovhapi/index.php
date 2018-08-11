<?php
require __DIR__ . '/config.php';
use \Ovh\Api;

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
header('Access-Control-Max-Age: 1000');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-OVH-BATCH, Authorization, AK, AS, CK');
if($_SERVER['REQUEST_METHOD'] == 'OPTIONS')
{
    header('Content-Type: application/json');
    echo json_encode(array('message' => 'OPTIONS request is always allowed'));
    exit(0);
}

$consumerKey = null;
if(isset($_SERVER['HTTP_CK']))
{
    if(isset($_SERVER['HTTP_CK']))
    {
        $consumerKey = $_SERVER['HTTP_CK'];
    }
    if(isset($_SERVER['HTTP_AK']))
    {
        $applicationKey = $_SERVER['HTTP_AK'];
    }
    if(isset($_SERVER['HTTP_AS']))
    {
        $applicationSecret = $_SERVER['HTTP_AS'];
    }
}
else
{
    if(isset($_COOKIE['consumerKey']))
    {
        $consumerKey = $_COOKIE['consumerKey'];
    }
    if(isset($_COOKIE['applicationKey']))
    {
        $applicationKey = $_COOKIE['applicationKey'];
    }
    if(isset($_COOKIE['applicationSecret']))
    {
        $applicationSecret = $_COOKIE['applicationSecret'];
    }
}

$url = '';
$batch = null;
if(isset($_GET['url']))
{
    $url = $_GET['url'];
}
if(isset($_SERVER['HTTP_X_OVH_BATCH']))
{
    $batch = $_SERVER['HTTP_X_OVH_BATCH'];
}
if(isset($_GET['batch']))
{
    $batch = $_GET['batch'];
}

// Ugly hack to remove url params in query string, but still send other params
$queryString = str_replace('url='.$_GET['url'], '',$_SERVER['QUERY_STRING']);
if ($queryString == '') {
    $url = $_GET['url'];
} else {
    $url = $_GET['url'].'?'.$queryString;
}

if($url == 'login')
{
    if(isset($_GET['restricted']))
    {
        $rights = array( (object) [
            'method'    => 'GET',
            'path'      => '/dedicatedCloud*'
        ]);
    }
    $conn = new Api($applicationKey, $applicationSecret, $endpoint);
    $credentials = $conn->requestCredentials($rights, $redirection);
    setcookie('consumerKey', $credentials["consumerKey"], time()+3600*24*365, '/');
    setcookie('applicationKey', '', time()-1000, '/');
    setcookie('applicationSecret', '', time()-1000, '/');
    header('Location: '. $credentials["validationUrl"]);
    exit(0);
}
elseif($url == 'logout')
{
    setcookie('consumerKey', '', time()-1000, '/');
    setcookie('applicationKey', '', time()-1000, '/');
    setcookie('applicationSecret', '', time()-1000, '/');
    header('Location: '. $redirection);
    exit(0);
}

$conn = new Api($applicationKey, $applicationSecret, $endpoint, $consumerKey);

$res = requestApi('GET', '/'.$url, $batch);
http_response_code($res['statusCode']);
header('Content-Type: '.implode(', ', $res['contentType']));
$body = $res['body'];
if($res['contentType'][0] == 'application/json') {
    $body = json_encode($body);
}
echo $body;
exit(0);

function requestApi($method, $url, $batch) {
    $method = strtolower($method);
    try {
        global $conn;
        $result = null;
        if($batch) {
            $result = $conn->$method($url, null, ['X-OVH-BATCH' => $batch]);
        } else {
            $result = $conn->$method($url);
        }
        $statusCode = 200;
        $contentType = ['application/json'];
        $body = json_encode($result);
    } catch (Exception $exception) {
        $response = $exception->getResponse();
        if ($response != null) {
            $statusCode = $response->getStatusCode();
            $contentType = $response->getHeader('Content-Type');
            $body = $response->getBody()->__toString();
        } else {
            $statusCode = 500;
            $contentType = ['text/html'];
            $body = ['message' => $exception->message];
        }
    }
    if($contentType[0] == 'application/json') {
        $body = json_decode($body);
    }
    return ['statusCode' => $statusCode, 'contentType' => $contentType, 'body' => $body];
}
