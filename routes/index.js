var express = require('express');
var md5=require('blueimp-md5');
var router = express.Router();
const {User,Chat}=require('../db/models.js')
const filter={password:0,__v:0}

//注册的路由
router.post('/register', function(req, res, next) {
	const {username,password,type}=req.body
	User.findOne({username},function(err,user){
		if(user){
			res.send({code:1,msg:'此用户已存在'})
		}
		else{
			const user=new User({username,type,password:md5(password)})
			user.save(function(err,user){
				if(user){
					res.cookie('userid',user._id,{maxAge:1000*60*60*24*7})
					res.send({code:0,data:{username,type,id:user._id}})
				}
			})
		}
	})

});

//登录的路由
router.post('/login',function(req,res){
	const {username,password}=req.body
	User.findOne({username,password:md5(password)},filter,function(err,user){
		if(user){
			res.cookie('userid',user._id,{maxAge:1000*60*60*24*7})
			res.send({code:0,data:user})
		}
		else{
			res.send({code:1,msg:'用户名或密码错误'})
		}
	})
})

//更新用户信息的路由
router.post('/update',function(req,res){
	const user=req.body
	const userid=req.cookies.userid
	if(!userid){//cookie中没有userid是没登录,要求登录
		return res.send({code:1,msg:'请先登录'})
	}else{
		User.findByIdAndUpdate({_id:userid},user,function(error,oldUser){
			if(!oldUser){
				res.clearCookie('userid')
				res.send({code:1,msg:'请先登录'})
			}else{
				const {_id,username,type}=oldUser
				const data=Object.assign({_id,username,type},user)
				res.send({code:0,data})
			}
		})
	}
})


//获取用户信息的路由(根据cookie中的userid)
router.get('/user',function(req,res){
	const userid=req.cookies.userid
	if(!userid){//如果没有userid
		return res.send({code:1,msg:'请先登录'})
	}
	//如果有
	User.findOne({_id:userid},filter,function(error,user){
		res.send({code:0,data:user})
	})
})


//获取用户列表的路由
router.get('/userlist',function(req,res){
	const {type}=req.query 
	User.find({type},filter,function(error,users){
		if(!error){
			res.send({code:0,data:users})
		}
	})
	
})

//获取当前用户所有相关聊天信息列表
router.get('/msglist',function(req,res){
	//获取cookie中的userid
	const userid=req.cookies.userid
	//查询得到所有user文档数组
	User.find(function(err,userDocs){
		//用对象存储所有的user信息:key为user的id,val为name和header组成的user对象
		const users={}//对象容器
		userDocs.forEach(doc=>{
			users[doc._id]={username:doc.username,header:doc.header}
		})
		
		/* 
		查询userid相关的所有聊天信息
		参数1:查询条件
		参数2:过滤条件
		参数3:回调函数
		 */
		Chat.find({'$or':[{from:userid},{to:userid}]},filter,function(err,chatMsgs){
			//返回所有用户和当前用户相关的所有聊天数据
			res.send({code:0,data:{users,chatMsgs}})
		})
	})
})

//修改信息为已读
router.post('/readmsg',function(req,res){
	//得到请求中的from和to
	const from =req.body.from 
	const to=req.cookies.userid 
	/* 
	 更新数据库中chat数据
	 */
	Chat.update({from,to,read:false},{read:true},{multi:true},function(err,doc){
		res.send({code:0,nModified:doc.nModified})//nModified为更新数量
	})
})

module.exports = router;
