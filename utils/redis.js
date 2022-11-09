const redis = require('redis');

const redisClient = redis.createClient({
  legacyMode: true
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