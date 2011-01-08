using System;
using System.Collections;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.HtmlControls;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Xml.Linq;
using DataAccess;
using System.Threading;

namespace KongToo.Web
{
    public partial class _Default : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {

        }

        protected void Button1_Click(object sender, EventArgs e)
        {
            MyThreadPool myTP = (MyThreadPool)Application["MyThreadPool"];
            myTP.Start = false;
            Thread myThread = (Thread)Application["MyThread"];
            this.ClientScript.RegisterClientScriptBlock(this.GetType(),
                "", "alert('mythread state is " + myThread.ThreadState.ToString() + "')", true);
        }
    }
}
