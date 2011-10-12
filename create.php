<html>
<body bgcolor="#292929" style="color:#CCCCCC">

Creating...

<?php

$regexp = "<a\s[^>]*href=(\"??)([^\" >]*?)\\1[^>]*>(.*)<\/a>";

function getTitle($page)
{
	$contents = @file_get_contents($page);
	if (!$contents) return FALSE;
  
	preg_match("/<title>(.*)<\/title>/i", $contents, $matches);
	return $matches[1];
}	

$arr = array();

if(preg_match_all("/$regexp/siU", stripslashes($_POST["editor1_content"]), $matches, PREG_SET_ORDER)) {
	foreach($matches as $match) {
		$arr[$match[2]] = $match[3];
	}
}

try {
$db = new PDO('sqlite:triage.sqlite');

$query = "INSERT INTO sessions (subject,date,curr_uid) VALUES ('" . $_POST["subject"] . "',datetime('now'),1)";
$result = $db->exec($query);

$tid = $db->lastInsertId();

foreach($arr as $link => $text) {
	if( $_POST['getTitles'] != 'Yes' ) {
		$title = $text;
	}
	else {
		$result = getTitle($link);
		if (!$result) $title = $link;
		else $title = $result;	
	}

	$query = "INSERT INTO links (url,title,triage_id) VALUES ('" . $link . "','" . $title . "','" . $tid . "')";
	$result = $db->exec($query)  or die(print_r($db->errorInfo(), true));
}

$db = NULL;
}
catch(PDOException $e)
{
	print 'Exception : '.$e->getMessage();
}

?>

<SCRIPT language="JavaScript">
window.location.href="index.php";
</SCRIPT>

</body>
</html> 
