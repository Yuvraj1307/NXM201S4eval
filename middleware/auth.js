const jwt=require("jsonwebtoken")
const {client}=require("../config/redis")
require('dotenv').config()

const auth=async (req,res,next)=>{
    let token = req.headers.authorization?.split(" ")[1]
    if(!token){
        return res.send("please login first")
    }

    let blocked=await client.lRange("blacklist",0,-1)

    if(blocked.includes(token)){
        return res.send("please login again")
    }

    jwt.verify(token, process.env.normal, function(err, decoded) {
            req.body.userid=decoded.userid
            next()
      });
}


module.exports={
    auth
}
