const mongoose=require("mongoose")
const userschema=mongoose.Schema({
    name:String,
    mail:String,
    pass:String,

})

const usermodel=mongoose.model("users",userschema)

module.exports={
    usermodel
}