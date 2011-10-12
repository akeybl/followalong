<?php
session_start(); 
try
{
$db = new PDO('sqlite:triage.sqlite');

$query = "SELECT * FROM sessions WHERE tid=" . $_GET['tid'];
$result = $db->query($query);

foreach ( $result as $row ) {
	$their_new_uid = $row["curr_uid"];
}

if ( $_GET['lead'] != 1 && $_SESSION['your_uid'] != $their_new_uid ) {
	echo "<script>if ( document.follow.theleader.checked ) document.getElementById('" . $their_new_uid . "').click();</script>";

	$_SESSION['their_uid'] = $their_new_uid;
}

$query = "SELECT * FROM links WHERE triage_id=" . $_GET['tid'];
$result = $db->query($query);

echo "<ol>";

foreach ( $result as $row ) {
        $l_uid = $row["uid"];
	$l_url = $row["url"];
        $l_title = $row["title"];

        echo "<li><a ";

	if ($l_uid == $their_new_uid) {
		echo "style=\"color: rgb(255,0,0)\"";	
	}

	echo " id=\"" . $l_uid . "\"title=\"" . $l_url . "\" href=\"redirect.php?tid=" . $_GET['tid'] . "&uid=" . $l_uid . '&lead=' . $_GET['lead'] . "\">" . $l_title . "</a>";

	if ( $_GET['lead'] != 1 && $l_uid == $_SESSION['your_uid'] ) {
		echo " >>";	
	}

	echo "</li>";
}

echo "</ol>";
}
catch(PDOException $e)
{
	        print 'Exception : '.$e->getMessage();
}
?>
