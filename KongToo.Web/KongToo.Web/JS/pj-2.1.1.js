/**
 *pj.js  version: 2.1.1
 *@copyright: 2010 pengju
 *date 2011-1-5
 *email:pengju114@163.com
 *all rights reserved
 *[附加tween算法,并进行了优化,修复在IE9下淡入淡出的bug,修复拖动时选中文本影响拖动效果的bug,修复取/设置float的bug]
 */
(function(wnd,undef){
    var doc=wnd.document,isIE=(/MSIE/gi).test(wnd.navigator.userAgent)&&(/Explorer/gi).test(wnd.navigator.appName);
	
    var pj=function(selector,context){//selector:选择器， context: 上下文
        return new pj.prototype.init(selector,context);
    };

    pj.prototype={
        /***真正的构造函数***/
        init:function(sel,cot){
            /****上下文默认为document****/
            cot=cot&&pj.isObject(cot)?cot:doc;
            /****保存元素****/
            var elems=[];
            /****当前pj对象的计时器队列****/
            this.timer={};

            if(pj.isObject(sel))elems.push(sel);
            else if(pj.isString(sel)){
                sel=pj.trimAll(sel);
                /**
				 *id选择器, 如: pj("#header"),取id为header的元素
				 */
                if(/^#\w+$/.test(sel))js.id(sel,cot,elems);
                /**
				 *标签 选择器, 如: pj("div"),取页面所有的div
				 */
                else if(/^\w+$/.test(sel))js.tag(sel,cot,elems);
                /**
				 *class选择器, 如: pj("[tag].ClassName"), 取class为ClassName的[tag]元素
				 */
                else if(/^\w*\.\w+$/.test(sel)){
                    js.cname(sel,cot,elems);
                }
                /**
				 *取指定id下的所有指定元素
				 *如: pj("#header>a"), 取id为header元素下的所有a元素
				 */
                else if(/^#\w+>\w+$/.test(sel)){
                    var set=sel.split(">");
                    var t=cot.getElementById(set[0].replace(/^#/,""));
                    if(t){
                        elems=js.tag(set[1],t,elems);
                    }
                }
                /**
				 *取指定标签下面所有指定标签的元素
				 *如: pj("li>a") 取页面所有li元素下面的a元素
				 */
                else if(/^\w+>\w+$/.test(sel)){
                    var tag=sel.split(">");
                    var set=cot.getElementsByTagName(tag[0]);
                    if(set.length<8)for(var k=0;k<set.length;k++)js.tag(tag[1],set[k],elems);
                    else{
                        var mod=set.length%8;
                        var cnt=(set.length-mod)/8,c=0;
                        do{//加速遍历
                            js.tag(tag[1],set[0+8*c],elems);
                            js.tag(tag[1],set[1+8*c],elems);
                            js.tag(tag[1],set[2+8*c],elems);
                            js.tag(tag[1],set[3+8*c],elems);
                            js.tag(tag[1],set[4+8*c],elems);
                            js.tag(tag[1],set[5+8*c],elems);
                            js.tag(tag[1],set[6+8*c],elems);
                            js.tag(tag[1],set[7+8*c],elems);
                            c++;
                        }while(c<cnt);
                        while(mod>0){
                            js.tag(tag[1],set[set.length-mod],elems);
                            mod--;
                        }
                    }
                }
                /**
				 *按照指定的元素id、className、或者标签取元素
				 *如: pj("#header,[tag].name,div") 取id为header的元素
				 *和className为name的元素和页面所有的div元素
				 */
                else if(/^((#|\w*\.)?\w+,)+(#|\w*\.)?\w+$/.test(sel)){
                    js.query(sel,cot,elems);
                }

                /**
				 *根据指定的属性或者下标取元素
				 *如: pj("div[name=value]:0,3") 取页面中含有name属性并且值为value的第一和第四个元素
				 */
                else if(/^((#|\w*\.)?\w+,)*(#|\w*\.)?\w+(\[(\w+=.+,)*\w+=.+\])?(:(\d+,)*\d+)?$/.test(sel)){
                    var a;

                    /**
                     *只指定下标，没有指定属性的情况
                     *如: pj("div,#header, .name:1,3,6")
                     *先根据选择器取元素，然后只要第二、第四、第七个元素
                     */
                    if(!/\[(\w+=.+,)*\w+=.+\]/.test(sel)){
                        a=sel.split(":");
                        var s=[];
                        js.query(a[0],cot,s);
                        js.findex(a[1],s,elems);
                    }

                    /**
                     *既指定下标，又指定属性的情况
                     *如: pj("div,#header, .name[n=v]:1,3,6")
                     *先根据选择器取元素，然后只要含有属性n并且值为v的第二、第四、第六个元素
                     */
                    else if(/:(\d+,)*\d+$/.test(sel)){
                        a=sel.split(":");
                        var all=[];
                        js.fattr(a[0],cot,all);
                        js.findex(a[1],all,elems);
                    }

                    /**
                     *只指定属性，没有指定下标的情况
                     *如: pj("div,#header, .name[name=value,x=y]")
                     *先根据选择器取元素，然后只要含有属性为name和x并且值为value和y的元素
                     */
                    else {
                        js.fattr(sel,cot,elems);
                    }

                }
                /**
				 *如果选择器是一个标签，如: <div>或者<div/>
				 *则创建元素; 创建元素后默认添加到document.body;可调用appendTo方法将元素追加到指定元素
				 */
                else if(/^<\w+(\/)?>$/.test(sel)){
                    sel=sel.replace(/\//,"");
                    var sub=sel.lastIndexOf(">");
                    sub=sel.substring(1,sub);
                    sel=doc.createElement(sub);
                    if(sel){
						doc.body.appendChild(sel);
                        elems.push(sel);
                    }
                }
                /**
				 *HTML 标签
				 *如: <div>内容或者HTML标记</div>
				 *创建元素并且新建元素的innerHTML=标记间的内容;
				 * 创建元素后默认添加到document.body;可调用appendTo方法将元素追加到指定元素
				 */
                else if(/^<(\S*?)[^>]*>.*?<\/\1>|<.*?\/>$/){
                    var text,tagName;
                    tagName=sel.indexOf(">");
                    text=sel.lastIndexOf("<");
                    text=sel.substring(tagName+1,text);
                    tagName=sel.substring(1,tagName);
                    tagName=doc.createElement(tagName);
                    if(tagName){
						doc.body.appendChild(tagName);
                        tagName.innerHTML=text;
                        elems.push(tagName);
                    }
                }

            }


            return pj.merge(this,elems);//将选择元素整合到当前pj对象并返回
        },//end init

        /**
         *取指定操作对象，
		 *如果不指明下标
		 *或越界则返回对象数组
		 *如果当前操作对
		 *象只有一个则返
		 *回一个对象
         **/
        get: function(index){
            if(this.length==1)return this[0];
            else if(index!==undef)return this[index];
            else return Array.prototype.slice.call(this,0);
        },

        /**
         *以当前所有操作对象为上下文执
	 	 *行fn函数并返回当前pj对象
         **/
        each:function(fn,arg){//arg可选,如果没有arg则将当前操作对象的下标作为参数,在fn里面可以返回false停止迭代
            if(pj.isFunction(fn)){
                var brk=true;

                if(this.length<8){
                    for(var k=0;k<this.length&&brk!==false;k++)brk=fn.call(this[k],arg===undef?k:arg);
                }else{
                    var mod=this.length%8;
                    var cnt=(this.length-mod)/8,c=0,v;
                    do{//加速遍历
                        v=0+8*c;
                        brk=fn.call(this[v],arg===undef?v:arg);
                        if(brk===false)break;
                        v=1+8*c;
                        brk=fn.call(this[v],arg===undef?v:arg);
                        if(brk===false)break;
                        v=2+8*c;
                        brk=fn.call(this[v],arg===undef?v:arg);
                        if(brk===false)break;
                        v=3+8*c;
                        brk=fn.call(this[v],arg===undef?v:arg);
                        if(brk===false)break;
                        v=4+8*c;
                        brk=fn.call(this[v],arg===undef?v:arg);
                        if(brk===false)break;
                        v=5+8*c;
                        brk=fn.call(this[v],arg===undef?v:arg);
                        if(brk===false)break;
                        v=6+8*c;
                        brk=fn.call(this[v],arg===undef?v:arg);
                        if(brk===false)break;
                        v=7+8*c;
                        brk=fn.call(this[v],arg===undef?v:arg);
                        if(brk===false)break;
                        c++;
                    }while(c<cnt);
                    while(brk!==false&&mod>0){
                        v=this.length-mod;
                        brk=fn.call(this[v],arg===undef?v:arg);
                        mod--;
                    }
                }
            }

            return this;
        },

        /**
         *给当前对象集合添加事件监听器
		 *参数是一个对象，this总是指向当前DOM对象
		 *如 pj("selector").addListener({click:function([e]){……}})
         **/
        addListener:function(set){
            if(!pj.isObject(set))return this;
            for(var e in set){
                if(wnd.addEventListener) //非IE浏览器
                    this.each(function(){
                        this.addEventListener(e,set[e],false);
                    });
                else if (wnd.attachEvent)//IE浏览器
                    this.each(function(){
                        this.attachEvent("on"+e,pj.extend(this,set[e]));
                    });
            }
            return this;
        },
        attr:function(name/*[,value]*/){//只有一个参数并且不是对象则取属性值，有两个参数则设置属性值
            var set=[],arg=arguments;
            if(arg.length==1){
				if(pj.isObject(name)){//属性 Map
					for(var key in name){
						this.each(function(){this.setAttribute(key,name[key]+"");});
					}
					return this;
				}else{//get attribute
					this.each(function(){
						set.push(this.getAttribute(name+""));
					});
					return this.length==1?set[0]:set;
				}
            }
            else if(arg.length==2){//设置属性
                this.each(function(){
                    this.setAttribute(name+"",arg[1]+"");
                });
            }
            return this;
        },
        //删除指定的属性
        removeAttr:function(name){
            if(name)this.each(function(){
                this.removeAttribute(name);
            });
            return this;
        },
        /**
		 *停止当前特定的动画，参数是方法名
		 *如：pj("div").hide().stop("hide")//停止hide动画
		 *stop方法只能停止自己的动画而不能停止其他pj对象的动画
		 *每pj('selector')一次就创建一个pj对象
		 *也就是说如果对一些元素执行相反动画的话(比如在执行hide时要执行show)
		 *则用一个变量来保存当前的pj对象，用这个变量来调用hide和show方法就会彼此颉颃，互不冲突
		 *如: var obj=pj("div"); obj.hide(1000);setTimeout(function(){obj.show()},500)
		 *在hide动画完成之前调用show方法，这样调用就不会冲突；obj会先停止自己的hide动画然后再执行show动画
		 *如果是pj("div").hide(1000);setTimeout(function(){pj("div").show()},500)就会产生冲突
         **/
        stop:function(name){//name: 方法名
            if(name&&this.timer[name]){
                wnd.clearInterval(this.timer[name]);
                delete this.timer[name];
            }
            return this;
        },

        /**
         *将元素追加到指定的DOM元素,指定的参数可以是对象或ID
         **/
        appendTo:function(target){
            var t=doc.body;
            target=pj.id(target);
            if(target&&target.nodeType==1){
                t=target;
            }
            return this.each(function(){
                t.appendChild(this);
            });
        },
        //从DOM对象中删除元素
        remove:function(){
            return this.each(function(){
                try{
                    this.parentNode.removeChild(this);
                }catch(e){}
            });
        },
        //增加className,不会覆盖原来的
        addClass:function(name){
            if(name){
                name=" "+name+" ";
                this.each(function(){
					var cls=" "+pj.trim(this.className)+" ";
                    if(cls.indexOf(name)<0)this.className=pj.trim(cls+name);
                });
            }
            return this;
        },
        //删除指定的className，不会删除其他的
        removeClass:function(name){
            if(name){
                this.each(function(){
					var mc=" "+pj.trim(this.className)+" ";
                    this.className=pj.trim(mc.replace(new RegExp(" "+name+" ","g"),"")); 
                });
            }else{
				this.setClass("");
			}
            return this;
        },
        //清除之前所有的className并设置为指定的
        setClass:function(name){
            if(name!==undef){
                this.each(function(){
                    this.className=name;
                });
            }
            return this;
        },
        /**
		 *删除pj对象中指定的元素,下标从0开始
		 *indices可以是 all、odd、even、1-5、2-[删除下标为2和以后所有的元素]字符串或者是多个数字
		 *如 pj("div").cut("even").hide() [或者var obj=pj("div").cut("even");obj.hide()]
		 *删除下标为偶数的元素并隐藏下标为奇数的元素
		 *pj("div").cut("0-6").hide() 删除下标0-6的元素并隐藏其余的元素
		 *pj("div").cut("3-").hide() 删除下标为3和之后所有的元素并隐藏其余的元素
         **/
        cut:function(indices){
            var cache=[],shift=Array.prototype.shift,args=arguments,i;
            while(this.length>0)cache.push(shift.call(this));
            if(indices=="all")return this;//删除全部
            else if(indices=="odd"||indices=="even"){//删除下标为奇数或者偶数DOM对象
                for(i=0;i<cache.length;i++){
                    if(indices=="odd"&&i%2!=0){
                        cache[i]=undef;
                    }
                    else if(indices=="even"&&i%2==0){
                        cache[i]=undef;
                    }
                }
            }
            else if(/^\d+-(\d+)?$/.test(indices)){//形如 1-3、5-的字符串
                var end;
                indices=indices.split('-');
                indices[0]=parseInt(indices[0]);
                indices[1]=parseInt(indices[1]);
                if(isNaN(indices[0]))indices[0]=cache.length-1;
                if(isNaN(indices[1]))indices[1]=cache.length-1;
                i=Math.min(indices[0],indices[1]);
                end=Math.min(Math.max(indices[0],indices[1]),cache.length);
                for(;i<=end;i++){
                    if(cache[i])cache[i]=undef;
                }
            }
            else if(args.length>0){//多个数字 如: 0,2,5,4
                for(i=0;i<args.length;i++){
                    if(typeof args[i]==="number"&&cache[i])cache[args[i]]=undef;
                }
            }
            return pj.merge(this,cache);
        },

        /**
		 *以当前Pj对象为上下文每隔delay毫秒执行一次fn函数
		 *如果指定了duration则经过duration毫秒后停止，否则无终止执行
         **/
        step:function(fn,delay,duration){
            if(this.timer["step"]||!pj.isFunction(fn))return this;
            var start=new Date().getTime(),curTime,_this=this;
            if(!delay)delay=1000;
            this.timer["step"]=wnd.setInterval(function(){
                fn.call(_this);
                if(duration&&((new Date()).getTime()-start)>=duration)_this.stop("step");
            },delay);
            return this;
        },


        //将当前元素相对于指定的DOM元素设置位置，使居于指定元素中间；target为null则在窗口中间
        setLocationRelatedTo:function(target){
            var W,H;
            target=pj.id(target);
            if(!pj.isObject(target)){
                W=pj.windowWidth()*0.5;
                H=pj.windowHeight()*0.5;
                var left=pj.scrollLeft(),top=pj.scrollTop()-40;
                W+=left;
                H+=top;
            }
            else{
                W=pj.x(target)+pj.wh(target,"width")*0.5;
                H=pj.y(target)+pj.wh(target,"height")*0.5;
            }
            var w,h;
            return this.each(function(){
                w=W-pj.wh(this,"width")*0.5;
                h=H-pj.wh(this,"height")*0.5;
                pj.setStyle(this,{
                    "position":"absolute",
                    "left":w+"px",
                    "top":h+"px"
                });
            });

        },

        isVisible:function(){
            var buf=[];
            this.each(function(){
                buf.push(pj.getStyle(this,"display")!="none");
            });
            return buf.length==1?buf[0]:buf;
        },


        /**
		 *将当前元素根据target设置位置，
		 *pos是 left,right,top,bottom,left_top,left_bottom,right_top,right_bottom
		 *offsetX、offsetY 是相对于target的偏移量(像素),可选
         **/
        locate:function(target,pos,offsetX,offsetY){
            target=pj.id(target);
            if(pj.isObject(target)&&pos){
                var lt=0,tp=0;

                if(pos==pj.LEFT_POSITION||pos==pj.RIGHT_POSITION){
                    lt=pj.x(target);
                    if(offsetX){lt+=offsetX;}
					if(pos==pj.RIGHT_POSITION){lt+=pj.wh(target,"width");}
					return this.css({left:lt+"px"});
                }
                else if(pos==pj.TOP_POSITION||pos==pj.BOTTOM_POSITION){
                    tp=pj.y(target);
                    if(offsetY){tp+=offsetY;}
					if(pos==pj.BOTTOM_POSITION){tp+=pj.wh(target,"height");}
					return this.css({top:tp+"px"});
                }
                else if(pos==pj.LEFT_TOP_POSITION||pos==pj.LEFT_BOTTOM_POSITION){
                    lt=pj.x(target);
                    tp=pj.y(target);
                    if(offsetX){lt+=offsetX;}
                    if(offsetY){tp+=offsetY;}
					if(pos==pj.LEFT_BOTTOM_POSITION){tp+=pj.wh(target,"height");}
					return this.css({top:tp+"px",left:lt+"px"});
                }
                else if(pos==pj.RIGHT_TOP_POSITION||pos==pj.RIGHT_BOTTOM_POSITION){
                    lt=pj.x(target)+pj.wh(target,"width");
                    tp=pj.y(target);
                    if(offsetX){lt+=offsetX;}
                    if(offsetY){tp+=offsetY;}
					if(pos==pj.RIGHT_BOTTOM_POSITION){tp+=pj.wh(target,"height");}
					this.css({left:lt+"px",top:tp+"px"});
                }
            }
            return this;
        }


    };//end prototype

    //辅佐对象，仅在内部使用
    var js={
        /**
         *s是形如#id[,#id]……的字符串
         *并以c为上下文取对象,并放到a数组中
         **/
        id:function(s,c,a){
            s=s.split(",");
            var o;
            for(var i=0;i<s.length;i++){
                o=c.getElementById(s[i].replace(/^#/,""));
                if(o)a.push(o);
            }
            /****返回对象数组****/
            return a;
        },

        /****s是形如 [tag].className的字符串****/
        cname:function(s,c,a){
            s=s.split(".");
            s[0]=s[0].length>0?s[0]:"*";
            var x=c.getElementsByTagName(s[0]);
            s=pj.trim(s[1]);
			var indexOf=Array.prototype.indexOf||function(elem){
													for(var m=0;m<this.length;m++){
														if(this[m]==elem)return m;
													}
													return -1;
												};
            if(x.length==1){
                if(indexOf.call(x[0].className.split(/\s+/),s)>-1)a.push(x[0]);
            }
            else if(x.length>1){
                var pre,nxt;
                if(x.length%2==0){
                    nxt=x.length/2;
                    pre=nxt-1;
                }else{
                    pre=Math.floor(x.length*0.5);
                    if(indexOf.call(x[pre].className.split(/\s+/),s)>-1)a.push(x[pre]);
                    nxt=pre+1;
                    pre--;
                }
                while(pre>-1&&nxt<x.length){
                    if(indexOf.call(x[pre].className.split(/\s+/),s)>-1)a.unshift(x[pre]);
                    if(indexOf.call(x[nxt].className.split(/\s+/),s)>-1)a.push(x[nxt]);
                    pre--;
                    nxt++;
                }
            }

            /****返回对象数组****/
            return a;
        },

        /****t是标签****/
        tag:function(t,c,a){
            t=c.getElementsByTagName(t);
            /****返回对象数组****/
            return pj.merge(a,t);
        },

        /****str是形如 #id[.className|tag]... 的字符串****/
        query:function(str,c,a){
            str=str.split(",");
            for(var i=0;i<str.length;i++){
                if(/^#\w+$/.test(str[i])){
                    a=this.id(str[i],c,a);
                }
                else if(/^\w+$/.test(str[i])){
                    a=this.tag(str[i],c,a);
                }
                else if(/^\w*\.\w+$/.test(str[i])){
                    a=this.cname(str[i],c,a);
                }
            }
            return a;
        },

        /****通过属性过滤元素****/
        fattr:function(str,c,to){
            //alert(str);
            str=str.split("[");
            var attr=str[1].replace(/\]$/,"").split(","),set=[],j,b,hit;
            /****str[0]是形如#id|tag|.className...[attr=vlaue]的字符串****/
            set=this.query(str[0],c,set);
            for(var i=0;i<set.length;i++){
                hit=true;

                for(j=0;j<attr.length;j++){
                    b=pj.trim(attr[j]).split("=");
					b[1]=pj.trim(b[1]).replace(/^('|")+|('|")+$/g,"");
                    try{
                        if((set[i].getAttribute(b[0])+"")!=b[1]){
                            hit=false;
                            break;
                        };
                    }catch(e){
                        break;
                    }
                }
                if(hit)to.push(set[i]);
            }
        },

        /**
         *通过下标过滤元素
         *str是形如 0,2,5……的字符串
         *并从src中选择符合条件的元素复制到to中
         **/
        findex:function(str,src,to){
            str=str.split(",");
            for(var l=0;l<str.length;l++){
                str[l]=parseInt(str[l]);
                if(str[l]<src.length)to.push(src[str[l]]);
            }
        }
    };



    /**
     *locate中的pos参数
     **/
    pj.LEFT_POSITION="left";
    pj.RIGHT_POSITION="right";
    pj.TOP_POSITION="top";
    pj.BOTTOM_POSITION="bottom";
    pj.LEFT_TOP_POSITION="left_top";
    pj.LEFT_BOTTOM_POSITION="left_bottom";
    pj.RIGHT_TOP_POSITION="right_top";
    pj.RIGHT_BOTTOM_POSITION="right_bottom";

    /**
     *将pj的prototype赋给pj.prototype.init的prototype
     *这样返回的pj对象就会继承pj.prototype对象中所有的方法
     **/
    pj.prototype.init.prototype=pj.prototype;

    pj.ready=function(fn){//当页面加载完成时调用fn
        if(doc.getElementById&&doc.getElementsByTagName)fn();
        else setTimeout(function(){
            pj.ready(fn);
        },100);
    };

    /**
     *target将继承方法fn并且fn的上下文是target
     **/
    pj.extend=function(target,fn){
        return function(){
            return fn.apply(target,arguments);
        };
    };

    /**
     *将一个对象中的属性或方法绑定到指定对象，如果只有一个参数则绑定到pj对象
     *也可以通过这个方法自己扩展pj对象
     *如 pj.prototype.bind({method:function(){this.each(){alert(this.nodeName)}}[......]})
     *这样就可以绑定多个方法到pj对象作用域上,而且所有的pj对象都可以调用
     *上面的方法可以这样调用: pj("div").method()
     **/
    pj.bind=pj.prototype.bind=function(){
        var tar,src;
        if(arguments.length>1){
            src=arguments[1];
            tar=arguments[0];
        }
        else if(arguments.length==1){
            tar=this;
            src=arguments[0];
        }
        else {
            tar={};
            src={};
        }
        for(var e in src){
            tar[e]=src[e];
        }
        return tar;
    };



    pj.bind(pj,{//绑定一般方法
        /****判断是否是正常的对象或DOM对象****/
        isObject:function(t){
            if(t===null||t===undef)return false;
            return typeof t==="object"
            &&(Object.prototype.toString.call(t)==="[object Object]"
                ||typeof t.nodeType==="number");
        },

        /****判断fn是否是一个函数****/
        isFunction:function(fn){
            return Object.prototype.toString.call(fn)==="[object Function]"
        },

        /****判断t是否是一个数组****/
        isArray:function(t){
            return Object.prototype.toString.call(t)==="[object Array]";
        },

        /****判断字符串****/
        isString:function(t){
            return Object.prototype.toString.call(t)==="[object String]"
        },

        /****去除str中所有的空格****/
        trimAll:function(str){
            return str.replace(/\s+/g,"");
        },
		
		/**去除str中两边空格**/
		trim:function(str){
			return str.replace(/^\s+|\s+$/g,"");
		},

        /****将src中的数据整合到tar中****/
        merge: function( tar,src ) {
            tar.length=tar.length||0;
            var push=Array.prototype.push,unshift=Array.prototype.unshift;

            if(src.length==1&&src[0]){
                push.call(tar,src[0]);
            }
            else if(src.length>1){
                var pre,nxt;
                if(src.length%2==0){
                    nxt=src.length*0.5;
                    pre=nxt-1;
                }else{
                    pre=Math.floor(src.length*0.5);
                    if(src[pre])push.call(tar,src[pre]);
                    nxt=pre+1;
                    pre--;
                }
                while(pre>-1&&nxt<src.length){
                    if(src[pre])unshift.call(tar,src[pre]);
                    if(src[nxt])push.call(tar,src[nxt]);
                    pre--;
                    nxt++;
                }
            }

            return tar;
        },
        getStyle:function(obj,name){
            /**
             *处理IE取opacity,Opera、Safari、Chrome也有filter
             **/
            if(/opacity/i.test(name)&&("filter" in obj.style)&&isIE){
                var a= obj.currentStyle.filter+"",v;
                v=a.toLowerCase().indexOf("opacity=");
                v=v>=0?(parseFloat(a.substring(v+8))):100;
                return v*0.01;
            }else if(/float/i.test(name)){
				return obj.style[("styleFloat" in obj.style)?"styleFloat":"cssFloat"];
			}
            else if(obj.style[name])//如果属性存在，那么它已被设置
                return obj.style[name];
            else if(obj.currentStyle)//尝试用IE方法
                return obj.currentStyle[name];
            else if(wnd.getComputedStyle)
                return wnd.getComputedStyle(obj,null)[name];//W3C
            else return null;
        },
        setStyle:function(obj,source){
            for(var v in source){
                if(/opacity/i.test(v))pj.setOpacity(obj,parseFloat(source[v]));
				else if(/float/i.test(v)){
					obj.style[("styleFloat" in obj.style)?"styleFloat":"cssFloat"]=source[v];
				}
                else obj.style[v]=source[v];
            }
        },

        mouseX:function(e){
            return e&&e.pageX||(wnd.event.clientX+pj.scrollLeft());
        },
        mouseY:function(e){
            return e&&e.pageY||(wnd.event.clientY+pj.scrollTop());
        }
    });

    pj.prototype.bind({
		/**
		 *设置或取元素样式
		 *当只有一个参数并且为对象则设置样式，为字符串则取样式
		 *参数个数大于1则设置样式
		 **/
		css:function(n){
			if(arguments.length==1){
				if(pj.isObject(n)){//设置样式,可以是对象
					return this.each(function(){pj.setStyle(this,n);});
				}else{//取元素样式值
					var st=[];
					this.each(function(){
						st.push(pj.getStyle(this,n));
					});
					//如果对象集合长度为1则返回属性值，否则返回属性值数组
					return st.length==1?st[0]:st;
				}
			}else if(arguments.length>1){//设置样式
				var s={};
				s[n]=arguments[1]||'';
				return this.each(function(){pj.setStyle(this,s);});
			}
			return this;
		}
    });

    /**
	 *添加事件监听器的快捷方式
	 *可以链式调用
	 **/
    pj.prototype.bind({
        abort:function(fn){
            return this.addListener({"abort":fn});
        },
        blur:function(fn){
            if(pj.isFunction(fn)){
                return this.addListener({"blur":fn});
            }
            else{
                var tInd=typeof fn=="number"?fn:-1;
				if(tInd>-1){
					return this.each(function(index){
						if(this.blur&&tInd==index){
							this.blur();
							return false;
						}
					});
				}else{
					return this.each(function(){
						if(this.blur)this.blur();
					});
				}
            }
        },
        change:function(fn){
			return this.addListener({"change":fn});
        },
        click:function(fn){
            if(pj.isFunction(fn)){
                return this.addListener({"click":fn});
            }else{
                var i=typeof fn=="number"?fn:-1;
                if(i>-1){
					return this.each(function(index){
						if(this.click&&i==index){
							this.click();
							return false;
						}
					});
				}else{
					return this.each(function(){
						if(this.click)this.click();
					});
				}
            }
        },
        dblclick:function(fn){
            return this.addListener({"dblclick":fn});
        },
        error:function(fn){
            return this.addListener({"error":fn});
        },
        focus:function(fn){
            if(pj.isFunction(fn)){
                return this.addListener({"focus":fn});
            }else{
                var i=typeof fn=="number"?fn:-1;
                if(i>-1){
					return this.each(function(index){
						if(this.focus&&i==index){
							this.focus();
							return false;
						}
					});
				}else{
					return this.each(function(){
						if(this.focus)this.focus();
					});
				}
            }
        },
        keydown:function(fn){
            return this.addListener({"keydown":fn});
        },
        keypress:function(fn){
            return this.addListener({"keypress":fn});
        },
        keyup:function(fn){
            return this.addListener({"keyup":fn});
        },
        load:function(fn){
            return this.addListener({"load":fn});
        },
        unload:function(fn){
            return this.addListener({"unload":fn});
        },
        mousedown:function(fn){
            return this.addListener({"mousedown":fn});
        },
        mousemove:function(fn){
            return this.addListener({"mousemove":fn});
        },
        mouseout:function(fn){
            return this.addListener({"mouseout":fn});
        },
        mouseover:function(fn){
            return this.addListener({"mouseover":fn});
        },
        mouseup:function(fn){
            return this.addListener({"mouseup":fn});
        },
        reset:function(fn){
            if(pj.isFunction(fn)){
                return this.addListener({"reset":fn});
            }else{
                var i=typeof fn=="number"?fn:-1;
                if(i>-1){
					return this.each(function(index){
						if(this.reset&&i==index){
							this.reset();
							return false;
						}
					});
				}else{
					return this.each(function(){
						if(this.reset)this.reset();
					});
				}
            }
        },
        resize:function(fn){
            return this.addListener({"resize":fn});
        },
        select:function(fn){
            if(pj.isFunction(fn)){
                return this.addListener({"select":fn});
            }else{
                var i=typeof fn=="number"?fn:-1;
                if(i>-1){
					return this.each(function(index){
						if(this.select&&i==index){
							try{this.select();}catch(ig){}
							return false;
						}
					});
				}else{
					return this.each(function(){
						if(this.select)try{this.select();}catch(ig){};
					});
				}
            }
        },
        submit:function(fn){
            if(pj.isFunction(fn)){
                return this.addListener({"submit":fn});
            }else{
                var i=typeof fn=="number"?fn:-1;
                if(i>-1){
					return this.each(function(index){
						if(this.submit&&i==index){
							this.submit();
							return false;
						}
					});
				}else{
					return this.each(function(){
						if(this.submit)this.submit();
					});
				}
            }
        }
    });

	
	//以下这一段摘自javascript权威指南第五版
	if (wnd.innerWidth) { // 除IE外的所有浏览器
		pj.windowWidth = function( ) { return wnd.innerWidth; };//取得浏览器视窗的高度
		pj.windowHeight = function( ) { return wnd.innerHeight; };//取得浏览器视窗的宽度
		pj.scrollLeft = function( ) { return wnd.pageXOffset; };//滚动隐藏的宽度
		pj.scrollTop= function( ) { return wnd.pageYOffset; };//滚动隐藏的高度
	}else if (doc.documentElement&&doc.documentElement.clientWidth) {
		//这些方法是用于带有DOCTYPE声明的IE6的
		pj.windowWidth =function() { return doc.documentElement.clientWidth; };
		pj.windowHeight =function() { return doc.documentElement.clientHeight; };
		pj.scrollLeft=function() { return doc.documentElement.scrollLeft; };
		pj.scrollTop =function() { return doc.documentElement.scrollTop; };
	}else{
		// 这些是用于没有DOCTYPE声明的IE4/5/6的
		pj.windowWidth =function() { return doc.body.clientWidth; };
		pj.windowHeight =function() { return doc.body.clientHeight; };
		pj.scrollLeft =function() { return doc.body.scrollLeft; };
		pj.scrollTop =function() { return doc.body.scrollTop; };
	}
	
	
	if (doc.documentElement && doc.documentElement.scrollWidth) {
		pj.pageWidth =function( ) { return doc.documentElement.scrollWidth; };//取得当前页面潜在的宽度
		pj.pageHeight =function( ) { return doc.documentElement.scrollHeight; };//取得当前页面潜在的高度
	}else{
		pj.pageWidth =function( ) { return doc.body.scrollWidth; };
		pj.pageHeight =function( ) { return doc.body.scrollHeight; };
	}
	//end


	
	
	

    //这样定义方便选择
    pj.stopBubble=function(e){//事件发生时停止冒泡
        if(e&&e.stopPropagation)e.stopPropagation();//W3C
        else wnd.event.cancelBubble=true;//IE
    };
    pj.stopDefault=function(e){//停止浏览器的默认动作
        if(e&&e.preventDefault)e.preventDefault();//W3C
        else wnd.event.returnValue=false;//IE
        return false;
    };
    pj.setOpacity=function(t,v){//设置透明度(0~1)
        //在IE里如果不行,就把position设为absolute或者将display设为block
		//虽说IE9支持opacity,但经测试发现有一点小bug,还是先用filter保险一点
        if("filter" in t.style&&isIE){
			t.style.filter="alpha(opacity="+(v*100)+")";
			if(!t.currentStyle.hasLayout)t.style.zoom =1;
		}else{
			t.style.opacity=v;
		}
    };
    pj.enableDrag=function(trigger,target){//在trigger上允许拖动target
        trigger=pj.id(trigger);
        target=pj.id(target);

        trigger.onmousedown=function(e){
            var x=pj.x(target),y=pj.y(target),mx=pj.mouseX(e),my=pj.mouseY(e);
            doc.onmousemove=function(me){
				if(wnd.getSelection)wnd.getSelection().removeAllRanges();
				else if(doc.selection)doc.selection.empty();
                pj.setStyle(target,{
                    left:x+pj.mouseX(me)-mx+"px",
                    top:y+pj.mouseY(me)-my+"px"
                });
            };
            doc.onmouseup=function(e){
                doc.onmousemove=null;
            };
        };

    };

    //将表单序列化为查询字符串,用于Ajax
    pj.parseToQueryString=function(form){
        if(!pj.isObject(form)||!form.elements)return "";
        var buf={},rs=[],
        getValue=function(field){
            var name=field.nodeName.toLowerCase();
            var type=(field.getAttribute("type")+"").toLowerCase();
            if(name.indexOf("select")>-1){
                var v=[];
                for(var i=0;i<field.options.length;i++){
                    if(field.options[i].selected)v.push(field.options[i].value);
                }
                return v.join("&"+field.getAttribute("name")+"=");
            }else if(name.indexOf("textarea")>-1){
                return field.value;
            }else{
                if(type.indexOf("radio")>-1||type.indexOf("checkbox")>-1){
                    return field.checked?field.value:false;
                }else{
                    return field.value;
                }
            }
            return false;
        };

        var n,fv;
        for(var i=0;i<form.elements.length;i++){
            n=form.elements[i].getAttribute("name");
            if(!buf[n])buf[n]=[];
            fv=getValue(form.elements[i]);
            if(fv!==false)buf[n].push(fv);
        }

        for(n in buf){
            rs.push(n+"="+buf[n].join("&"+n+"="));
        }

        return rs.join("&");

    };

    /****判断child是否是parent的子节点****/
    pj.isContain=function(parent,child){
        if(!parent||!child)return false;//有一个为null或者为undefined则返回false
        if(!pj.isObject(parent)||!child.parentNode)return false;
        if(parent==child)return false;
        var p=child.parentNode;
        while(p){
            if(p==parent)return true;
            p=p.parentNode;
        }
        return false;
    };
    pj.id=function(id){
        return pj.isObject(id)?id:doc.getElementById(id)
    };

    pj.tag=function(tag,context){
        return (context||doc).getElementsByTagName(tag);
    };

    pj.bind(pj,{//绑定通用的方法
        resetCSS:function(obj,p){
            var old={};
            for(var i in p){
                old[i]=obj.style[i];//保存旧值
                obj.style[i]=p[i];//设置新值
            }
            return old;//用来复原
        },
        x:function(obj){//取元素相对于整个页面的x坐标,除去marginLeft,不算border
            var p=obj.offsetParent,v=obj.offsetLeft,m=parseInt(pj.getStyle(obj,"marginLeft"));
            if(isNaN(m))m=0;
            v-=m;
            while(p){
                v+=p.offsetLeft;
                m=parseInt(pj.getStyle(p,"marginLeft"));
                if(isNaN(m))m=0;
                v-=m;
                p=p.offsetParent;
            }
            return v+m;
        },
        y:function(obj){//取元素相对于整个页面的y坐标,除去marginTop,不算border
            var p=obj.offsetParent,v=obj.offsetTop,m=parseInt(pj.getStyle(obj,"marginTop"));
            if(isNaN(m))m=0;
            v-=m;
            while(p){
                v+=p.offsetTop;
                m=parseInt(pj.getStyle(p,"marginTop"));
                if(isNaN(m))m=0;
                v-=m;
                p=p.offsetParent;
            }
            return v+m;
        },
        wh:function(obj,name)//取元素的高度或宽度 var width=pj.wh(obj,"width")
        {
            var v;
            if(pj.getStyle(obj,"display")!="none")
            {
                if(name=="height")v=obj.offsetHeight
                    ||parseInt(pj.getStyle(obj,"height"));
                else if(name=="width")v=obj.offsetWidth
                    ||parseInt(pj.getStyle(obj,"width"));
                return isNaN(v)?0:v;
            }
            var old=pj.resetCSS(
                obj,{
                    display:'block',
                    visibility:'hidden',
                    position:'absolute'
                });
            if(name=="height")v=obj.clientHeight||pj.wh(obj,"height");
            else if(name=="width")v=obj.clientWidth||pj.wh(obj,"width");
            pj.setStyle(obj,old);
            return v;
        }//end wh
    });


    pj.prototype.bind({//绑定取元素尺寸方法
        left:function(){//取得元素想对于整个文档的X位置
            var set=[];
            this.each(function(){
                set.push(pj.x(this));
            });
            return this.length==1?set[0]:set;
        },
        top:function(){//取得元素想对于整个文档的Y位置
            var set=[];
            this.each(function(){
                set.push(pj.y(this));
            });
            return this.length==1?set[0]:set;
        },
        right:function(){
            var set=[];
            this.each(function(){
                set.push(pj.x(this)+pj.wh(this,"width"));
            });
            return this.length==1?set[0]:set;
        },
        bottom:function(){
            var set=[];
            this.each(function(){
                set.push(pj.y(this)+pj.wh(this,"height"));
            });
            return this.length==1?set[0]:set;
        },
        height:function(){//元素高度
            var set=[];
            this.each(function(){
                set.push(pj.wh(this,"height"));
            });
            return this.length==1?set[0]:set;
        },
        width:function(){//元素宽度
            var set=[];
            this.each(function(){
                set.push(pj.wh(this,"width"));
            });
            return this.length==1?set[0]:set;
        }
    });
	
	/**
	 *处理文本函数
	 **/
	pj.prototype.bind({
		/**
		 *操作innerHTML
		 *如果有参数就设置innerHTML并覆盖原来的,返回pj对象
		 *没有则返回innerHTML
		 **/
		html:function(v){
			if(v===undef){//取innerHTML
				var hs=[];
				this.each(function(){hs.push(this.innerHTML);});
				return hs.length==1?hs[0]:hs;
			}else{
				return this.each(function(){this.innerHTML=v;});
			}
		},
		
		/**
		 *操作文本，有参数则创建TextNode并append到匹配元素上
		 *没有参数则遍历所有的childNode，返回所有匹配元素的所有子节点的文本
		 *理论上兼容XML,但没测试
		 **/
		text:function(v){
			if(v===undef){//取文本
				var ts=[],gv=function(ns,to){
							if(!ns)return;
							for(var c=0;c<ns.length;c++){
								if(ns[c].nodeType==3){//文本节点
									to.push(ns[c].nodeValue);
								}else if(ns[c].nodeType==1){
									gv(ns[c].childNodes,to);
								}
							}
						};
						
				this.each(function(){
					var mn=[];
					gv(this.childNodes,mn);
					ts.push(mn.join(""));
				});
				
				return ts.length==1?ts[0]:ts;
			}else{//添加文本,不会覆盖原来的
				return this.each(function(){
					this.appendChild(doc.createTextNode(v));
				});
			}
		},
		
		/**
		 *清空所有匹配元素的子节点
		 **/
		empty:function(){
			return this.each(function(){
				if(this.nodeType!=1)return;
				while(this.childNodes&&this.childNodes.length>0){
					var ns=this.childNodes;
					for(var i=0;i<ns.length;i++){
						this.removeChild(ns[i]);
					}
				}
			});
		}
	});

    /**
     *通过当前操作对象保存自身的最初宽度和高度，而且只设置一次，不会删除
     **/
    function check(cur){
        if(!cur.getAttribute("pjheight"))cur.setAttribute("pjheight",pj.wh(cur,"height"));
        if(!cur.getAttribute("pjwidth"))cur.setAttribute("pjwidth",pj.wh(cur,"width"));
    }
    function setDisplay(cur){
        //设置最初的display,为none则设置为block,不会删除
        if(!cur.getAttribute("pjdisplay")){
            var display=pj.getStyle(cur,"display");
            cur.setAttribute("pjdisplay",display=="none"?"block":display);
        }
    }


    //实现动画每个属性的渲染器 ，attr属性名、value: 最终值
    function render(target,attr,value,alg){

        this.t=target;//渲染对象
        this.name=pj.trimAll(attr);//属性名
        this.unit="px";			//默认单位
        this.alg=alg&&pj.isFunction(alg)?alg:tween.quad.easeInOut;//tween算法
        var v,overflow="",
        pos=pj.getStyle(this.t,"position"),
        display=pj.getStyle(this.t,"display");

        if(/^left$/i.test(this.name)||/^top$/i.test(this.name)){
            pos=pos=="relative"?pos:"absolute";
            var left,top,setBoth=false;
            if(pos=="relative"||pj.getStyle(this.t.parentNode,"position")=="relative"){
                left=parseInt(pj.getStyle(this.t,"left"));
                top=parseInt(pj.getStyle(this.t,"top"));
                if(isNaN(left))left=0;//handle auto
                if(isNaN(top))top=0;//handle auto
            }
            else{
                left=pj.x(this.t);
                top=pj.y(this.t);
                setBoth=true;
            }

            if(/^left$/i.test(this.name)){
                v=left;
                if(setBoth)pj.setStyle(this.t,{
                    "left":left+this.unit,
                    "top":top+this.unit
                });
                else pj.setStyle(this.t,{
                    "left":left+this.unit
                });
            }
            else {
                v=top;
                if(setBoth)pj.setStyle(this.t,{
                    "left":left+this.unit,
                    "top":top+this.unit
                });
                else pj.setStyle(this.t,{
                    "top":top+this.unit
                });
            }
        }
        else if(/^width$/i.test(this.name)||/^height$/i.test(this.name)){
            overflow="hidden";
            if(/^width$/i.test(this.name))v=pj.wh(this.t,"width");
            else v=pj.wh(this.t,"height");
            //height或者width动画并且可见则设置display为block
            display=display=="none"?display:"block";
        }
        else v=parseInt(pj.getStyle(this.t,this.name));
        this.begin=(isNaN(v))?0:v;//开始值

        if(typeof value==="number")this.span=value-this.begin;//变化区间
        else if(pj.isString(value)){
            value=pj.trimAll(value);
            var spt=/^([+-]=)?([\d+-.]+)(.*)$/.exec(value);//分析类似于 +=200px、-=150%的字符串
            if(spt[1]=="+=")this.span=parseInt(spt[2]);
            else if(spt[1]=="-=")this.span=-parseInt(spt[2]);
            else this.span=parseInt(spt[2])-this.begin;
            if(spt[3]&&spt[3]!="")this.unit=spt[3];
        }
        else this.span=0;
        //alert(this.begin+this.span);
        pj.setStyle(this.t,{
            "position":pos,
            "overflow":overflow,
            "display":display
        });

    //alert(this.t.id+"->"+ this.name+": b="+this.begin+"; e="+(this.begin+this.span));
    }
    render.prototype.next=function(t,d){	//下一帧动画
        this.t.style[this.name]=Math.round(this.alg(t,this.begin,this.span,d))+this.unit;
    };

    function opacity(target,value){
        this.t=target;//渲染对象
        var v=parseFloat(pj.getStyle(this.t,"opacity"));//取当前透明度
        if(!this.t.getAttribute("pjopacity")){
            this.t.setAttribute("pjopacity",v+"");
        }

        this.begin=v;
        if(typeof value==="number")this.span=value-this.begin;
        else if(pj.isString(value)){
            value=pj.trimAll(value);
            var spt=/^([+-]=)?([\d+-.]+)(.*)$/.exec(value);
            if(spt[1]=="+=")this.span=parseInt(spt[2]);
            else if(spt[1]=="-=")this.span=-parseInt(spt[2]);
            else this.span=parseInt(spt[2])-this.begin;
        }
        else this.span=0;//不做任何事
		this.begin*=100;
		this.span*=100;
    }
    opacity.prototype.next=function(t,d){
        pj.setOpacity(this.t,Math.round(tween.linear(t,this.begin,this.span,d))*0.01);
    };


    pj.prototype.bind({//绑定效果方法

        /**
         *自定义动画
         *styleSet:属性集合[如:{left:"+=80px",top:"-=33",width:330}]
         *duration:效果时长,可以为一个对象。必须包括duration,effect属性;其中effect又可以是对象
         *effect指定使用哪个tween算法；若是对象则为每一个属性的动画指定相应的tween算法
         *fn:完成后的回调函数
         *hide:完成后是否隐藏元素
         *如: pj("#id").animate({width:100,left:-10,top:50},800)
         *或：pj("#id").animate(
         *                      {width:100,left:-10,top:50},
         *                      {duration:800,effect:tween.quad.easeIn}
         *                      )
         *或：pj("#id").animate(
         *                      {width:100,left:-10,top:50},
         *                      {duration:800,effect:{
         *                                              width:tween.quad.easeIn,
         *                                              left:tween.cubic.easeOut,
         *                                               top:tween.quint.easeInOut
         *                                               }
         *                       }
         **/
        animate:function(styleSet,duration/*effect*/,fn,hide){
            var i,j,
            operator=[],//保存进行加工对象的集合(操作集合)
            name=arguments[4]||"animate",//动画方法名,方便stop
            v,
            eft={},
            d,
            t=0,//tween的时间算子
            cur=this;//当前pj对象的引用
            if(this.timer[name])return this;
            if(pj.isObject(duration)){
                //默认效果时长为400毫秒因为每十毫秒执行一帧动画,所以除十
                d=(duration.duration||400)*0.1;
                eft=duration.effect||tween.quad.easeInOut;
            }else{
                d=(duration||400)*0.1;
            }

            fn=fn||function(){};
            for(i=0;i<this.length;i++){
                setDisplay(this[i]);	//设置最初display
                check(this[i]);	//设置最初高度和宽度
                for(var e in styleSet){
                    v=pj.isArray(styleSet[e])?styleSet[e][i]:styleSet[e];//属性值可以是数组
                    if(/opacity/i.test(e)){//分开处理目的是为了提高速度,减少判断
                        operator.push(new opacity(this[i],v));
                    }
                    else{
                        operator.push(new render(this[i],e,v,eft[e]||eft));
                    }
                }
            }

            var mid={
                next:function(){}
            };
            if(operator.length%2!=0){
                mid=operator[Math.floor(operator.length*0.5)];
            }
            this.timer[name]=wnd.setInterval(function(){
                t++;	//每进行一帧则将t算子加1
                i=0;
                j=operator.length-1;
                //执行动画的下一帧
                mid.next(t,d);
                while(i<j){//折半遍历
                    operator[i].next(t,d);
                    operator[j].next(t,d);
                    i++;
                    j--;
                }

                if(t>=d){//动画完成
                    cur.stop(name);
                    if(hide)cur.css({display:"none"});
                    else{		//完成后不隐藏则恢复原来的display
                        cur.each(function(){
                            this.style.display=this.getAttribute("pjdisplay")||"block";
                        });
                    }
                    fn.call(cur);/****以当前对象为上下文执行回调函数****/
                }
            },10);//每10毫秒执行一帧动画

            return this;
        },//end animate

        /**
		 *参数都可选;h:最终位置或者是类似于+=22或-=55等的字符串
		 *如果元素的高度(或者宽度)需要随需要变化，比如一个DIV要动态地接收来自Ajax的返回内容
		 *则在动画之前先将pjheight(或者pjwidth)属性删除，然后添加内容，再进行动画
		 *用法类似于 pjObj.removeAttr("pjheight").css({"height":"auto"}).get(0).innerHTML=content;
		 *pjObj.slideDown();
         **/
        slideDown:function(duration,h,fn){//duration可以是对象,解释请参考animate方法参数
            //如果当前pj对象正在slideDown则返回
            if(this.timer["slideDown"])return this;
            var vs=[];//保存各个元素的最初高度

            /**
             *如果对一些元素执行相反动画的话(比如在执行slideDown时要执行slideUp)
             *则用一个变量来保存当前的pj对象，用这个变量来调用slideDown和slideUp方法
             *就会彼此颉颃，互不冲突  如: var obj=pj("div");
             *obj.slideDown(1000);setTimeout(function(){obj.slideUp()},500)
             *在slideDown动画完成之前调用slideUp方法，这样调用就不会冲突；
             *obj会先停止自己的slideDown动画然后再执行slideUp动画
             **/
            return this.stop("slideUp").each(function(){
                check(this);
                setDisplay(this);
                vs.push(parseInt(this.getAttribute("pjheight")));
                if(pj.getStyle(this,"display")=="none")
                    pj.setStyle(this,{
                        "height":"0px",
                        "display":"block"
                    });
            }).animate({
                "height":h||vs
            },duration,fn,false,"slideDown");
        },

        //参数都可选;h:最终位置或者是类似于+=22或-=55等的字符串
        slideUp:function(duration,h,fn){//duration可以是对象,解释请参考animate方法参数
            if(this.timer["slideUp"])return this;//如果当前pj对象正在slideUp则返回
            h=h||0;
            return this.stop("slideDown").animate({
                "height":h
            },duration,fn,h<=0,"slideUp");
        },

        //参数都可选;w:最终位置或者是类似于+=22或-=55等的字符串
        slideRight:function(duration,w,fn){//duration可以是对象,解释请参考animate方法参数
            if(this.timer["slideRight"])return this;//如果当前pj对象正在slideRight则返回
            var vs=[];//保存各个元素的最初宽度

            /**
             *如果对一些元素执行相反动画的话(比如在执行slideRight时要执行slideLeft)
             *则用一个变量来保存当前的pj对象，用这个变量来调用slideRight和slideLeft方法
             *就会彼此颉颃，互不冲突  如: var obj=pj("div");
             *obj.slideRight(1000);setTimeout(function(){obj.slideLeft()},500)
             *在slideRight动画完成之前调用slideLeft方法，这样调用就不会冲突；
             *obj会先停止自己的slideRight动画然后再执行slideLeft动画
             **/
            return this.stop("slideLeft").each(function(){
                check(this);
                setDisplay(this);
                vs.push(parseInt(this.getAttribute("pjwidth")));
                if(pj.getStyle(this,"display")=="none")
                    pj.setStyle(this,{
                        "width":"0px",
                        "display":"block"
                    });
            }).animate({
                "width":w||vs
            },duration,fn,false,"slideRight");
        },

        //参数都可选;w:最终位置或者是类似于+=22或-=55等的字符串
        slideLeft:function(duration,w,fn){//duration可以是对象,解释请参考animate方法参数
            if(this.timer["slideLeft"])return this;//如果当前pj对象正在slideLeft则返回
            w=w||0;
            return this.stop("slideRight").animate({
                "width":w
            },duration,fn,w<=0,"slideLeft");
        },

        //参数都可选;h:最终位置或者是类似于+=22或-=55等的字符串
        scrollDown:function(duration,h,fn){//duration可以是对象,解释请参考animate方法参数
            if(this.timer["scrollDown"])return this;//如果当前pj对象正在scrollDown则返回
            if(!h){
                h=[];
                this.each(function(){
                    h.push(pj.windowHeight()-pj.wh(this,"height"));
                });
            };
            /**
             *如果对一些元素执行相反动画的话(比如在执行scrollDown时要执行scrollUp)
             *则用一个变量来保存当前的pj对象，用这个变量来调用scrollDown和scrollUp方法
             *就会彼此颉颃，互不冲突  如: var obj=pj("div");
             *obj.scrollDown(1000);setTimeout(function(){obj.scrollUp()},500)
             *在scrollDown动画完成之前调用scrollUp方法，这样调用就不会冲突；
             *obj会先停止自己的scrollDown动画然后再执行scrollUp动画
             **/
            return this.stop("scrollUp").animate({
                "top":h
            },duration,fn,false,"scrollDown");
        },

        //参数都可选;h:最终位置或者是类似于+=22或-=55等的字符串
        scrollUp:function(duration,h,fn){//duration可以是对象,解释请参考animate方法参数
            if(this.timer["scrollUp"])return this;
            h=h||0;
            return this.stop("scrollDown").animate({
                "top":h
            },duration,fn,false,"scrollUp");
        },

        //参数都可选;w:最终位置或者是类似于+=22或-=55等的字符串
        scrollRight:function(duration,w,fn){//duration可以是对象,解释请参考animate方法参数
            if(this.timer["scrollRight"])return this;
            if(!w){
                w=[];
                this.each(function(){
                    w.push(pj.windowWidth()-pj.wh(this,"width"));
                });
            };
            /**
             *如果对一些元素执行相反动画的话(比如在执行scrollRight时要执行scrollLeft)
             *则用一个变量来保存当前的pj对象，用这个变量来调用scrollRight和scrollLeft方法
             *就会彼此颉颃，互不冲突  如: var obj=pj("div");
             *obj.scrollRight(1000);setTimeout(function(){obj.scrollLeft()},500)
             *在scrollRight动画完成之前调用scrollLeft方法，这样调用就不会冲突；
             *obj会先停止自己的scrollRight动画然后再执行scrollLeft动画
             **/
            return this.stop("scrollLeft").animate({
                "left":w
            },duration,fn,false,"scrollRight");
        },

        //参数都可选;w:最终位置或者是类似于+=22或-=55等的字符串
        scrollLeft:function(duration,w,fn){//duration可以是对象,解释请参考animate方法参数
            if(this.timer["scrollLeft"])return this;
            w=w||0;
            return this.stop("scrollRight").animate({
                "left":w
            },duration,fn,false,"scrollLeft");
        },
        //参数都可选
        hide:function(duration,fn){//duration可以是对象,解释请参考animate方法参数
            if(this.timer["hide"])return this;
            /**
             *如果对一些元素执行相反动画的话(比如在执行hide时要执行show)
             *则用一个变量来保存当前的pj对象，用这个变量来调用hide和show方法就会彼此颉颃，互不冲突
             *如: var obj=pj("div"); obj.hide(1000);setTimeout(function(){obj.show()},500)
             *在hide动画完成之前调用show方法，这样调用就不会冲突；
             *obj会先停止自己的hide动画然后再执行show动画
             *如果是pj("div").hide(1000);setTimeout(function(){pj("div").show()},500)
             *就会产生冲突
             **/
            return this.stop("show").each(
                function(){
                    //pjopacity只设置一次而且不会删除
                    if(!this.getAttribute("pjopacity")){//用当前DOM对象记录自己最初的opacity值
                        this.setAttribute("pjopacity",pj.getStyle(this,"opacity")+"");
                    }
                }).animate({
                "width":0,
                "height":0,
                "opacity":0
            },duration,fn,true,"hide");
        },

        //参数都可选
        show:function(duration,fn){//duration可以是对象,解释请参考animate方法参数
            if(this.timer["show"])return this;
            var opu=[],w=[],h=[],value;
            return this.stop("hide").each(
                function(){
                    check(this);		//设置pjwidth和pjheight
                    setDisplay(this);
                    w.push(parseInt(this.getAttribute("pjwidth")));
                    h.push(parseInt(this.getAttribute("pjheight")));
                    value=this.getAttribute("pjopacity")
                    if(value){
                        value=parseFloat(value);
                    }
                    else{
                        value=parseFloat(pj.getStyle(this,"opacity"));
                        this.setAttribute("pjopacity",value+"");//pjopacity只设置一次而且不会删除
                    }
                    opu.push(value)

                    if(pj.getStyle(this,"display")=="none")
                        pj.setStyle(this,{
                            "width":"0px",
                            "height":"0px",
                            "opacity":0,
                            "display":"block"
                        });
                }).animate({
                "width":w,
                "height":h,
                "opacity":opu
            },duration,fn,false,"show");
        },

        //参数都可选
        fadeIn:function(duration,fn){
            if(this.timer["fadeIn"])return this;
            var opu=[],v;
            return this.stop("fadeOut").each(function(){
                setDisplay(this);
                v=this.getAttribute("pjopacity")
                if(v){
                    v=parseFloat(v);
                }
                else{
                    v=parseFloat(pj.getStyle(this,"opacity"));
                    this.setAttribute("pjopacity",v+"");//pjopacity只设置一次而且不会删除
                }
                opu.push(v)
                if(pj.getStyle(this,"display")=="none")
                    pj.setStyle(this,{
                        "opacity":0,
                        "display":"block"
                    });
            }).animate({
                "opacity":opu
            },duration,fn,false,"fadeIn");
        },

        //参数都可选
        fadeOut:function(duration,fn){
            if(this.timer["fadeOut"])return this;
            return this.stop("fadeIn").each(function(){
                //pjopacity只设置一次而且不会删除
                if(!this.getAttribute("pjopacity")){
                    this.setAttribute("pjopacity",pj.getStyle(this,"opacity")+"");
                }
            }).animate({
                "opacity":0
            },duration,fn,true,"fadeOut");
        }
    });


    /****将pj映射到全局对象上****/
    wnd.pj=pj;
})(window);
/**
 *tween.算法来源：http://www.robertpenner.com/easing/
 *easeIn: 先慢后快
 *easeOut: 先快后慢
 *easeInOut: 两端慢，中间快
 *从quad、cubic、quart、quint、expo、circ、back、bounce,效果变化程度递增
 *参数: t,b,c,d 分别是时间、开始位置、变化区间、变化时长。其中 0<= t <=d,t每次递增1,当t>d时完成
 */
var tween = {
    linear: function(t,b,c,d){
        return c*t/d + b;
    },
    quad: {
        easeIn: function(t,b,c,d){
            return c*(t/=d)*t + b;
        },
        easeOut: function(t,b,c,d){
            return -c *(t/=d)*(t-2) + b;
        },
        easeInOut: function(t,b,c,d){
            if ((t/=d/2) < 1) return c/2*t*t + b;
            return -c/2 * ((--t)*(t-2) - 1) + b;
        }
    },
    cubic: {
        easeIn: function(t,b,c,d){
            return c*(t/=d)*t*t + b;
        },
        easeOut: function(t,b,c,d){
            return c*((t=t/d-1)*t*t + 1) + b;
        },
        easeInOut: function(t,b,c,d){
            if ((t/=d/2) < 1) return c/2*t*t*t + b;
            return c/2*((t-=2)*t*t + 2) + b;
        }
    },
    quart: {
        easeIn: function(t,b,c,d){
            return c*(t/=d)*t*t*t + b;
        },
        easeOut: function(t,b,c,d){
            return -c * ((t=t/d-1)*t*t*t - 1) + b;
        },
        easeInOut: function(t,b,c,d){
            if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
            return -c/2 * ((t-=2)*t*t*t - 2) + b;
        }
    },
    quint: {
        easeIn: function(t,b,c,d){
            return c*(t/=d)*t*t*t*t + b;
        },
        easeOut: function(t,b,c,d){
            return c*((t=t/d-1)*t*t*t*t + 1) + b;
        },
        easeInOut: function(t,b,c,d){
            if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
            return c/2*((t-=2)*t*t*t*t + 2) + b;
        }
    },

    expo: {
        easeIn: function(t,b,c,d){
            return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
        },
        easeOut: function(t,b,c,d){
            return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
        },
        easeInOut: function(t,b,c,d){
            if (t==0) return b;
            if (t==d) return b+c;
            if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
            return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
        }
    },
    circ: {
        easeIn: function(t,b,c,d){
            return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
        },
        easeOut: function(t,b,c,d){
            return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
        },
        easeInOut: function(t,b,c,d){
            if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
            return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
        }
    },

    back: {
        easeIn: function(t,b,c,d,s){
            if (s == undefined) s = 1.70158;
            return c*(t/=d)*t*((s+1)*t - s) + b;
        },
        easeOut: function(t,b,c,d,s){
            if (s == undefined) s = 1.70158;
            return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
        },
        easeInOut: function(t,b,c,d,s){
            if (s == undefined) s = 1.70158;
            if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
            return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
        }
    },
    bounce: {
        easeIn: function(t,b,c,d){
            return c - tween.bounce.easeOut(d-t, 0, c, d) + b;
        },
        easeOut: function(t,b,c,d){
            if ((t/=d) < (1/2.75)) {
                return c*(7.5625*t*t) + b;
            } else if (t < (2/2.75)) {
                return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
            } else if (t < (2.5/2.75)) {
                return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
            } else {
                return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
            }
        },
        easeInOut: function(t,b,c,d){
            if (t < d/2) return tween.bounce.easeIn(t*2, 0, c, d) * .5 + b;
            else return tween.bounce.easeOut(t*2-d, 0, c, d) * .5 + c*.5 + b;
        }
    }
};