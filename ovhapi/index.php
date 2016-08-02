<?php
require __DIR__ . '/config.php';
use \Ovh\Api;

$apiv7 = false;
if(isset($_GET['url']))
{
    if($_GET['url'] == 'login')
    {
        $conn = new Api(    $applicationKey,
                            $applicationSecret,
                            $endpoint);
        $credentials = $conn->requestCredentials($rights, $redirection);
        setcookie('consumerKey', $credentials["consumerKey"], time()+3600*24*365, '/');
        header('Location: '. $credentials["validationUrl"]);
        exit(0);
    }
    elseif($_GET['url'] == 'logout')
    {
        setcookie('consumerKey', '', time()-1000, '/');
        header('location: '. $redirection);
        exit(0);
    }
}
$consumerKey = null;
if(isset($_COOKIE['consumerKey']))
{
    $consumerKey = $_COOKIE['consumerKey'];
}
if($consumerKey)
{
    $conn = new Api(    $applicationKey,
                        $applicationSecret,
                        $endpoint,
                        $consumerKey);
    try {
        $result = null;
        if(isset($_GET['url']))
        {
            if(isset($_SERVER['HTTP_X_OVH_BATCH']))
            {
                $result = $conn->get('/'.$_GET['url'], null, [ 'X-OVH-APIV7-BATCH' => $_SERVER['HTTP_X_OVH_BATCH'], 'X-OVH-BATCH' => $_SERVER['HTTP_X_OVH_BATCH'], 'X-Ovh-ApiVersion' => $apiv7?'beta':'' ]);
            }
            elseif(isset($_GET['batch']))
            {
                $result = $conn->get('/'.$_GET['url'], null, [ 'X-OVH-APIV7-BATCH' => $_GET['batch'], 'X-OVH-BATCH' => $_GET['batch'], 'X-Ovh-ApiVersion' => $apiv7?'beta':'' ]);
            }
            else
            {
                $result = $conn->get('/'.$_GET['url'], null, [ 'X-Ovh-ApiVersion' => $apiv7?'beta':'' ]);
            }
        }
        echo json_encode($result);
    } catch (Exception $exception) {
        if(isset($_GET['debug']) && $_GET['debug'])
        {
            $res = $exception->getResponse();
            echo 'Response :'."\n";
            echo '  Headers :'."\n";
            foreach($res->getHeaders() as $key => $value)
            {
                echo '    '.$key.' : '.$value[0]."\n";
            }
            echo '  Status : '.$res->getStatusCode().' - '.$res->getReasonPhrase()."\n";
            echo '  Body : '.$res->getBody()."\n\n\n\n\n";
            return $res;
        }
        $response = $exception->getResponse();
        $statusCode = $response->getStatusCode();
        $reasonPhrase = $response->getReasonPhrase();
        http_response_code($statusCode);
        header('Content-Type: '.implode(', ',$response->getHeader('Content-Type')));
        echo $response->getBody();
    }
}




