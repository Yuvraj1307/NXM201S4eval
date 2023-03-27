const mongoose=require("mongoose")
const weatherschema=mongoose.Schema({
    coord: { lon: Number, lat: Number },
    weather: [ { id: Number, main: String, description: String, icon: String } ],
    clouds: { all: Number },
   
    sys: { country: String, sunrise: Number, sunset: Number },
    timezone: Number,
    id: Number,
    name:  String,
})
const weathermodel=mongoose.model("weather",weatherschema)
module.exports={
    weathermodel
}