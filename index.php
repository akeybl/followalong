<html>
<head>
<title>followalong sessions</title>
<script type="text/javascript" src="editor.js"></script>
</head>
<body bgcolor="#292929" style="color:#CCCCCC">
<h1><img src="images/ducks.png" align="left" vspace="5" hspace="20" /> followalong collaborative browsing</h1>
<i>note- this page is meant to be used in conjuction with the <a href="followalong.xpi">followalong</a> add-on for Firefox. once installed, right click a session link and select "Follow Along". open the [L]ink the same way to lead the session. bonus awesome if you have a notification system (Growl/libnotify) installed.</i>
</br></br>
<h3>followalong sessions started in the past 24 hours</h3>
<?php 
date_default_timezone_set('America/Los_Angeles');

try {
$db = new PDO('sqlite:triage.sqlite');

$query = "SELECT * FROM sessions WHERE sessions.date > datetime('now', '-1 days')";

$result = $db->query($query);

echo "<ul>";

foreach ( $result as $row ) {
	$t_id = $row['tid'];
	$t_subject = $row['subject'];
	$t_date = $row['date'];

	echo "<li><i><a href=\"sidebar.php?tid=" . $t_id . "&lead=1\"><font size=\"1\">[L]</font></a></i> <a href=\"sidebar.php?tid=" . $t_id . "&lead=0\">" . $t_subject . "</a> (" . date("g:i A T", strtotime($t_date . ' -0000') ) . ")</li>";
}

echo "</ul>";

$db = NULL;
}
catch(PDOException $e)
{
	print 'Exception : '.$e->getMessage();
}
?>
</br>
<h3>create a followalong session</h3>
<form action="create.php" method="post" onsubmit="editor1.prepareSubmit()">
session subject</br><input type="text" name="subject" /></br></br>
paste html formatted links here (ie. copy/paste from a bugzilla query)
<script type="text/javascript">
    var editor1 = new WYSIWYG_Editor('editor1');
    editor1.display();
</script>
<input type="submit" value="create session"/> <input type="checkbox" name="getTitles" value="Yes" checked> get link titles (takes longer, but ensures confidentiality)</input>
</form></br></br></br>
</body>
