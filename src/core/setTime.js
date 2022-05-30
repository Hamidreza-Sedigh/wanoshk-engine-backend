const Timeinfo = require('../models/Timeinfo');

module.exports = {
    async setFetchTime(){
        console.log("SET TIME Called:", new Date());
        const updateLastTime = await Timeinfo.create({
            lastTimeFetch: new Date()
        });
            
    }
}