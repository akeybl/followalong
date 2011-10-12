<html>
<head>
<title>Triage Session <? echo $_GET['tid'] ?></title>
</head>
<frameset frameborder="1" cols="250,*">
  <frame src="sidebar.php?tid=<? echo $_GET['tid'] ?>&lead=<?
	if(isset($_GET['lead']) && !empty($_GET['lead'])) {
		echo $_GET['lead'];
	} else {
		echo "0";
	}

?>" name="leftside" />
  <frame src="<?

$db = mysql_connect('localhost', 'root', 'root');
@mysql_select_db("triage") or die( "Unable to select database");

$query = "SELECT * FROM sessions WHERE tid=" . $_GET['tid'];
$result = mysql_query($query);

$curr_uid = mysql_result($result, 0, "curr_uid");

echo "redirect.php?uid=" . $curr_uid;

mysql_close();

?>" name="rightside" />
</frameset>

</html>
