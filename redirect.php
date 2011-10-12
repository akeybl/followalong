<?php
session_start();
$_SESSION['your_uid']=$_GET['uid'];
?>

<HEAD>
<SCRIPT language="JavaScript">
window.location.href="<?
try {
$db = new PDO('sqlite:triage.sqlite');

if ( $_GET['lead'] == 1 )
	$db->exec("UPDATE sessions SET curr_uid=" . $_GET['uid'] . " WHERE tid=" . $_GET['tid']);

$query = "SELECT * FROM links WHERE uid=" . $_GET['uid'];
$result = $db->query($query);

foreach ($result as $row) {
	$url = $row['url'];
}

echo $url;

$db = NULL;
}
catch(PDOException $e)
{
	        print 'Exception : '.$e->getMessage();
}
?>";
</SCRIPT>
</HEAD>
<body bgcolor="#292929" style="color:#CCCCCC">
Redirecting...
</body>

