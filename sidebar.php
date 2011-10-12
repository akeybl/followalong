<?php
session_start();
$_SESSION['their_uid']=-1;
$_SESSION['your_uid']=-1;
?>

<html>
<head>
<script type="text/javascript" src="editor.js"></script>
<script src="http://code.jquery.com/jquery-latest.js"></script>
<script>
 $(document).ready(function() {
 	 $("#responsecontainer").load('response.php?tid=' + <? echo $_GET['tid']; ?> + '&lead=' + <? echo $_GET['lead'] ?>);
   var refreshId = setInterval(function() {
      $("#responsecontainer").load('response.php?tid=' + <? echo $_GET['tid']; ?> + '&lead=' + <? echo $_GET['lead'] ?> + '&randval=' + Math.random());
   }, 3000);
   $.ajaxSetup({ cache: false });
});
</script>
</head>
<body bgcolor="#292929" style="color:#CCCCCC">
<?
   if ($_GET['lead'] == 1)
	echo "you're leading. good luck.</br>";
?>
<div style="color:#CCCCCC" id="responsecontainer">
</div>
<?
   if ($_GET['lead'] != 1)
	echo '<form name="follow"><input type="checkbox" name="theleader" checked /> follow the leader</form>';
   else {
	   echo "<hr></br><form target=\"hack\" action=\"add.php?tid=" . $_GET['tid'] . "\" method=\"post\" onsubmit=\"editor1.prepareSubmit()\">
		   <center><script type=\"text/javascript\">
   var editor1 = new WYSIWYG_Editor('editor1','','',325,100);
	editor1.web_toolbar1=false;
   editor1.display();
       </script></center>
	       <input type=\"submit\" value=\"add links\"/> <input type=\"checkbox\" name=\"getTitles\" value=\"Yes\" checked> get link titles</input>
	       </form>
<iframe name=\"hack\" src=\"blank.html\" frameborder=0 width=\"1\" height=\"1\"></iframe>";
   }
?>
</body>
