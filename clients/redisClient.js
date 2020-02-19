const redis = require("redis");

const REDIS_SERVER = '127.0.0.1';
const REDIS_PORT = 6379;

const redisClient = redis.createClient({
    host: REDIS_SERVER,
    port: REDIS_PORT
});

redisClient.on("error", function(error) {

});

module.exports = {
    redisClient
}