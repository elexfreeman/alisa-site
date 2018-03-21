<?php
/**
 * Created by PhpStorm.
 * User: UD
 * Date: 16.02.2018
 * Time: 11:53
 */
define('BOT_TOKEN', '534901728:AAEVmg3uMHcHifMYkiMmoGwNv4nE8eZtC-A'); // place bot token of your bot here

$a = [];
$a['auth_date'] = '1518767435';
$a['first_name'] = 'Oberon';
$a['id'] = '398015313';

$a['last_name'] = 'J';
$a['photo_url'] = 'https://t.me/i/userpic/320/ElexShepard.jpg';
$a['username'] = 'ElexShepard';



$data_check_arr = [];
foreach ($a as $key => $value) {
    $data_check_arr[] = $key . '=' . $value;
}

$data_check_string = implode("\n", $data_check_arr);


$secret_key = hash('sha256', BOT_TOKEN, true);
$hash = hash_hmac('sha256', $data_check_string, $secret_key);

echo $hash;
