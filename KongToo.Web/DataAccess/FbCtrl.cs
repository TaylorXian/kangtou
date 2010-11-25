using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using FirebirdSql.Data.FirebirdClient;
using FirebirdSql.Data.Isql;

namespace DataAccess
{
	public class FbCtrl
	{
		public static int Test()
		{
			String str = "User=SYSDBA;Password=masterkey;Database=kongtoo.fdb;Charset=NONE;Servertype=1";

			try
			{
				FbConnection.CreateDatabase(str);
				return 0;
			}
			catch (Exception)
			{
				return -1;
			}

			//// parse the SQL script
			//FbScript script = new FbScript(pathScript);
			//script.Parse();

			//using (FbConnection c = new FbConnection(str))
			//{
			//    FbBatchExecution fbe = new FbBatchExecution(c);
			//    foreach (string cmd in script.Results)
			//    {
			//        fbe.SqlStatements.Add(cmd);
			//    }
			//    fbe.Execute();
			//}
		}
	}
}
