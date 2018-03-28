<?php
//header("content-type: text/javascript");
//header('Content-Type: text/plain; charset=UTF-8;');
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
if ($_POST){
    // Make a array with the values
    $vals = array(
        'ver'     => 17,'method'=>'$_POST'
    );

    // Now we want to JSON encode these values to send them to $.ajax success.
    echo json_encode($vals);

    exit; // to make sure you arn't getting nothing else

} else {
    // so you can access the error message in jQuery
    echo json_encode(array('ver' => 17,'method' => '$_GET'));
    exit;
}

?>