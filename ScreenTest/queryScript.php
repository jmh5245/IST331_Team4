<?php

$db_host='fdb29.awardspace.net'; //Should contain the "Database Host" value
$db_name='3752156_flightsims'; //Should contain the "Database Name" value
$db_user='3752156_flightsims'; //Should contain the "Database User" value
$db_pass=':p.x}I5v6:ij_o(@'; //Should contain the "Database Password" value

$mysqli_connection = new MySQLi($db_host, $db_user, $db_pass, $db_name);

if ($mysqli_connection->connect_error) {
echo "Could not connect to $db_user, error: " . $mysqli_connection->connect_error;
} else {
echo "Connected to $db_user! <hr> The database contains the following tables: <br />";
}

$showtablequery = "SHOW TABLES FROM $db_user";
$showtablequery_result = mysqli_query($mysqli_connection, $showtablequery);

while($showtablerow = mysqli_fetch_array($showtablequery_result))
{
echo $showtablerow[0]."<br />";
}

$mysqli_connection->close();
echo "<hr> mysqli_connection closed!";

?>