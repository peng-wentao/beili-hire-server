const {Chat}=require('../db/models.js')
module.exports=function(server){
	const io=require('socket.io')(server)
	
	//监视客户端与服务器的连接
	io.on('connection',function(socket){
		console.log('有客户端与服务器连接')
		socket.on('sendMsg',function({from,to,content}){
			//console.log(data)
			//准备数据
			const create_time=Date.now()
			const chat_id=[from,to].sort().join('_')
			//存储数据
			new Chat({from,to,chat_id,content,create_time}).save(function(err,chatMsg){
				if(chatMsg){
					io.emit('receiveMsg',chatMsg)
				}
			})
		})
	})
}