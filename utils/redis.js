const redis = require('redis');

const redisClient = redis.createClient({
  legecyMode: true
});

const connect= async()=>{
  try {
    await redisClient.connect();
  } catch (error) {
    console.log(error)
  }
}
connect();  

module.exports = redisClient