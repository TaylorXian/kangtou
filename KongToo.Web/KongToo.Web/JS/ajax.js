(function(wnd,undef){
    var doc=wnd.document,OBJ="object",STR="string";
		  
    var ajax=function(options){
        return new ajax.prototype.init(options);
    };
			  
    function AjaxError(msg){
        this.name="Ajax错误";
        this.message=msg||"未知错误";
    }
			  
    ajax.prototype={
        init:function(option){
            this[0]=this.create();//创建Ajax对象
            this[1]={
                url:option.url||"",//数据源地址
                method:option.method||"GET",//请求方法[POST、HEAD...]
                data:option.data||null,//要发送给服务器的数据
                async:option.async||true,//是否是异步请求
                type:option.type||"text",//返回数据后，将数据转换为指定的类型.(text,js,xml,html)
                timeout:option.timeout||10000,//请求超时，默认为十秒
                cache:option.cache||false,//是否从缓存中取数据(如果浏览器已缓存)
                onSuccess:option.onSuccess||function(result){},//请求成功后执行的函数(处理返回结果)
                onError:option.onError||function(){},//请求出错调用的函数
                onComplete:option.onComplete||function(){},//请求完成后(无论成功与否)都执行的函数
                showStatus:option.showStatus||function(){}//显示请求状态
            };

            fix(this[1]);
            return this;
        },
				  
        create:function(){//创建Ajax对象
            if(wnd.XMLHttpRequest==undef){
                wnd.XMLHttpRequest=function(){
                    if(wnd.ActiveXObject){
                        try{
                            return new ActiveXObject("Msxml2.XMLHTTP");//IE6
                        }catch(e){
                            return new ActiveXObject("Microsoft.XMLHTTP");//IE5
                        }
                    }
                };
            }
            return new  XMLHttpRequest();
        },
        stop:function(){
            try{
                this[0].abort();
            }catch(e){
                throw new AjaxError(e.message)
                }
            return this;
        },
        getText:function(fn){//fn可选
            return this.exe({"onSuccess":fn,"type":"text"});
        },
        getXML:function(fn){
            return this.exe({"onSuccess":fn,"type":"xml"});
        },
        getScript:function(fn){
            return this.exe({"onSuccess":fn,"type":"js"});
        },
        getHTML:function(fn){
            return this.exe({"onSuccess":fn,"type":"html"});
        },
        exe:function(options){
            if(options.onSuccess)this[1].onSuccess=options.onSuccess;
            if(options.onError)this[1].onError=options.onError;
            if(options.onComplete)this[1].onComplete=options.onComplete;
            if(options.showStatus)this[1].showStatus=options.showStatus;
            if(options.type)this[1].type=options.type;
            try{
                var isTimeout=false,cur=this;
                var timer=setTimeout(function(){
                    isTimeout=true;
                    cur.stop();
                    cur[1].onError(new AjaxError("请求超时"));
                },cur[1].timeout);
                //私有方法
                var open=function(){
                    try{
                        cur[0].open(cur[1].method,cur[1].url,cur[1].async);
                        if(/POST/i.test(cur[1].method)){
                            cur[0].setRequestHeader("Content-Type","application/x-www-form-urlencoded");//表单编码
                            if(cur[0].overrideMimeType)cur[0].setRequestHeader("Connection","close");
                        }
                    }catch(e){
                        throw new AjaxError(e.message);
                    }
                };
                var send=function(){
                    try{
                        cur[0].send(cur[1].data);
                    }catch(e){
                        throw new AjaxError(e.message);
                    }
                };
					  
                open();//发起连接
					  
                this[0].onreadystatechange=function(){
                    cur[1].showStatus(cur[0].readyState);
                    if(cur[0].readyState==4&&!isTimeout){
							  
                        try{
                            if(isOK(cur[0])){//成功完成
                                var t=httpData(cur[0],cur[1].type);
		  
                                if(cur.to&&cur.to.length>0){
                                    for(var i=0;i<cur.to.length;i++){
                                        if(cur.to[i].type&&cur.to[i].type=="html")
                                            cur.to[i].target.innerHTML+=t;
                                        else cur.to[i].target.appendChild(doc.createTextNode(t));
                                    }
                                }
                                cur[1].onSuccess(t);
                            }
                            else{
                                cur[1].onError(new AjaxError("请求未成功完成"));
                            }
									
                        }catch(et){
                            cur[1].onError(new AjaxError(et.message));
                        }finally{
                            cur[1].onComplete();
                            cur[0]=null;
                            clearTimeout(timer);
                        }  

                    }
                };
						  
                send();
					  
            }catch(e){
                this[1].onError(new AjaxError(e.message));
            }finally{
                return this;
            }
				  
        },

        appendTo:function(target){//将返回的结果加到指定的目标[id或DOM对象]
            if(!this.to)this.to=[];
            this.to.push({
                "target":$(target),
                "type":this[1].type
                });
            return this;
        }
    };//end prototype
    ajax.prototype.init.prototype=ajax.prototype; 
		
    ajax.parseToQueryString=function(obj){//将数组或对象序列化
        if(typeof obj===STR)return obj;
        var s=[];
        if(obj instanceof Array){//假定为数组
            for(var i=0;i<obj.length;i++)
                s.push(obj[i].name||i+"="+obj[i]);
        }
        else{
            for(var j in obj) s.push(j+"="+obj[j]);
        }
        return s.join("&");
    } ;
			
    ajax.parseToObject=function(str){//将查询字符串转化成对象
        if(typeof str==OBJ)return str;
        var set={};
        str=str.split("&");
        var item;
        for(var i=0;i<str.length;i++){
            if(str[i].indexOf("=")>0){
                item=str[i].split("=");
                set[item[0]]=item[1];
            }
        }
        return set;
    };
			 
    var fix=function(p){
        if(p.data){
            p.data=ajax.parseToQueryString(p.data);
        }
        if(p.method.toUpperCase()=="GET"&&p.data){
            p.url=append(p.url,p.data);
        }
        if(!p.cache){
            p.url=append(p.url,"abkjfjk="+(new Date().getTime())+"jrejhjdd");
        }
    };
			 
    var $=function(id){
        return typeof id===OBJ?id:doc.getElementById(id);
    };
		
    function isOK(r){
        try{
            return !r.status&&location.protocol=="file:"
            ||(r.status>=200&&r.status<300)
            ||r.status==304
            ||navigator.userAgent.indexOf("Safari")>=0&&r.status==undef;
        }catch(e){}
        return false;
    }
			
    function httpData(r,type){
        var res=type;
        if(!res){
            var ct=r.getResponseHeader("Content-Type");
            if(/xml/i.test(ct))	res="xml";
            else if(/JavaScript/i.test(ct))res="js";
            else res="";
        }
        switch(res){
            case "xml":
                return r.responseXML.documentElement;
            case "js":
                return eval("("+r.responseText+")");
            default:
                return r.responseText;
        }	
    }
	
    function append(url,param){
        if(url.indexOf("?")<0){
            return url+"?"+param;
        }
        else{
            if(/\?$/.test(url)){
                return url+param;
            }
            else{
                return url+"&"+param;
            }
        }
    }
			
    wnd.ajax=ajax;
})(window);