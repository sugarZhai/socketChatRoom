const express=require('express');
const path=require('path');

const app=express();
app.use(express.static(__dirname));
app.get('/',(req,res)=>{
    res.sendFile(path.resolve('index.html'));
});

const server=require('http').createServer(app);
//io是websocket服务器端实例
const io=require('socket.io')(server);
let messages=[];
let sockets={};//用来存放用户名和socket对象的对应关系
//监听客户端的请求，请求到达服务器的时候执行回调函数，并传递为此连接创建的socket对象
io.on('connection',(socket)=>{
    let userName;//此客户端的用户名
    let currentRoom;
    socket.emit('messages',messages);//每当有客户端连接上来的时候，就发送存着消息的数组
    socket.send({userName:'系统消息',content:'请输入昵称',createAt:new Date().toLocaleString()});
    socket.on('join',(room)=>{//在服务端接收到join事件后，服务器端对应的socket进入到对应的房间内
        currentRoom=room;
        socket.join(room);
    });
    socket.on('message',(msg)=>{
        if(userName){
            //如果用户名已经设置过了表示是正常的发言
            let setResult=msg.match(/@(.+?)+\s(.+)/);
            if(setResult){
                let toUser=setResult[1];//想跟谁说悄悄话
                let content=setResult[2];//说话的内容
                let toSocket=sockets[toUser];
                //判断要接收的socket在不在线，如在线，用send给这个socket发送消息
                if(toSocket){
                    toSocket.send({userName,content,createAt:new Date().toLocaleString()})
                }else{
                    socket.send({userName:'系统消息',content:`${toUser}不在线`,createAt:new Date().toLocaleString()})
                }
            }else{
                messages.push({userName,content:msg,createAt:new Date().toLocaleString()})
                if(currentRoom){
                    io.in(currentRoom).emit('message',{userName,content:msg,createAt:new Date().toLocaleString()})
                }else {
                    io.emit('message',{userName,content:msg,createAt:new Date().toLocaleString()})
                }
            }
        }else{//没有用户名表示是新加入的
            if(sockets[msg]){//说明发过来的昵称是别人已经用过的了
                socket.send({userName:'系统消息',content:`${msg}已经被占用，请更换`,createAt:new Date().toLocaleString()})
            }else{
                userName=msg;
                sockets[userName]=socket; //把此用户名和此socket的对应关系存起来
                io.emit('message',{userName:'系统消息',content:`欢迎${userName}加入聊天室`,createAt:new Date().toLocaleString()})
            }
        }
    })
});
server.listen(3111);
