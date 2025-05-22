<?php
$session = isset($_POST['session']) ? basename($_POST['session']) : '';
$data = isset($_POST['data']) ? $_POST['data'] : '';
if (!$session || !$data) {
    http_response_code(400);
    echo 'Invalid data';
    exit;
}
if (strpos($data, ',') !== false) {
    $data = explode(',', $data, 2)[1];
}
$binary = base64_decode($data);
$dir = __DIR__ . '/scans';
if (!is_dir($dir)) {
    mkdir($dir, 0777, true);
}
file_put_contents("$dir/{$session}.pdf", $binary);
echo 'OK';
?>
