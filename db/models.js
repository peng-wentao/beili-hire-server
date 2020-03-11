var mongoose=require('mongoose')
mongoose.connect('mongodb://localhost/beili-hire')  //连接数据库

const con=mongoose.connection //获取连接对象

con.on('connected',function(){console.log("数据库已连接")}) //监听数据库是否连接

//user的model
var Schema=mongoose.Schema
var userSchema=new Schema({
	username:{type:String,required:true},
	password:{type:String,required:true},
	type:{type:String,required:true},
	header:{type:String},
	post:{type:String},
	info:{type:String},
	company:{type:String},
	salary:{type:String}
})
const User=mongoose.model('User',userSchema)

//定义chats集合的文档结构
const chatSchema=new Schema({
	from:{type:String,required:true},//发送用户的id
	to:{type:String ,required:true},//接收用户的id
	chat_id:{type:String,required:true},//from和to组成的字符串
	content:{type:String,required:true},//消息内容
	read:{type:Boolean,default:false},//标识是否已读
	create_time:{type:Number}//创建时间
})
const Chat=mongoose.model('Chat',chatSchema)


exports.User=User
exports.Chat=Chat


