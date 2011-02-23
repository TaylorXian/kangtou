using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.IO;
using System.Threading;

namespace DataAccess
{
    public class MyThreadPool
    {
        bool start;

        public bool Start
        {
            get { return start; }
            set { start = value; }
        }
        public MyThreadPool() : this(true)
        {
        }
        public MyThreadPool(bool start)
        {
            this.start = start;
        }
        public void StartThreadPool()
        {
            while (start)
            {
                for (int i = 0; i < 10; i++)
                {
                    FileLog fl = new FileLog(string.Format("./{0}.txt", 
                        DateTime.Now.ToString("yyyyMMddHHmmss")));
                    ThreadPool.QueueUserWorkItem(fl.CreateLogFile, new object());
                    Thread.Sleep(1000);
                }
                Thread.Sleep(10 * 1000);
            }
        }
    }
}
