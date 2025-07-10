const Event = require('../models/Event');
const Timeinfo = require('../models/Timeinfo');
const jwt =      require('jsonwebtoken');
const News = require('../models/News');


module.exports = {
    getEventById(req,res){
        jwt.verify(req.token, 'secret', async(err, authData) => {
            if (err) {
                res.sendStatus(401);
            } else {
                const { eventId } = req.params;
                try {
                    const events = await Event.findById(eventId)

                    if(events){
                        return res.json({ authData, events })
                    }    
                } catch (error) {
                    return res.status(400).json({ message: 'EventId does not exist'});
                }
            }
            
        });
    },
    
    getAllEvents(req,res){
        // req.io
        // req.connectUsers[]
        jwt.verify(req.token, 'secret', async(err, authData) => {
            if(err){
                res.sendStatus(401);
            } else {
                const { sport } = req.params;
                const query = sport ? {sport} : {}
                try {
                    const events = await Event.find(query)
                    if(events){
                        return res.json({authData, events})
                    }    
                } catch (error) {
                    return res.status(400).json({ message: 'we font have any event yet'});
                }
            }
        });
        
    },

    getEventsByUserId(req,res){
        jwt.verify(req.token, 'secret', async(err, authData) => {
            if (err) {
                
            } else {
                //console.log("routes working!@#",req);
                const { user_id } = req.headers;
                console.log("user_id", user_id);
                
                try {
                    const events = await Event.find({user: authData.user._id})
                    if(events){
                        return res.json({authData, events})
                    }    
                } catch (error) {
                    return res.status(400).json({ message: `we dont have any event by this userId  ${user_id}`});
                }
            }
            
        });
    },

    getLastTime(req, res){
        jwt.verify(req.token, 'secret', async(err, authData) => {
            if (err) {
                console.log("ERROR in getLastTime jwt");
            } else {
                try {
                    const lastTime = await Timeinfo.find({}).sort({ lastTimeFetch: -1 }).limit(1);
                    if(lastTime){
                        return res.json({authData, lastTime})
                    }    
                } catch (error) {
                    return res.status(400).json({ message: `we dont have any time yet`});
                }
            }
        });
    },

    getNewsCounts(req, res){
        console.log("getNewsCounts started..");
        jwt.verify(req.token, 'secret', async(err, authData) => {
            console.log("getNewsCounts jwt verified");
            if (err) {
                console.log("ERROR in getLastTime jwt");
            } else {
                try {
                    // const newsCount = await News.find({}).count()
                    const newsCount = await News.find({}).countDocuments()
                    if(newsCount){
                        return res.json({authData, newsCount})
                    }    
                } catch (error) {
                    return res.status(400).json({ message: `we dont have any news yet`});
                }
            }
        });
    },

    async getNewsById(req, res){
        const {newsId} = req.params;  // jean
        console.log("req:::", req.params);
        try {
            const news = await News.findById(newsId);
            //console.log("news:", news);
            return res.json(news)
        } catch (error) {
            return res.status(400).json({
                message: "news Id does not exist! Do you want to register"
            });
            
        }
    }
}