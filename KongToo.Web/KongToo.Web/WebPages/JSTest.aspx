<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="JSTest.aspx.cs" Inherits="KongToo.Web.WebPages.JSTest" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" >
<head runat="server">
    <title>Untitled Page</title>
    <script src="../JS/ajax.js"></script>
    <script src="../JS/pj-2.1.1.js"></script>
</head>
<body>
    <form id="form1" runat="server">
    <div>
    
    </div>
    </form>
</body>
    <script type="text/javascript">
    s = document.createElement("span");
    s.innerHTML = 'span';
    document.body.appendChild(s);
    ajax({url: "../Services/DbSrv.asmx/HelloWorld", method: "POST"}).getXML(
        function (xml) {alert(xml);}
    );
    </script>
</html>
