var redis = require('redis');
module.exports = redis.createClient(process.env.PORT || 6379);