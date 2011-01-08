using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.IO;
using System.Threading;

namespace DataAccess
{
    public class FileLog
    {
        private string flogpath;
        public FileLog(string logFilePath)
        {
            flogpath = logFilePath;
        }
        public void CreateLogFile(object obj)
        {
            FileStream fs = File.Open(flogpath, FileMode.OpenOrCreate, FileAccess.ReadWrite);
            //Create(flogpath);
            fs.Close();
        }
    }
}
