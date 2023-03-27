const redis=require("redis")
require('dotenv').config()
const client=redis.createClient({
    url:process.env.redisurl
})

client.on('error', err => console.log('Redis Client Error', err));
client.connect()
module.exports={
    client
}