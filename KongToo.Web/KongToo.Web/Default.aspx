<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="KongToo.Web._Default" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" >
<head runat="server">
    <title>kongtoo</title>
    <script type="text/javascript" src="http://jquery.com/src/jquery-latest.js"></script>
    <script type="text/javascript">
    //alert($("div").text());
    var s;
    $.ajax({
        url: "Services/DbSrv.asmx/HelloWorld",
        type: "POST",
        dataType: "xml",
        timeout: 100,
        error: function(){
            alert("Error loading WS");
        },
        success: function(xml){
            s = $(xml).text();
            //alert("ajax WS success");
            alert(s);
        }
    });
    </script>
</head>
<body>
    <form id="form1" runat="server">
    <div>
    This is mylocal branch.
    </div>
    </form>
</body>
</html>
