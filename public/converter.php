<?php
require_once '../vendor/autoload.php';

$req_json = file_get_contents('php://input');
$req = json_decode($req_json, true);

$parsedown = new Parsedown();
$convertedContent = $parsedown->text($req['content']);
$format = $req['format'];

if ($format === 'download') {
  header('Content-Type: text/html');
  header('Content-Disposition: attachment; filename="converted.txt"');
  echo $convertedContent;
} else {
  header('Content-Type: text/html');
  echo $convertedContent;
}
?>
