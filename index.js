var socket=io.connect(`ws://${location.hostname}:${location.port}/`);
socket.on('connect',function(){
    alert('连接成功');
    var room=location.hash;
    if(room.startsWith('#')){
        socket.emit('join',room.slice(1));
    }
});
socket.on('disconnect',function(){
    alert('断开连接');
});
//客户端监听服务器端的message事件，当收到服务器端发送的消息时，执行对应的回调函数
/* socket.on('message',function(msg){
     console.log(msg);
 });*/

/*
* 1.给发言的按钮绑定onclick事件，当事件发生的时候先取到文本框的内容，并发送给服务器；
* 2.服务器收到消息后把此广播给所有的客户端；
* 3.客户端收到消息后要把此消息添加到消息列表里
* */
let oBtn=document.getElementById('btn');
let content=document.getElementById('content');
let oList=document.getElementById('list');
    oBtn.onclick= function () {
        var value=content.value;
        socket.send(value);
        content.value='';
    };
socket.on('messages',function(messages){
    oList.innerHTML=messages.map(function(msgObj){
        return `<li class="list-group-item"><span class="userName">${msgObj.userName}</span>:${msgObj.content}<span class="pull-right">${msgObj.createAt}</span></li>`
    }).join('');

});
socket.on('message',function(msgObj){ //userName content createAt
    var oLi=document.createElement('li');
    oLi.innerHTML=`<span class="userName">${msgObj.userName}</span>:${msgObj.content}<span class="pull-right">${msgObj.createAt}</span>`;
    oLi.className='list-group-item';
    oList.appendChild(oLi);
});
$('.list-group').delegate('.userName','click',function(){
    content.value=`@${$(this).html()} `;

})